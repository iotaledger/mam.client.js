import test from 'ava';

import * as MAM from '../lib/mam';

test('ctrits back and forth', async t => {
    let ctx = await MAM.createContext();

    let trytes = "9ABCDEFGHIJKLMNOPQRSTUVWXYZ".repeat(3);
    t.is(trytes.length, 81);
    let ctrits = MAM.stringToCTrits(ctx, trytes);
    t.not(ctrits, 0);
    let back = MAM.ctritsToString(ctx,ctrits);
    t.is(back, trytes);

/*    let seed = new MAM.Seed(ctx, "B".repeat(81), 1);
    let idxSeed = new MAM.IndexedSeed(seed, 0);

    let tree = new MAM.MerkleTree(ctx, idxSeed, 8);

    console.log(tree.root());

    tree.discard();
    seed.discard();*/
});
