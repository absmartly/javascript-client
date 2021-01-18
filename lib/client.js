"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _isomorphicUnfetch = _interopRequireDefault(require("isomorphic-unfetch"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line no-shadow
class Client {
  constructor(opts) {
    this._opts = Object.assign({
      endpoint: undefined,
      apiKey: undefined,
      environment: undefined,
      agent: "javascript-client",
      application: {
        name: "default",
        version: 0
      },
      retries: 5,
      timeout: 500
    }, opts);

    for (var _i = 0, _arr = ["apiKey", "endpoint", "environment"]; _i < _arr.length; _i++) {
      const key = _arr[_i];

      if (key in this._opts && this._opts[key] !== undefined) {
        const value = this._opts[key];

        if (typeof value !== "string" || value.length === 0) {
          throw new Error(`Invalid '${key}' in options argument`);
        }
      } else {
        throw new Error(`Missing '${key}' in options argument`);
      }
    }

    this._delay = Math.max(10, this._opts.timeout / (1 << this._opts.retries));
  }

  createContext(params) {
    const body = {
      agent: this._opts.agent,
      environment: this._opts.environment,
      application: params.application || this._opts.application,
      units: params.units
    };
    return this.post("/context", body);
  }

  publish(params) {
    const body = {
      agent: this._opts.agent,
      environment: this._opts.environment,
      guid: params.guid,
      application: params.application || this._opts.application,
      units: params.units
    };

    if (Array.isArray(params.goals) && params.goals.length > 0) {
      body.goals = params.goals;
    }

    if (Array.isArray(params.exposures) && params.exposures.length > 0) {
      body.exposures = params.exposures;
    }

    if (Array.isArray(params.attributes) && params.attributes.length > 0) {
      body.attributes = params.attributes;
    }

    return this.put("/context", body);
  }

  request(method, path, body) {
    const url = `${this._opts.endpoint}${path}`;

    const tryOnce = () => {
      return (0, _isomorphicUnfetch.default)(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this._opts.apiKey
        },
        body: JSON.stringify(body, null, 0)
      }).then(response => {
        if (!response.ok) {
          const bail = response.status >= 400 && response.status < 500;
          return response.text().then(text => {
            const error = new Error(text !== null && text.length > 0 ? text : response.statusText);
            error._bail = bail;
            return Promise.reject(error);
          });
        }

        return response.json();
      });
    };

    const wait = ms => new Promise(resolve => {
      setTimeout(resolve, ms);
    });

    const tryWith = (retries, timeout, tries = 0, waited = 0) => {
      return tryOnce().catch(reason => {
        if (reason._bail || tries >= retries || waited >= timeout) {
          return Promise.reject(reason);
        }

        let delay = (1 << tries) * this._delay + 0.5 * Math.random() * this._delay;

        if (waited + delay > timeout) {
          delay = timeout - waited;
        }

        return wait(delay).then(() => tryWith(retries, timeout, tries + 1, waited + delay));
      });
    };

    return tryWith(this._opts.retries, this._opts.timeout);
  }

  post(path, body) {
    return this.request("POST", path, body);
  }

  put(path, body) {
    return this.request("PUT", path, body);
  }

}

exports.default = Client;