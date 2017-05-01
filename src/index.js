const njsp = require("nano-json-stream-parser");

const EthereumRPC = function(url) {
  let onResponse = {}; 
  let callbacks = {};
  let nextId = 0;

  const parseResponse = njsp(json => {
    onResponse[json.id] && onResponse[json.id](null, json.result);
  });

  const genPayload = (method, params) => ({
    jsonrpc: "2.0",
    id: ++nextId,
    method: method,
    params: params
  });

  this.on = (name, callback) => {
    callbacks[name] = callback;
  }

  if (/^ws:/.test(url)) {
    const WebSocket = require("ws");
    const ws = new WebSocket(url);
    const eth = (method, params, callback) => {
      const payload = genPayload(method, params);
      onResponse[payload.id] = callback;
      ws.send(JSON.stringify(payload));
    }
    ws.on("message", parseResponse);
    ws.on("open", () => callbacks.open && callbacks.open(eth));
    ws.on("close", () => callbacks.close && callbacks.close());
    
  } else if (/^http:/.test(url)) {
    throw "HTTP transport not supported yet.";
  } else {
    throw "IPC transport not supported yet.";
  }
};

module.exports = EthereumRPC;
