"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.promisifyStore = promisifyStore;

var _util = require("util");

function promisifyStore(store) {
  store.get = (0, _util.promisify)(store.get);
  store.set = (0, _util.promisify)(store.set);
  store.destroy = (0, _util.promisify)(store.destroy);
  if (typeof store.touch === 'function') store.touch = (0, _util.promisify)(store.touch);
  return store;
}