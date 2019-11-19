/* eslint-disable max-len */
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

  fetch(name, url) {
    return fetch(url).then(e => this.constructor.decode(e));
  }

  add(name, url) {
    const resource = { name };

    resource.url = typeof url === 'string' ? new URL(url, document.baseURI).href : url;

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
    const count = parseInt(this.chain, 2);
    delete this.chain;
    let promises = [];

    this.assets.slice(-count).forEach(({ name, url }) => {
      promises = this.promiseCollection(name, url, callback, middleware);
    });

    return Promise.all(promises);
  }

  promiseCollection(name, url, callback, middleware) {
    const promises = [];
    if (typeof url === 'string') {
      promises.push(this.save(name, url, callback, middleware));
    } else {
      promises.push(url);
      callback(url);
    }
    return promises;
  }

  batch(callback, middleware) {
    let promises = [];
    delete this.chain;

    // eslint-disable-next-line no-return-assign
    this.assets.forEach(({ name, url }) => promises = this.promiseCollection(name, url, callback, middleware));

    return Promise.all(promises);
  }
}

export default LoaderManager;
