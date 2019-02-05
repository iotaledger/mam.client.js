import test from 'ava';

import * as MAM from '../lib/mam';

test('MerkleTree::root', async t => {
    let ctx = await MAM.createContext();

    let seed = new MAM.Seed(ctx, "B".repeat(81), 1);
    let idxSeed = new MAM.IndexedSeed(seed, 0);

    let tree = new MAM.MerkleTree(ctx, idxSeed, 8);

    t.is(tree.root(), 'MIR9RAAJFAMELZCPYLIJKLGFNLOSCGHAPDTUMNNQZDOONLEIXMBOIOXGUC9IOFOJSAWBNVKXGM9YNJQTX');

    tree.discard();
    seed.discard();
});
