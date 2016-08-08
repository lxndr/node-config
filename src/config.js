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
const $enchanced = Symbol.for('enchanced');
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
    this[$enchanced] = options.enchanced === true;

    if (this[$enchanced]) {
      return util.proxify(this);
    }
  }

  /**
   * Register configuration provider class under a name.
   * @param {String} name - Provider class name.
   * @param {Class} klass - Class extending ConfigProvider.
   */
  static register(name, klass) {
    if (typeof name !== 'string') {
      throw new TypeError('argument 1 has to be string');
    }

    if (!klass instanceof ConfigProvider) {
      throw new TypeError('argument 2 has to be ConfigProvider');
    }

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

    provider.writable = options && options.writable && _.isFunction(provider.set);
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
    if (!key) {
      return this[$values];
    }

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

    util.merge(this[$values], values);

    return this;
  }

  /**
   * @returns {Primise}
   */
  persist() {
    const providers = _.filter(this[$providers], {writable: true});

    if (providers.length === 0) {
      return Promise.resolve();
    }

    let {changed, removed} = util.diff(this[$storedValues], this[$values]);

    _.filter(this[$schema], {stringified: true}).forEach(schema => {
      if (_.find(changed, change => util.startsWith(change.path, schema.path))) {
        const value = this.get(schema.path);
        _.remove(changed, change => util.startsWith(change.path, schema.path));
        removed.push(schema.path);
        changed.push({path: schema.path, value: JSON.stringify(value)});
      }

      if (_.find(removed, path => util.startsWith(path, schema.path))) {
        const value = this.get(schema.path);
        _.remove(removed, path => util.startsWith(path, schema.path));
        removed.push(schema.path);
        changed.push({path: schema.path, value: JSON.stringify(value)});
      }
    });

    changed = _.uniqBy(changed, 'path');
    removed = _.uniq(removed);

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
