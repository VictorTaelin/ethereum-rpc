## Standardizing how DApps talk to Ethereum and avoiding the IE7 hell

In order for a DApp to function properly, it needs to communicate with the Ethereum network. That is often done by initializing Web3 (from [AVSA's post](https://blog.ethereum.org/2016/07/12/build-server-less-applications-mist/)):

```javascript
// Checks Web3 support
if(typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
    // If there's a web3 library loaded, then make your own web3
    web3 = new Web3(web3.currentProvider);
} else if (typeof Web3 !== 'undefined') {
    // If there isn't then set a provider
    web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
} else if(typeof web3 == 'undefined') {
    // Alert the user he is not in a web3 compatible browser
    return;  
} 
```

Problem is, this only works on browsers which support Web3, which isn't the only way to communicate with an Ethereum node. Parity, for example, does things [very differently](https://github.com/paritytech/parity/wiki/Tutorial-Part-III) with its own library, `parity.js`. Even Web3 itself will be updated soon, rendering the old initialization obsolte. That creates a scenario where either a DApp is locked to a specific platform, or the code must have a very complex initialization logic. This reminds the old, dreaded times of writing vendor-specific code to handle, for example, IE7. Hopefully, we can avoid that nightmare.

Obviously, we can't expect programmers to agree on any particular high-level library. The only possible solution is, thus, a simple, low-level, unopinionated library that communicates with Ethereum and nothing else. That library must come in the form of a single, standard object available on all Ethereum browsers (such as Mist), in the same way that `XMLHttpRequest` is available on classic browsers, giving sites a way to perform HTTP requests. Developers are, then, free to build high-level libraries on top of this object.

## Solution: a standard global function that just calls the JSON-RPC

My particular suggestion is, thus, the simplest possible: a standard `eth` function, which, when called with a method name and a list of parameters, performs a RPC call to the Ethereum network and returns the result in a callback following the Node.js convention. And that's it. This, for example, would be a "hello world" DApp using `eth`:

```javascript
// Checks if this browser supports Ethereum
if (typeof eth !== "undefined") {

  // Display the last block number on the page
  eth("eth_blockNumber", [], (err, blockNum) => {
    main.innerHTML = "The last Ethereum block number is " + blockNum + ".";
  });

// If it doesn't, alert the user
} else {
  main.innerHTML = "Your browser doesn't support Ethereum!";
}
```

Some things to notice:

1. The check for Ethereum support is as simple as `typeof eth !== "undefined"`. 

2. Methods such as `.onconnect`, `.onopen` are absent, because the connection is expected to be handled by the browser - i.e., the user choses what network to connect, not the DApp. 

3. The `eth` object is just a direct pipe to the RPC as it is. It doesn't do any kind of high-level manipulation or conversions. Results, for example, are sent in hex.

4. Higher-level libraries build themselves on top of `eth`.

    ```javascript

    // Builds Web3 on top of the native `eth`
    const web3 = new Web3(eth);

    // Uses its high-level features such as Promises and unit conversors
    web3.eth
      .getBalance("0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9")
      .then(balance => console.log("Balance on Golem's multisig:", Web3.fromWei(balance, "ether")))
    ```

5. DApp developers are able to use whatever high-level libraries they want.

6. If a high-level library updates, it won't break your DApp, because the only browser dependency is `eth`, which won't change.

6. Middleware interventions (such as Mist's pop-up asking the user permission to submit a transaction) can be done by simply decorating the `eth` function to be injected on the DApp's webview.

## This repository

This repository contains a demo implementation of the proposal above. Check [example.js](example.js) to see how you'd use it on Node.js. This is just a sketch, there is no real work performed on this yet, but it shouldn't be complicate since the proposal is, by definition, as simple as it gets.
