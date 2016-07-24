import _ from 'lodash';
import debug from 'debug';
import {ConfigNamespace} from './config-namespace';
import FunctionConfigProvider from './providers/function';
import ObjectConfigProvider from './providers/object';
import {ConfigProvider} from './provider';
import * as util from './util';

const log = debug('config');
const $schema = Symbol('schema');
const $providers = Symbol('providers');
const $storedValues = Symbol('storedValues');
const $values = Symbol('values');
const classes = {};

/**
 * Configuration class.
 */
export class Config {
  constructor(options = {}) {
    this[$providers] = [];
    this[$schema] = [];
    this[$storedValues] = {};
    this[$values] = {};

    if (options.enchance === true) {
      return util.proxify(this);
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
    this[$providers].push(provider);
    return this;
  }

  /**
   * @returns this
   */
  schema(desc) {
    if (!_.isObject(desc)) {
      throw new TypeError('Schema must be an object');
    }

    _.each(desc, (schema, key) => {
      const path = _.toPath(key);

      if (!_.isObject(schema)) {
        schema = {default: schema};
      }

      schema.path = path;
      this[$schema].push(schema);
      this._applySchema(schema, this[$storedValues]);
      this._applySchema(schema, this[$values]);
    });

    return this;
  }

  _applySchema(schema, values) {
    let value = _.get(values, schema.path);

    if (schema.stringified === true && typeof value === 'string') {
      value = JSON.parse(value);
    }
    if (schema.type === 'array') {
      value = util.obj2arr(value);
    }
    if (schema.default !== undefined && value === undefined) {
      value = schema.default;
    }

    _.set(values, schema.path, value);
  }

  /**
   * @returns Promise
   */
  reload() {
    return Promise.all(
      this[$providers].map(a => a.load())
    ).then(configs => {
      this[$storedValues] = _.merge({}, ...configs);

      _.each(this[$schema], schema => {
        this._applySchema(schema, this[$storedValues]);
      });

      this[$values] = _.cloneDeep(this[$storedValues]);
    });
  }

  /**
   * @return {any} value.
   */
  get(key, def) {
    return _.get(this[$values], key, def);
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

    return this;
  }

  _diffObject(oldObject, newObject, cbs) {
    const oldKeys = _.keys(oldObject);
    const newKeys = _.keys(newObject);

    _.difference(oldKeys, newKeys).forEach(key => {
      cbs.delFn(key);
    });

    _.difference(newKeys, oldKeys).forEach(key => {
      cbs.newFn(key, newObject[key]);
    });

    _.intersection(oldKeys, newKeys).forEach(key => {
      if (!_.isEqual(oldObject[key], newObject[key])) {
        cbs.changeFn(key, newObject[key]);
      }
    });
  }

  /**
   * @returns {Primise}
   */
  persist() {
    const providers = _.filter(this[$providers], {mutable: true});
    const changed = [];
    const removed = [];

    if (providers.length === 0) {
      return Promise.resolve();
    }

    this._diffObject(this[$storedValues], this[$values], {
      newFn(rootPath, newValue) {
        util.walk(newValue, (valuePath, value) => {
          const path = [rootPath].concat(valuePath);
          changed.push({path, value});
        });
      },
      changeFn(rootPath, newValue) {
        util.walk(newValue, (valuePath, value) => {
          const path = [rootPath].concat(valuePath);
          changed.push({path, value});
        });
      },
      delFn(rootPath) {
        removed.push([rootPath]);
      }
    });

    _.filter(this[$schema], {stringified: true}).forEach(schema => {
      if (_.find(changed, change => util.startsWith(change.path, schema.path))) {
        const value = this.get(schema.path);
        _.remove(changed, change => util.startsWith(change.path, schema.path));
        removed.push(schema.path);
        changed.push({path: schema.path, value: JSON.stringify(value)});
      }
    });

    return Promise.resolve()
      .then(() => {
        const promises = providers.map(provider => {
          return removed.map(path => {
            log(`remove '${path.join('.')}'`);
            return provider.remove(path);
          });
        });

        return Promise.all(_.flatten(promises));
      })
      .then(() => {
        const promises = providers.map(provider => {
          return changed.map(change => {
            log(`set '${change.path.join('.')}' = '${change.value}'`);
            return provider.set(change.path, change.value);
          });
        });

        return Promise.all(_.flatten(promises));
      })
      .then(() => {
        this[$storedValues] = _.cloneDeep(this[$values]);
      });
  }

  /**
   * @return this
   */
  remove(key) {
    _.unset(this[$values], key);
    return this;
  }

  /**
   * Creates namespaced configuration.
   * @param {String} path
   * @return {ConfigProxy}
   */
  of(path) {
    return new ConfigNamespace(this, _.toPath(path));
  }
}

/*
 * Register built-in providers.
 */
Config.register('object', ObjectConfigProvider);
Config.register('function', FunctionConfigProvider);
