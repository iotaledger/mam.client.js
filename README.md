# MAM Client JS Library

It is possible to publish transactions to the Tangle that contain only messages, with no value. This introduces many possibilities for data integrity and communication, but comes with the caveat that message-only signatures are not checked. What we introduce is a method of symmetric-key encrypted, signed data that takes advantage of merkle-tree winternitz signatures for extended public key usability, that can be found trivially by those who know to look for it.

This is wrapper library for the WASM/ASM.js output of the [IOTA Bindings repository](https://github.com/iotaledger/iota-bindings). For a more in depth look at how Masked Authenticated Messaging works please check out the [Overview](https://github.com/l3wi/mam.client.js/blob/master/docs/overview.md)

> This is a work in progress. The library is usable, however it is still evolving and may have some breaking changes in the future. These will most likely be minor, in addition to extending functionality.

## Getting Started

After downloading the appropriate file for your project, `mam.node.js` or `mam.web.js`, importing the library will provide access to the functions described below.

For a simple user experience you are advised to call the `init()` function to enable to tracking of state in your channels.When calling `init()` you should also pass in your initialised IOTA library.  This will provide access to some extra functionality including attaching, fetching and subscribing.

> *Please see example/index.js for a working example*

## Basic Usage

### `init`

This initialises the state and binds the `iota.lib.js` to the library. This will return a state object that tracks the progress of your stream and streams you are following.

#### Input

```
Mam.init(iota, seed, security)
```

1. **iota**: `Object` Initialised IOTA library with a provider set.
2. **seed**: `String` Tryte-encoded seed. *Null value generates a random seed*
3. **security**: `Integer` Security of the keys used. *Null value defaults to `2`*

#### Return

1. **Object** - Initialised state object to be used in future actions

------

### `changeMode`

This takes the state object and changes the default stream mode from `public` to the specified mode and `sidekey`. There are only three possible modes: `public`, `private`, & `restricted`. If you fail to pass one of these modes it will default to `public`. This will return a state object that tracks the progress of your stream and streams you are following.

#### Input

```
Mam.changeMode(state, mode, sidekey)
```

1. **state**: `Object` Initialised IOTA library with a provider set.
2. **mode**: `String` Intended channel mode. Can be only: `public`, `private` or `restricted`
3. **sideKey**: `String` Tryte-encoded encryption key, any length. *Required for restricted mode*

#### Return

1. **Object** - Initialised state object to be used in future actions

------

### `create`

Creates a MAM message payload from a state object, tryte-encoded message and an optional side key. Returns an updated state and the payload for sending.

#### Input

```
Mam.create(state, message)
```

1. **state**: `Object` Initialised IOTA library with a provider set.
2. **message**: `String` Tryte-encoded payload to be encrypted.

#### Return

1. **state**: `Object` Updated state object to be used with future actions.
2. **payload**: `String` Tryte-encoded payload.
3. **root**: `String` Tryte-encoded root of the payload.
4. **address**: `String` Tryte-encoded address used as an location to attach the payload.

------

### `decode`

Enables a user to decode a payload

#### Input

```
Mam.decode(payload, sideKey, root)
```

2. **payload**: `String` Tryte-encoded payload.
2. **sideKey**: `String` Tryte-encoded encryption key. *Null value falls back to default key*
3. **root**: `String` Tryte-encoded string used as the address to attach the payload.

#### Return

1. **state**: `Object` Updated state object to be used with future actions.
2. **payload**: `String` Tryte-encoded payload.
3. **root**: `String` Tryte-encoded root used as an address to attach the payload.


## Network Usage

These actions require an initialised IOTA library with a provider to be passed in when calling `Mam.init(iota)`.

------

### `attach` - async

Attaches a payload to the tangle.

#### Input

```
await Mam.attach(payload, address)
```

1. **payload**: `String` Tryte-encoded payload to be attached to the Tangle.
2. **address**: `String` Tryte-encoded string returned from the `Mam.create()` function.

#### Return

1. `Object` Transaction objects that have been attached to the network.

------

### `fetch` - async

Fetches the stream sequentially from a known `root` and optional `sidekey`. This call can be used in two ways: **Without a callback** will cause the function to read the entire stream before returning. **With a callback** the application will return data through the callback and finally the `nextroot` when finished.

See examples: `fetchSync.js` & `fetchAsync.js` usage examples.

#### Input

```
await Mam.fetch(root, mode, sidekey, callback)
```

1. **root**: `String` Tryte-encoded string used as the entry point to a stream. *NOT the address!*
2. **mode**: `String` Stream mode. Can be only: `public`, `private` or `restricted` *Null value falls back to public*
3. **sideKey**: `String` Tryte-encoded encryption key. *Null value falls back to default key*
4. **callback**: `Function` Tryte-encoded encryption key. *Null value will cause the function to read the entire stream before returning*

#### Return

1. **nextRoot**: `String` Tryte-encoded string pointing to the next root.
2. **messages**: `Array` Array of Tryte-encoded messages from the stream. *NOTE: This is only returned when the call is **not** using a callback*

## Building the library

Compiled binaries are included in the repository. Compiling the Rust bindings can require some complex environmental setup to get to work, so if you are unfamiliar just stick to the compiled files.

This repo provides wrappers for both Browser and Node environments. The build script discriminates between a WASM.js and ASM.js build methods and returns files that are includable in your project.

### Browser

The below command will build two files: `iota-bindings-emscripten.wasm` & `mam.web.js`. These need to be included in the browser (**in the above order**).

Additionally, due to quirks in the `rust-wasm-loader` you will need to pass the `--env.path` variable to match how your project will serve the file in the browser. Once loaded it will bind to the window as `Mam`.

```javascript
// Install dependencies
yarn
// Install submodules
git submodule update --init --recursive
// Build for web
yarn web -- --env.path=/serving/path/here/
```

### Node.js

The below command will build a file called `mam.node.js` in the `lib/` directory.

```javascript
// Install dependencies
yarn
// Install submodules
git submodule update --init --recursive
// Build for node
yarn node
```
