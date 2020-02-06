"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _core = require("./core");

class Session {
  constructor(req, res, sess) {
    Object.defineProperty(this, 'req', {
      value: req
    });
    Object.defineProperty(this, 'res', {
      value: res
    });
    Object.defineProperty(this, 'id', {
      value: req.sessionId
    });

    if (typeof sess === 'object') {
      Object.assign(this, sess);
    }
  } //  touch the session


  touch() {
    this.cookie.resetExpires(); //  check if store supports touch()

    if (typeof this.req.sessionStore.touch === 'function') {
      return this.req.sessionStore.touch(this.id, this);
    }

    return Promise.resolve();
  } //  sessionStore to set this Session


  save() {
    this.cookie.resetExpires();
    return this.req.sessionStore.set(this.id, this);
  }

  destroy() {
    delete this.req.session;
    return this.req.sessionStore.destroy(this.id);
  }

  async commit() {
    const {
      name,
      rolling,
      touchAfter
    } = this.req._session.options;
    let touched = false;

    if ((0, _core.stringify)(this) !== this.req._session.originalStringified) {
      await this.save();
    } //  Touch: extend session time despite no modification


    if (this.cookie.maxAge && touchAfter >= 0) {
      const minuteSinceTouched = this.cookie.maxAge * 1000 - (this.cookie.expires - new Date());

      if (minuteSinceTouched >= touchAfter) {
        touched = true;
        await this.touch();
      }
    }

    if ((rolling && touched || this.req._session.originalId !== this.req.sessionId) && this) this.res.setHeader('Set-Cookie', this.cookie.serialize(name, this.req.sessionId));
  }

}

exports.default = Session;