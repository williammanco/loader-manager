'use strict';

class LoaderManager {
  constructor() {
    this.resources = {};
    this.assets = [];
  }

  static decode(response) {
    if (!response.ok) return Promise.resolve;

    const contentType = response.headers.get('content-type');

    if (contentType.includes('application/json')) return response.json();

    return response.blob();
  }

  fetch(name, url) { return fetch(url).then(e => this.constructor.decode(e)); }

  add(name, url) {
    const resource = { name, url: new URL(url, document.baseURI).href };

    this.assets.push(resource);

    if (!this.chain) this.chain = 0;

    this.chain += 1;

    return this;
  }

  save(name, url, callback, middleware) {
    const output = this.fetch(name, url, middleware);
    output.then((file) => {
      const fileDecoded = file.constructor.name === 'Blob' ? URL.createObjectURL(file) : file;
      this.resources[name] = typeof middleware === 'function' ? middleware(fileDecoded) : fileDecoded;
      if (callback) callback(this.resources[name]);
    });

    return output;
  }

  load(callback, middleware) {
    const count = parseInt(this.chain);
    delete this.chain;

    if (count > 1) {
      const promises = [];
      this.assets
        .slice(-count)
        .forEach(({ name, url }) => {
          promises.push(this.save(name, url, callback, middleware));
        });

      return Promise.all(promises);
    }

    const [{ url, name }] = this.assets.slice(-count);
    return this.save(name, url, callback, middleware);
  }

  batch(callback, middleware) {
    const promises = [];
    delete this.chain;
    this.assets.forEach(({ name, url }) => promises
      .push(this.save(name, url, callback, middleware)));
    return Promise.all(promises);
  }
}

module.exports = LoaderManager;
