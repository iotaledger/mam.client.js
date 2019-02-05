	/// <reference types="webassembly-js-api" />
	export class NativeContext {
	    private _wasm;
	    constructor(_wasm: WebAssembly.ResultObject);
	    fns(): any;
	}
	export interface Native {
	    native(): any;
	    discard(): void;
	}
	export class Seed implements Native {
	    private _ctx;
	    private _seed;
	    private _security;
	    private _ptr?;
	    constructor(_ctx: NativeContext, _seed: string, _security: number);
	    seed(): string;
	    security(): number;
	    native(): any;
	    discard(): void;
	}
	export class IndexedSeed implements Native {
	    private _seed;
	    private _index;
	    constructor(_seed: Seed, _index: number);
	    seed(): Seed;
	    index(): number;
	    security(): number;
	    next(): IndexedSeed;
	    native(): any;
	    discard(): void;
	}
	export class MerkleTree implements Native {
	    private _ctx;
	    private _seed;
	    private _size;
	    private _root?;
	    private _ptr?;
	    constructor(_ctx: NativeContext, _seed: IndexedSeed, _size: number);
	    seed(): IndexedSeed;
	    root(): string;
	    size(): number;
	    branch(index: number): MerkleBranch;
	    native(): any;
	    discard(): void;
	}
	export class MerkleBranch implements Native {
	    private _ctx;
	    private _tree;
	    private _index;
	    private _siblings;
	    private _native;
	    constructor(_ctx: NativeContext, _tree: MerkleTree, _index: number, _siblings: Array<string>, _native: any);
	    tree(): MerkleTree;
	    index(): number;
	    siblings(): Array<string>;
	    native(): any;
	    discard(): void;
	}
	export class EncodedMessage {
	    payload: string;
	    sideKey: string;
	    tree: MerkleTree;
	    nextTree: MerkleTree;
	    constructor(payload: string, sideKey: string, tree: MerkleTree, nextTree: MerkleTree);
	}
	export enum Error {
	    None = 0,
	    InvalidHash = 1,
	    InvalidSignature = 2,
	    ArrayOutOfBounds = 3,
	    TreeDepleted = 4,
	    InvalidSideKeyLength = 5
	}
	export enum Mode {
	    Public = 0,
	    Old = 1,
	    Private = 2,
	    Restricted = 3
	}
	export function getIDForMode(mode: Mode, root: string, sideKey?: string): string;
	export class Channel {
	    private _ctx;
	    private _mode;
	    private _currentTree;
	    private _nextTree;
	    private _currentIndex;
	    constructor(_ctx: NativeContext, _mode: Mode, _currentTree: MerkleTree, _nextTree: MerkleTree);
	    mode(): Mode;
	    id(sideKey?: string): string;
	    transition(next: MerkleTree): Channel;
	    encode(message: string, sideKey?: string): EncodedMessage | Error;
	}
	export class DecodedMessage {
	    payload: string;
	    nextRoot: string;
	    constructor(payload: string, nextRoot: string);
	}
	export type MaybeMessage = DecodedMessage | Error;
	export function decodeMessage(ctx: NativeContext, root: string, payload: string, sideKey?: string): MaybeMessage;

	import 'fast-text-encoding';
	import { NativeContext } from './bindings';
	export function assertHash(s: string): void;
	export function stringToCTrits(ctx: NativeContext, str: string): any;
	export function ctritsToString(ctx: NativeContext, ct: any): string;
	export function padKey(key: any): string;

	import 'idempotent-babel-polyfill';
	export * from './bindings';
	export * from './helpers';
	export * from './wrapper';
	import { NativeContext } from './bindings';
	export function createContext(opts?: any): Promise<NativeContext>;

	import { Provider } from '@iota/core';
	import { MaybeMessage, NativeContext, Mode } from './bindings';
	export class ReadResult {
	}
	export class ReadCandidate {
	    tail: string;
	    message: MaybeMessage;
	    constructor(tail: string, message: MaybeMessage);
	}
	export class Reader implements AsyncIterator<ReadCandidate[]> {
	    private _ctx;
	    private _provider;
	    private _mode;
	    private _root;
	    private _sideKey;
	    constructor(_ctx: NativeContext, _provider: Provider, _mode: Mode, _root: string, _sideKey?: string);
	    listenAddress(): string;
	    changeRoot(nextRoot: string): void;
	    next(arg?: any): Promise<IteratorResult<ReadCandidate[]>>;
	}

