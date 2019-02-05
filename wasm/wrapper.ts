import { trits, trytes } from '@iota/converter';
import { Transaction, createFindTransactionObjects, Provider } from '@iota/core';

import * as H from './helpers';
import { MaybeMessage, NativeContext, Mode, decodeMessage, getIDForMode } from './bindings';

export class ReadResult {

}

export class ReadCandidate {
    constructor(public tail: string, public message: MaybeMessage) { }
}

function makeResult(w: ReadCandidate[]): IteratorResult<ReadCandidate[]> {
    return { done: false, value: w };
}

export class Reader implements AsyncIterator<ReadCandidate[]>{

    constructor(private _ctx: NativeContext, private _provider: Provider, private _mode: Mode, private _root: string, private _sideKey: string = '9'.repeat(81)) {
        H.assertHash(_root);
    }

    listenAddress(): string {
        return getIDForMode(this._mode, this._root, this._sideKey);
    }

    changeRoot(nextRoot: string) {
        this._root = nextRoot;
    }

    next(arg?: any): Promise<IteratorResult<ReadCandidate[]>> {

        // Bypass TypeScript oddities, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11027
        return createFindTransactionObjects(this._provider)({ addresses: [this.listenAddress()] }).then(txs => {

            if (txs.length === 0) {
                return makeResult([]);
            }

            const bundles: Map<string, Array<Transaction>> = new Map<string, Array<Transaction>>();
            txs.forEach(tx => {
                const v = bundles.get(tx.bundle);
                if (!v) {
                    bundles.set(tx.bundle, [tx]);
                } else {
                    v.push(tx);
                }
            });

            const messages: { hash: string, msg: string }[] = [];

            bundles.forEach((txs, bundle) => {
                let length = txs[0].lastIndex + 1;
                if (txs.length < length) return;

                let tails = txs.filter(tx => tx.currentIndex == 0);

                for (let candidate of tails) {
                    let msg = candidate.signatureMessageFragment;

                    let cur = candidate;
                    let next = () => txs.filter(t => t.hash == cur.trunkTransaction)[0] as Transaction | undefined;

                    while (cur.currentIndex != cur.lastIndex && next()) {
                        cur = next() as Transaction;
                        msg += cur.signatureMessageFragment;
                    }

                    if (cur.currentIndex == cur.lastIndex) {
                        messages.push({ hash: candidate.hash, msg: msg });
                    }
                }
            });

            let decoded = messages.map(m => new ReadCandidate(m.hash, decodeMessage(this._ctx, this._root, m.msg, this._sideKey)));


            return makeResult(decoded);
        }) as unknown as Promise<IteratorResult<ReadCandidate[]>>;
    }

}
