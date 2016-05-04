import os from 'os';
import _ from 'lodash';
import {EventEmitter} from 'events';
import {ConfigProvider} from './provider';

const classes = {};

class ConfigProxy {
  constructor(root, path) {
    this.root = root;
    this.path = path;
  }

  fullPath(key) {
    return key ? `${this.path}.${key}` : `${this.path}`;
  }

  get(key, def) {
    return this.root.get(this.fullPath(key), def);
  }

  remove(key) {
    return this.root.remove(this.fullPath(key));
  }
}

/**
 * Configuration class.
 */
export class Config extends EventEmitter {
  constructor() {
    super();
    this._providers = [];
  }

  /**
   * @param {String} name - Provider class name.
   * @param {Class} klass - Class extending ConfigProvider.
   */
  static register(name, klass) {
    classes[name] = klass;
  }

  /**
   * Adds provider.
   * @param {String|Object|ConfigProvider} provider
   * @param {Object} [options]
   */
  provider(provider, options) {
    if (_.isObject(provider)) {
      options = provider;
      provider = 'object';
    }

    if (_.isString(provider)) {
      const Class = classes[provider];

      if (!Class) {
        throw new TypeError(`Provider class '${provider}' is unknown.`);
      }

      provider = new Class(options);
    }

    if (!(provider instanceof ConfigProvider)) {
      throw new TypeError();
    }

    provider.mutable = options && options.mutable && _.isFunction(provider.set);
    this._providers.push(provider);
    return this;
  }

  /**
   * @returns Promise
   */
  reload() {
    return Promise.all(
      this._providers.map(a => a.load())
    ).then(configs => {
      _.merge(this, ...configs);
    });
  }

  /**
   * @return {any} value.
   */
  get(key, def) {
    return _.get(this, key, def);
  }

  /**
   * @return {Promise}
   */
  set(...args) {
    let obj = null;

    if (args.length === 1) {
      obj = args[0];
    } else if (args.length >= 2) {
      obj = {[args[0]]: args[1]};
    } else {
      throw new TypeError();
    }

    return Promise.all(
      _.map(obj, (value, key) => {
        _.set(this, key, value);
        super.emit(key, value);

        const list = _.filter(this._providers, {mutable: true});
        return Promise.all(
          list.map(a => a.set(key, value))
        );
      })
    );
  }

  /**
   * @return {Promise}
   */
  remove(key) {
    const list = _.filter(this._providers, {mutable: true});
    return Promise.all(
      list.map(a => a.remove(key))
    );
  }

  /**
   * Creates namespaced configuration.
   * @param {String} path
   * @return {ConfigProxy}
   */
  of(path) {
    return new ConfigProxy(this, path);
  }
}

/*
 * Register built-in providers.
 */
Config.register('object', require('./providers/object').default);
if (os.platform() === 'browser') {
  Config.register('localStorage', require('./providers/localStorage').default);
} else {
  Config.register('env', require('./providers/env').default);
  Config.register('file', require('./providers/file').default);
  Config.register('directory', require('./providers/directory').default);
}
