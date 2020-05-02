/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
export const defaultLoader = (response, options) => {
  if (!response.ok) return Promise.resolve;

  if (options.responseType) {
    return response[options.responseType]();
  }

  const contentType = options.contentType || response.headers.get('content-type');

  if (contentType.includes('application/json')) {
    return response.json().then((e) => {
      if (typeof options.middleware === 'function') {
        return options.middleware(e);
      }
      return this;
    });
  }

  if (contentType.includes('image')) {
    return response.arrayBuffer();
  }

  return response.blob();
};

export const defaultLoad = (url, decode, options) => fetch(url).then(e => decode(e, options));

class LoaderManager {
  constructor(options) {
    this.resources = {};
    this.assets = [];
    this.handlers = [];

    if (options.callbacks) {
      Object.assign(this, options.callbacks);
    }

    this.options = Object.assign({
      useLoad: null,
    }, options);
  }

  static getNameFile(url) {
    // eslint-disable-next-line no-useless-escape
    return url.match(/([a-zA-Z0-9\s_\\.\-\(\):])+(.)$/i)[0];
  }

  checkLoaded(url) {
    return this.assets.some(value => value.url === url);
  }

  add(name, url) {
    if (this.checkLoaded(url)) return this;

    const resource = { name: !name ? this.constructor.getNameFile(url) : name };

    resource.url = typeof url === 'string' ? new URL(url, document.baseURI).href : url;

    this.assets.push(resource);

    if (!this.chain) this.chain = 0;

    this.chain += 1;

    return this;
  }

  save(url, name, callback, middleware) {
    const output = this.getHandler(url);

    return output.then((file) => {
      this.resources[name] = typeof middleware === 'function' ? middleware(file) : file;
      if (typeof callback === 'function') callback(this.resources[name]);
      if (typeof this.onProgress === 'function') this.onProgress(this.resources[name]);
      return this;
    });
  }

  load(urls, name, callback, middleware) {
    if (urls) {
      if (Array.isArray(urls)) {
        urls.forEach((url) => {
          this.add(url);
        });
      } else {
        this.add(urls);
      }
    }

    return this.start(callback, middleware);
  }

  start(callback, middleware) {
    const count = parseInt(this.chain, 2);
    delete this.chain;
    let promises = [];

    this.assets.slice(-count).forEach(({ name, url }) => {
      promises = this.promiseCollection(name, url, callback, middleware);
    });

    return this.promiseAll(promises);
  }

  addHandler(regex, type, options) {
    const loader = {
      options: Object.assign({
        useLoad: this.options.useLoad,
      }, options),
      type,
    };

    this.handlers.unshift(regex, loader);

    return this;
  }

  removeHandler(regex) {
    const index = this.handlers.indexOf(regex);
    if (index !== -1) {
      this.handlers.splice(index, 2);
    }

    return this;
  }

  // eslint-disable-next-line consistent-return
  getHandler(file) {
    for (let i = 0, l = this.handlers.length; i < l; i += 2) {
      const regex = this.handlers[i];
      const { type, options } = this.handlers[i + 1];
      const load = options.useLoad;

      if (regex.global) regex.lastIndex = 0;

      if (regex.test(file)) {
        return load(file, type, options);
      }
    }
  }

  promiseCollection(name, url, callback, middleware) {
    const promises = [];
    if (typeof url === 'string') {
      promises.push(this.save(url, name, callback, middleware));
    } else {
      promises.push(url);
      if (typeof callback === 'function') callback(url);
    }
    return promises;
  }

  promiseAll(promises) {
    const promise = Promise.all(promises).catch((err) => {
      if (typeof this.onError === 'function') this.onError(err);
      return err;
    }).then((e) => {
      if (typeof this.onLoad === 'function') this.onLoad(e);
      return e;
    });
    return promise;
  }

  batch(callback, middleware) {
    let promises = [];
    delete this.chain;

    // eslint-disable-next-line no-return-assign
    this.assets.forEach(({ name, url }) => promises = this.promiseCollection(name, url, callback, middleware));

    return this.promiseAll(promises);
  }
}

export default LoaderManager;
