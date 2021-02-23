import fetch from "isomorphic-unfetch"; // eslint-disable-line no-shadow

export default class Client {
  constructor(opts) {
    this._opts = Object.assign({
      agent: "javascript-client",
      apiKey: undefined,
      application: undefined,
      endpoint: undefined,
      environment: undefined,
      retries: 5,
      timeout: 500
    }, opts);

    for (const key of ["agent", "application", "apiKey", "endpoint", "environment"]) {
      if (key in this._opts && this._opts[key] !== undefined) {
        const value = this._opts[key];

        if (typeof value !== "string" || value.length === 0) {
          if (key === "application") {
            if (value !== null && typeof value === "object" && "name" in value) {
              continue;
            }
          }

          throw new Error(`Invalid '${key}' in options argument`);
        }
      } else {
        throw new Error(`Missing '${key}' in options argument`);
      }
    }

    if (typeof this._opts.application === "string") {
      this._opts.application = {
        name: this._opts.application,
        version: 0
      };
    }

    this._delay = Math.max(10, this._opts.timeout / (1 << this._opts.retries));
  }

  createContext(params) {
    const body = {
      units: params.units
    };
    return this.post("/context", null, body);
  }

  refreshContext(params) {
    const body = {
      guid: params.guid,
      units: params.units
    };
    return this.post("/context", null, body);
  }

  publish(params) {
    const body = {
      guid: params.guid,
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

    return this.put("/context", null, body);
  }

  getExperiments(params) {
    return this.get("/experiment", params);
  }

  createVariantOverride(params) {
    const body = {
      units: params.units,
      overrides: params.overrides
    };
    return this.post("/override", null, body);
  }

  getVariantOverride(params) {
    const query = Object.assign({}, params, {
      units: Client.stringify(params.units)
    });
    return this.get("/override", query);
  }

  removeVariantOverride(params) {
    const query = Object.assign({}, params, {
      units: Client.stringify(params.units)
    });
    return this.delete("/override", query);
  }

  static stringify(obj) {
    return JSON.stringify(obj, null, 0);
  }

  request(method, path, query, body) {
    let url = `${this._opts.endpoint}${path}`;

    if (query) {
      const keys = Object.keys(query);

      if (keys.length > 0) {
        const encoded = keys.map(k => `${k}=${encodeURIComponent(query[k])}`).join("&");
        url = `${url}?${encoded}`;
      }
    }

    const tryOnce = () => {
      return fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this._opts.apiKey,
          "X-Agent": this._opts.agent,
          "X-Environment": this._opts.environment,
          "X-Application": this._opts.application.name,
          "X-Application-Version": this._opts.application.version || 0
        },
        body: body !== undefined ? JSON.stringify(body, null, 0) : undefined
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

  post(path, query, body) {
    return this.request("POST", path, query, body);
  }

  put(path, query, body) {
    return this.request("PUT", path, query, body);
  }

  get(path, query) {
    return this.request("GET", path, query);
  }

  delete(path, query) {
    return this.request("DELETE", path, query);
  }

}