"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = withSession;

var _react = _interopRequireDefault(require("react"));

var _core = require("./core");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

function applyHOC(Page, hookName, options) {
  function WithSession(props) {
    return _react.default.createElement(Page, props);
  }

  WithSession.displayName = `withSession(${getDisplayName(Page)})`;
  if (hookName) WithSession[hookName] = async pageCtx => {
    const ctx = "Component" in pageCtx ? pageCtx.ctx : pageCtx;

    if (typeof window === "undefined") {
      const {
        req,
        res
      } = ctx;
      await (0, _core.applySession)(req, res, options);
    }

    return Page[hookName](ctx);
  };
  return WithSession;
}

function withSession(handler, options) {
  // API Routes
  if (handler.length > 1) return async function WithSession(req, res) {
    await (0, _core.applySession)(req, res, options);
    return handler(req, res);
  }; // Page Components

  if (handler.getServerProps) return applyHOC(handler, "getServerProps", options);
  if (handler.unstable_getServerProps) return applyHOC(handler, "unstable_getServerProps", options);
  if (handler.getInitialProps) return applyHOC(handler, "getInitialProps", options);
  return applyHOC(handler, null, options);
}