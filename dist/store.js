"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("util");

var _events = _interopRequireDefault(require("events"));

var _session = _interopRequireDefault(require("./session"));

var _cookie = _interopRequireDefault(require("./cookie"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Store() {
  _events.default.call(this);
}

(0, _util.inherits)(Store, _events.default);

Store.prototype.generate = function generate(req, res, genId, cookieOptions) {
  req.sessionId = genId;
  req.session = new _session.default(req, res);
  req.session.cookie = new _cookie.default(cookieOptions);
  return req.session;
};

Store.prototype.createSession = function createSession(req, res, sess) {
  const thisSess = sess;
  const {
    expires
  } = thisSess.cookie;
  thisSess.cookie = new _cookie.default(thisSess.cookie);
  if (typeof expires === 'string') thisSess.cookie.expires = new Date(expires);
  req.session = new _session.default(req, res, thisSess);
  return req.session;
};

var _default = Store;
exports.default = _default;