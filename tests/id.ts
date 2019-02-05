import test from 'ava';

import * as MAM from '../lib/mam';

test('id', async t => {
    let ctx = await MAM.createContext();

    let seed = new MAM.Seed(ctx, "B".repeat(81), 1);
    let idxSeed = new MAM.IndexedSeed(seed, 0);

    let tree = new MAM.MerkleTree(ctx, idxSeed, 8);
    let chan = new MAM.Channel(ctx, MAM.Mode.Public, tree, tree);

    t.is(chan.id(), 'MIR9RAAJFAMELZCPYLIJKLGFNLOSCGHAPDTUMNNQZDOONLEIXMBOIOXGUC9IOFOJSAWBNVKXGM9YNJQTX');

});

test('regression test Old', async t => {
    let root = 'XJRTLCDZIEERKF9LNNAPLZXAINCBTWKXWSNPXQBXPNZHMQGTZQUZVBJCBOXVGTREXTMGFJUKRTHGHDVML';
    let sideKey = 'DFWLYDBLUUABRDDCAJHZVMYNKGVNLRRGY9VRBM9WNBCAZYQYTSFSYPUNOSVHSVXIYLBAEBXJRJKQZIRHJ';

    let id = MAM.getIDForMode(MAM.Mode.Old, root, sideKey);

    t.is(id,
        'LJPKOTTCYCSSHGFPPJDRZCCMWEXR9IUGDYN99OBV9KDGFMIBLOIEUJH9WNRLSVZGQDYLKKJHHOOGNDZPT');
})
