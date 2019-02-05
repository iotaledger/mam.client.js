# MAM Client JS Library

It is possible to publish transactions to the Tangle that contain only messages, with no value. This introduces many possibilities for data integrity and communication, but comes with the caveat that message-only signatures are not checked. What we introduce is a method of symmetric-key encrypted, signed data that takes advantage of merkle-tree winternitz signatures for extended public key usability, that can be found trivially by those who know to look for it.

This is wrapper library for the WASM/ASM.js output of the [IOTA Bindings repository](https://github.com/iotaledger/iota-bindings). For a more in depth look at how Masked Authenticated Messaging works please check out the [Overview](https://github.com/l3wi/mam.client.js/blob/master/docs/overview.md)

> This is a work in progress. The library is usable, however it is still evolving and may have some breaking changes in the future. These will most likely be minor, in addition to extending functionality.

## Getting Started

After downloading the appropriate file for your project, `mam.node.js` or `mam.web.js`, importing the library will provide access to the functions described below. 

For a simple user experience you are advised to call the `init()` function to enable to tracking of state in your channels.When calling `init()` you should also pass in your initialised IOTA library.  This will provide access to some extra functionality including attaching, fetching and subscribing.

> *Please see example/index.js for a working example*

## Basic Usage

To be updated

## Building the library

Compiled binaries are included in the repository. Compiling the Rust bindings can require some complex environmental setup to get to work, so if you are unfamiliar just stick to the compiled files. 

This repo provides wrappers for both Browser and Node environments. The build script discriminates between a WASM.js and ASM.js build methods and returns files that are includable in your project.

### Browser

```javascript
// Install dependencies
yarn
// Build for web
yarn web -- --env.path=/serving/path/here/     
```

### Node.js

The below command will build a file called `mam.js` in the `lib/` directory.

```javascript
// Install dependencies
yarn
// Build for node
yarn node
```



