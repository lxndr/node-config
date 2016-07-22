import _ from 'lodash';
import {EventEmitter} from 'events';
import * as util from './util';
import {ConfigProvider} from './provider';
import ObjectConfigProvider from './providers/object';
import FunctionConfigProvider from './providers/function';

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
  constructor(options) {
    super();
    this.providers = [];
    this.schema = {};
    this.storedValues = {};
    this.values = {};

    if (options.enchance === undefined) {
      if (Proxy) {
        options.enchance = true;
      }
    }

    if (options.enchance) {
      return new Proxy(this, {
        get(target, property) {
          return target.get(property);
        },
        set(target, property, value) {
          target.set(property, value);
          return true;
        },
        deleteProperty(target, property) {
          target.remove(property);
          return true;
        }
      });
    }
  }

  /**
   * @param {String} name - Provider class name.
   * @param {Class} klass - Class extending ConfigProvider.
   */
  static register(name, klass) {
    classes[name] = klass;
  }

  /**
   * Adds configuration source.
   * @param {String|Object|Function|ConfigProvider} provider
   * @param {Object} [options]
   */
  use(provider, options) {
    if (_.isObjectLike(provider)) {
      options = provider;
      provider = 'object';
    }

    if (_.isFunction(provider)) {
      options = {load: provider};
      provider = 'function';
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
   * @returns this
   */
  schema(desc) {
    _.assign(this.schema, desc);
  }

  /**
   * @returns Promise
   */
  reload() {
    return Promise.all(
      this.providers.map(a => a.load())
    ).then(configs => {
      this.storedValues = {};
      _.merge(this.storedValues, ...configs);
      _.each(this.schema, (desc, key) => {
        const value = _.get(this.storedValues, key);
        if (desc.atomic === true && typeof value === 'string') {
          _.set(key, JSON.parse(value));
        }
        if (desc.default !== undefined && value === undefined) {
          _.set(key, desc.default);
        }
      });
      this.values = _.cloneDeep(this.storedValues);
    });
  }

  /**
   * @return {any} value.
   */
  get(key, def) {
    return _.get(this.values, key, def);
  }

  /**
   * @return this
   */
  set(...args) {
    let [values] = args;

    /* key, value */
    if (args.length === 2 && (_.isString(values) || _.isArray(values))) {
      const [key, value] = args;
      values = {};
      _.set(values, key, value);
    }

    /* object */
    if (!_.isObjectLike(values)) {
      throw new TypeError();
    }

    util.merge(this.values, values, (path, value) => {
      super.emit(path.join('.'), value);
    });

    return this;
  }

  _findChanges(cb) {
    /* TODO: this is very very simplified */

    _.each(this.values, (key, value) => {
      const otherValue = _.get(this.storedValues, key);
      if (_.isEqual(value, otherValue)) {
        cb(key, value);
      }
    });
  }

  persist() {
    const providers = _.filter(this.providers, {mutable: true});
    const changes = [];

    if (providers.length === 0) {
      return Promise.resolve();
    }

    this._findChanges((key, newValue) => {
      util.walk(newValue, (path, value) => {
        changes.push({path, value});
      });
    });

    if (changes.length === 0) {
      return Promise.resolve();
    }

    const promises = providers.map(provider => {
      return changes.map(change => {
        return provider.set(change.path, change.value);
      });
    });

    return Promise.all(_.flatten(promises)).then(() => {});
  }

  /**
   * @return {Promise}
   */
  remove(key) {
    const path = _.toPath(key);
    const providers = _.filter(this.providers, {mutable: true});
    return Promise.all(
      providers.map(a => a.remove(path))
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
Config.register('object', ObjectConfigProvider);
Config.register('function', FunctionConfigProvider);
