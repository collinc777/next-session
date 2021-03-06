import React from "react";
import { applySession } from "./core";

function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || "Component";
}

function applyHOC(Page, hookName, options) {
  function WithSession(props) {
    return <Page {...props} />;
  }
  WithSession.displayName = `withSession(${getDisplayName(Page)})`;
  if (hookName)
    WithSession[hookName] = async pageCtx => {
      const ctx = "Component" in pageCtx ? pageCtx.ctx : pageCtx;
      if (typeof window === "undefined") {
        const { req, res } = ctx;
        await applySession(req, res, options);
      }
      return Page[hookName](ctx);
    };
  return WithSession;
}

export default function withSession(handler, options) {
  // API Routes
  if (handler.length > 1)
    return async function WithSession(req, res) {
      await applySession(req, res, options);
      return handler(req, res);
    };
  // Page Components
  if (handler.getServerProps)
    return applyHOC(handler, "getServerProps", options);
  if (handler.unstable_getServerProps)
    return applyHOC(handler, "unstable_getServerProps", options);
  if (handler.getInitialProps)
    return applyHOC(handler, "getInitialProps", options);
  return applyHOC(handler, null, options);
}
