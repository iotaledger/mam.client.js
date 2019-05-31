const crypto = require('crypto')
const Encryption = require('./encryption')
const converter = require('@iota/converter')
const { composeAPI } = require('@iota/core')
const { createHttpClient } = require('@iota/http-client')
const { createContext, Reader, Mode } = require('../lib/mam')

// Setup Provider
let provider = null;
let attachToTangle = null;
let Mam = {}

/**
 * Initialisation function which returns a state object
 * @param {object || string} settings object or external provider
 * @param {string} [settings.provider] - Http `uri` of IRI node
 * @param {Provider} [settings.network] - Network provider to override with
 * @param {function} [settings.attachToTangle] - AttachToTangle function to override with
 * @param {string} seed
 * @param {integer} security
 * @returns {object} State object to be used with future actions.
 */
const init = (settings, seed = keyGen(81), security = 2) => {
    if (typeof settings === 'object') {
        // Set IOTA provider
        provider = settings.provider

        if (settings.attachToTangle) {
            // Set alternative attachToTangle function
            attachToTangle = settings.attachToTangle
        }
    } else {
        // Set IOTA provider
        provider = settings
    }

    // Setup Personal Channel
    const channel = {
        side_key: null,
        mode: 'public',
        next_root: null,
        security,
        start: 0,
        count: 1,
        next_count: 1,
        index: 0
    }

    return {
        subscribed: [],
        channel,
        seed
    }
}
/**
 * Add a subscription to your state object
 * @param {object} state The state object to add the subscription to.
 * @param {string} channelRoot The root of the channel to subscribe to.
 * @param {string} channelMode Can be `public`, `private` or `restricted`.
 * @param {string} channelKey Optional, the key of the channel to subscribe to.
 * @returns {object} Updated state object to be used with future actions.
 */
const subscribe = (state, channelRoot, channelMode = "public", channelKey = null) => {
    state.subscribed[channelRoot] = {
        channelKey,
        mode: channelMode,
        timeout: 5000,
        root: channelRoot,
        next_root: null,
        active: true
    }
    return state
}

/**
 * Change the mode for the mam state
 * @param {object} state
 * @param {string} mode [public/private/restricted]
 * @param {string} sidekey, required for restricted mode
 * @returns {object} Updated state object to be used with future actions.
 */
const changeMode = (state, mode, sidekey = null) => {
    if (mode !== 'public' && mode !== 'private' && mode !== 'restricted') {
        throw new Error('The mode parameter should be public, private or restricted')
    }
    if (mode === 'restricted' && !sidekey) {
        throw new Error('You must specify a side key for restricted mode');
    }
    if (sidekey) {
        state.channel.side_key = typeof sidekey === 'string' ? sidekey.padEnd(81, '9') : sidekey
    }
    state.channel.mode = mode
    return state
}

/**
 * Creates a MAM message payload from a state object.
 * @param {object} state The current mam state.
 * @param {string} message Tryte encoded string.
 * @returns {object} Updated state object to be used with future actions.
 */
const create = (state, message) => {
    const channel = state.channel
    // Interact with MAM Lib
    const mam = Mam.createMessage(state.seed, message, channel.side_key, channel)

    // If the tree is exhausted.
    if (channel.index === channel.count - 1) {
        // change start to begining of next tree.
        channel.start = channel.next_count + channel.start
        // Reset index.
        channel.index = 0
    } else {
        // Else step the tree.
        channel.index++
    }

    // Advance Channel
    channel.next_root = mam.next_root
    state.channel = channel

    // Generate attachement address
    let address
    if (channel.mode !== 'public') {
        address = converter.trytes(
            Encryption.hash(81, converter.trits(mam.root.slice()))
        )
    } else {
        address = mam.root
    }

    return {
        state,
        payload: mam.payload,
        root: mam.root,
        address
    }
}

/**
 * Get the root from the mam state.
 * @param {object} state The mam state.
 * @returns {string} The root.
 */
const getRoot = state => Mam.getMamRoot(state.seed, state.channel)

/**
 * Enables a user to decode a payload
 * @param {string} payload Tryte-encoded payload.
 * @param {string} sidekey Tryte-encoded encryption key. Null value falls back to default key
 * @param {string} root Tryte-encoded string used as the address to attach the payload.
 */
