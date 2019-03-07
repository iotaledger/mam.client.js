const Curl = require('@iota/curl').default

function hash(rounds, ...keys) {
    const curl = new Curl(rounds)
    const key = new Int8Array(Curl.HASH_LENGTH)
    curl.initialize()
    keys.map(k => curl.absorb(k, 0, Curl.HASH_LENGTH))
    curl.squeeze(key, 0, Curl.HASH_LENGTH)
    return key
}

module.exports = {
    hash
}
