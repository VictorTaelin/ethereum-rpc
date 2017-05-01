const EthereumRPC = require("./src/index.js");
const ethRPC = new EthereumRPC("ws://localhost:8546");

// This is the `eth` object that we inject on the browser.
ethRPC.on("open", eth => {
  console.log("Connected to the Ethereum network.");

  // This is how we use it:
  eth("eth_getBalance", ['0x7da82c7ab4771ff031b66538d2fb9b0b047f6cf9', 'latest'], (err, balance) => {
    if (err) {
      console.log("Error getting Golem's multisig balance:", err);
    } else {
      console.log("Balance on Golem's multisig:", balance);
    }
  });
});

ethRPC.on("close", () => {
  console.log("Lost connection to the Ethereum network.");
});
