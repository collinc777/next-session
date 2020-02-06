"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = session;

var _core = require("./core");

let storeReady = true;

function session(opts) {
  //  store readiness
  if (opts && opts.store) {
    opts.store.on('disconnect', () => {
      storeReady = false;
    });
    opts.store.on('connect', () => {
      storeReady = true;
    });
  }

  return (req, res, next) => {
    if (!storeReady) {
      next();
      return;
    }

    (0, _core.applySession)(req, res, opts).then(() => next());
  };
}