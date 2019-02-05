import * as H from './helpers';
import Curl from '@iota/curl';
import { trits, trytes } from '@iota/converter';

export class NativeContext {
    constructor(private _wasm: WebAssembly.ResultObject) { }
    fns(): any { return this._wasm.instance.exports; }
}

export interface Native {
    native(): any;
    discard(): void;
}

export class Seed implements Native {
    private _ptr?: any;

    constructor(private _ctx: NativeContext, private _seed: string, private _security: number) {
        H.assertHash(_seed);
    }

    seed(): string { return this._seed; }
    security(): number { return this._security; }

    native(): any {
        if (!this._ptr) {
            this._ptr = H.stringToCTrits(this._ctx, this._seed);
        }

        return this._ptr;
    }

    discard(): void {
        if (this._ptr) {
            this._ctx.fns().iota_ctrits_drop(this._ptr);
            this._ptr = undefined;
        }
    }
}

export class IndexedSeed implements Native {
    constructor(private _seed: Seed, private _index: number) { }

    seed(): Seed { return this._seed; }
    index(): number { return this._index; }
    security(): number { return this._seed.security(); }

    next(): IndexedSeed { return new IndexedSeed(this._seed, this._index + 1); }

    native(): any { return this._seed.native(); }
    discard(): void { this._seed.discard(); }
}

export class MerkleTree implements Native {
    private _root?: string;
    private _ptr?: any;

    constructor(private _ctx: NativeContext, private _seed: IndexedSeed, private _size: number) {
        if (_size == 0 || Math.log2(_size) % 1 != 0) {
            throw "MerkleTree size must be power of 2.";
        }

    }

    seed(): IndexedSeed { return this._seed; }

    root(): string {
        if (!this._root) {
            let trits = this._ctx.fns().iota_merkle_slice(this.native());
            this._root = H.ctritsToString(this._ctx, trits);
            this._ctx.fns().iota_ctrits_drop(trits);
        }

        return this._root;
    }

    size(): number { return this._size; }
    branch(index: number): MerkleBranch {
        let inst = this._ctx.fns().iota_merkle_branch(this.native(), index);
        let siblingsT = this._ctx.fns().iota_merkle_siblings(inst);
        let siblings = H.ctritsToString(this._ctx, siblingsT);
        this._ctx.fns().iota_merkle_branch_drop(inst);

        let slices = siblings.match(/.{1,81}/g) as Array<string>;

        return new MerkleBranch(this._ctx, this, index, slices, siblingsT);
    }

    native(): any {
        if (!this._ptr) {
            this._ptr = this._ctx.fns().iota_merkle_create(this._seed.seed().native(), this._seed.index(), this.size(), this._seed.security());
        }
        return this._ptr;
    }

    discard(): void {
        if (this._ptr) {
            this._ctx.fns().iota_merkle_drop(this._ptr);
            this._ptr = undefined;
        }
    }
}

export class MerkleBranch implements Native {
    constructor(private _ctx: NativeContext, private _tree: MerkleTree, private _index: number, private _siblings: Array<string>, private _native: any) { }

    tree(): MerkleTree { return this._tree; }
    index(): number { return this._index; }
    siblings(): Array<string> { return this._siblings; }

    native(): any { return this._native; }
    discard(): void {
        if (this._native != -1) {
            this._ctx.fns().iota_ctrits_drop(this._native);
            this._native = -1;
        }
    }
}

export class EncodedMessage {
    constructor(
        public payload: string,
        public sideKey: string,
        public tree: MerkleTree,
        public nextTree: MerkleTree,
    ) { }

}
export enum Error {
    None = 0,
    InvalidHash,
    InvalidSignature,
    ArrayOutOfBounds,
    TreeDepleted,
    InvalidSideKeyLength
}

export enum Mode {
    Public = 0,
    Old,
    Private,
    Restricted
}

