import _ from 'lodash';
import {EventEmitter} from 'events';
import * as util from './util';
import {ConfigProvider} from './provider';

const classes = {};

class ConfigProxy {
  constructor(root, path) {
    this.root = root;
    this.path = _.toPath(path);
  }

  fullPath(key) {
    return this.path.concat(_.toPath(key));
  }

  get(key, def) {
    return this.root.get(this.fullPath(key), def);
  }

  set(key, values) {
    if (_.isObjectLike(key)) {
      values = key;
      key = '';
    }

    return this.root.set(this.fullPath(key), values);
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
    this.providers = [];
    this.values = {};
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
    if (_.isObjectLike(provider)) {
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
    this.providers.push(provider);
    return this;
  }

  /**
   * @returns Promise
   */
  reload() {
    return Promise.all(
      this.providers.map(a => a.load())
    ).then(configs => {
      this.values = {};
      _.merge(this.values, ...configs);
    });
  }

  /**
   * @return {any} value.
   */
  get(key, def) {
    return _.get(this.values, key, def);
  }

  /**
   * @return {Promise}
   */
  set(values) {
    /* key, value */
    if (arguments.length === 2 && (_.isString(values) || _.isArray(values))) {
      const [key, value] = arguments;
      values = {};
      _.set(values, key, value);
    }

    /* object */
    if (!_.isObjectLike(values)) {
      throw new TypeError();
    }

    const providers = _.filter(this.providers, {mutable: true});
    const keys = [];

    util.merge(this.values, values, (path, value) => {
      keys.push({path, value});
    });

    return Promise.all(
      keys.map(pair => {
        return Promise.all(
          providers.map(a => a.set(pair.path, pair.value))
        );
      })
    ).then(() => {
      keys.forEach(pair => {
        super.emit(pair.path.join('.'), pair.value);
      });
    });
  }

  /**
   * @return {Promise}
   */
  remove(key) {
    const path = _.toPath(key);
    const list = _.filter(this.providers, {mutable: true});
    return Promise.all(
      list.map(a => a.remove(path))
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