const decode = (payload, sidekey, root) => {
    const key = typeof sidekey === 'string' ? sidekey.padEnd(81, '9') : sidekey
    return Mam.decodeMessage(payload, key, root)
}

/**
 * Fetches the channel sequentially from a known `root` and optional `sidekey`
 * @param {string} root Tryte-encoded string used as the entry point to a channel.
 * @param {string} selectedMode Can one of `public`, `private` or `restricted`
 * @param {string} sidekey Tryte-encoded encryption key for restricted mode
 * @param {function} callback Optional callback for each payload retrieved
 * @param {number} limit Optional, limits the number of items returned
 * @returns {object} List of messages and the next root.
 */
const fetch = async (root, selectedMode, sidekey, callback, limit) => {
    let client = createHttpClient({ provider, attachToTangle })
    let ctx = await createContext()
    const messages = []
    const mode = selectedMode === 'public' ? Mode.Public : Mode.Old
    let hasMessage = false
    let nextRoot = root
    let localLimit = limit || Math.pow(2, 53) - 1

    try {
        do {
            let reader = new Reader(ctx, client, mode, nextRoot, sidekey || '')
            const message = await reader.next()
            hasMessage = message && message.value && message.value[0]
            if (hasMessage) {
                nextRoot = message.value[0].message.nextRoot
                const payload = message.value[0].message.payload

                // Push payload into the messages array
                messages.push(payload)

                // Call callback function if provided
                if (callback) {
                    callback(payload)
                }
            }
        } while (!!hasMessage && messages.length < localLimit)
        return { messages, nextRoot }
    } catch (e) {
        return e
    }
}

/**
 * Fetches a single message from a known `root` and optional `sidekey`
 * @param {string} root Tryte-encoded string used as the entry point to a channel.
 * @param {string} selectedMode Can one of `public`, `private` or `restricted`
 * @param {string} sidekey Tryte-encoded encryption key for restricted mode
 * @returns {object} The payload and the next root.
 */
const fetchSingle = async (root, selectedMode, sidekey) => {
    const response = await fetch(root, selectedMode, sidekey, undefined, 1)
    return response && response.nextRoot ? {
        payload: response.messages && response.messages.length === 1 ? response.messages[0] : undefined,
        nextRoot: response.nextRoot
    } : response
}

/**
 * Listen to a channel for new messages.
 * @param {Object} channel The channel object to listen to.
 * @param {Function} callback Callback called when new messages arrive.
 */
const listen = (channel, callback) => {
    let root = channel.root
    return setTimeout(async () => {
        let resp = await fetch(root, channel.mode, channel.channelKey)
        root = resp.nextRoot
        callback(resp.messages)
    }, channel.timeout)
}

/**
 * Attaches a payload to the Tangle.
 * @param {string} trytes Tryte-encoded payload to be attached to the Tangle.
 * @param {string} root Tryte-encoded string returned from the `Mam.create()` function.
 * @param {number} depth Optional depth at which Random Walk starts, defaults to 3.
 * @param {number} mwm Optional minimum number of trailing zeros in transaction hash, defaults to 9.
 * @param {string} tag Tag to use when attaching transactions.
 * @returns {array} Transaction objects that have been attached to the network.
 */
const attach = async (trytes, root, depth = 3, mwm = 9, tag = '') => {
    const transfers = [
        {
            address: root,
            value: 0,
            message: trytes,
            tag: tag
        }
    ]
    try {
        const { prepareTransfers, sendTrytes } = composeAPI({ provider, attachToTangle })

        const trytes = await prepareTransfers('9'.repeat(81), transfers, {})

        return sendTrytes(trytes, depth, mwm)
    } catch (e) {
        throw `failed to attach message: ${e}`
    }
}

const keyGen = length => {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9'
    let key = ''
    while (key.length < length) {
        let byte = crypto.randomBytes(1)
        if (byte[0] < 243) {
            key += charset.charAt(byte[0] % 27)
        }
    }
    return key
}

const setupEnv = rustBindings => (Mam = rustBindings)

const setIOTA = (externalProvider = null) => (provider = externalProvider)

const setAttachToTangle = (externalAttachToTangle = null) => (attachToTangle = externalAttachToTangle)

module.exports = {
    init,
    subscribe,
    changeMode,
    create,
    decode,
    fetch,
    fetchSingle,
    attach,
    listen,
    getRoot,
    setIOTA,
    setAttachToTangle,
    setupEnv
}
