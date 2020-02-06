"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stringify = stringify;
exports.applySession = applySession;

var _cookie = require("cookie");

var _crypto = require("crypto");

var _memory = _interopRequireDefault(require("./store/memory"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function proxyEnd(res, fn) {
  let ended = false;
  const oldEnd = res.end;

  res.end = function resEndProxy(...args) {
    const self = this;
    if (res.headersSent || res.finished || ended) return;
    ended = true;
    fn(() => {
      oldEnd.apply(self, args);
    });
  };
}

function stringify(sess) {
  return JSON.stringify(sess, (key, val) => key === 'cookie' ? undefined : val);
}

function getOptions(opts = {}) {
  return {
    name: opts.name || 'sessionId',
    store: opts.store || new _memory.default(),
    generateId: opts.genid || opts.generateId || function generateId() {
      return (0, _crypto.randomBytes)(16).toString('hex');
    },
    rolling: opts.rolling || false,
    touchAfter: opts.touchAfter ? opts.touchAfter : 0,
    cookie: opts.cookie || {},
    autoCommit: typeof opts.autoCommit !== 'undefined' ? opts.autoCommit : true
  };
}

async function applySession(req, res, opts) {
  const options = getOptions(opts);
  if (req.session) return;
  const originalId = req.sessionId = req.headers && req.headers.cookie ? (0, _cookie.parse)(req.headers.cookie)[options.name] : null;
  req.sessionStore = options.store;

  if (req.sessionId) {
    const sess = await req.sessionStore.get(req.sessionId);
    if (sess) req.sessionStore.createSession(req, res, sess);
  }

  if (!req.session) req.sessionStore.generate(req, res, options.generateId(), options.cookie); // eslint-disable-next-line no-underscore-dangle

  req._session = {
    // FIXME: Possible dataloss
    originalStringified: stringify(req.session),
    originalId,
    options
  }; // autocommit

  if (options.autoCommit) {
    proxyEnd(res, async done => {
      if (req.session) {
        await req.session.commit();
      }

      done();
    });
  }

  return req.session;
}