export function getIDForMode(mode: Mode, root: string, sideKey: string = '9'.repeat(81)) {
    H.assertHash(root);

    if (mode !== Mode.Old) {
        H.assertHash(sideKey);
    }

    if (mode == Mode.Public) {
        return root;
    }


    // MAM.js uses CurlP81 whereas Rust is using CurlP27
    /*
    let keyT = H.stringToCTrits(ctx, sideKey);
    let rootT = H.stringToCTrits(ctx, root);

    let idT = ctx.fns().iota_mam_id(keyT, rootT);

    let id = H.ctritsToString(ctx, idT);

    [keyT, rootT, idT].forEach(v => ctx.fns().iota_ctrits_drop(v));

    return id;*/

    let c = new Curl();
    let rootT = trits(root);
    let keyT = trits(sideKey);
    let out = new Int8Array(243);

    if (mode != Mode.Old) {
        c.absorb(keyT, 0, 243);
    }
    c.absorb(rootT, 0, 243);
    c.squeeze(out, 0, out.length);

    return trytes(out);
}

export class Channel {
    private _currentIndex: number = 0;

    constructor(private _ctx: NativeContext, private _mode: Mode, private _currentTree: MerkleTree, private _nextTree: MerkleTree) { }

    mode(): Mode { return this._mode; }

    id(sideKey: string = '9'.repeat(81)): string {
        return getIDForMode(this.mode(), this._currentTree.root(), sideKey);
    }

    transition(next: MerkleTree): Channel {
        return new Channel(this._ctx, this._mode, this._nextTree, next);
    }

    encode(message: string, sideKey: string = '9'.repeat(81)): EncodedMessage | Error {
        if ((this._currentIndex + 1) >= this._currentTree.size()) {
            return Error.TreeDepleted;
        }

        H.assertHash(sideKey);

        let messageT = H.stringToCTrits(this._ctx, message);
        let sideKeyT = H.stringToCTrits(this._ctx, sideKey)
        let currentRootT = H.stringToCTrits(this._ctx, this._currentTree.root());
        let nextRootT = H.stringToCTrits(this._ctx, this._nextTree.root());

        let branch = this._currentTree.branch(this._currentIndex);


        let maskedT = this._ctx.fns().iota_mam_create(
            this._currentTree.seed().native(),
            messageT,
            sideKeyT,
            currentRootT,
            branch.native(),
            nextRootT,
            this._currentTree.seed().index(),
            this._currentIndex,
            this._currentTree.seed().security()
        );

        let maskedPayload = H.ctritsToString(this._ctx, maskedT);

        branch.discard();

        [maskedT, messageT, sideKeyT, currentRootT, nextRootT].forEach(v => this._ctx.fns().iota_ctrits_drop(v));

        this._currentIndex += 1;

        return new EncodedMessage(
            maskedPayload,
            sideKey,
            this._currentTree,
            this._nextTree
        );
    }
}

export class DecodedMessage {
    constructor(
        public payload: string,
        public nextRoot: string
    ) { }
}


export type MaybeMessage = DecodedMessage | Error;

export function decodeMessage(ctx: NativeContext, root: string, payload: string, sideKey: string = "9".repeat(81), mode: Mode = Mode.Public): MaybeMessage {

    H.assertHash(root);
    if (!mode || (mode && mode !== Mode.Old)) {
        H.assertHash(sideKey);
    }

    let rootT = H.stringToCTrits(ctx, root);
    let payloadT = H.stringToCTrits(ctx, payload);
    let sideKeyT = H.stringToCTrits(ctx, sideKey);

    let result;

    try {
        result = ctx.fns().iota_mam_parse(payloadT, sideKeyT, rootT);
    } catch (e) {
        console.dir(e);
        return Error.InvalidHash;
    }

    let buf = new Uint32Array(ctx.fns().memory.buffer, result, 3);

    let errorCode = buf[0];
    if (errorCode != 0) {
        return errorCode as Error;
    }

    let umPayloadT = buf[1];
    let umNextRootT = buf[2];

    let umPayload = H.ctritsToString(ctx, umPayloadT);
    let umNextRoot = H.ctritsToString(ctx, umNextRootT);

    [rootT, payloadT, sideKeyT, umPayloadT, umNextRootT].forEach(v => ctx.fns().iota_ctrits_drop(v));

    return new DecodedMessage(umPayload, umNextRoot);
}
