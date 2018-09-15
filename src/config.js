import _ from 'lodash';
import debug from 'debug';
import Schema from './schema';
import ConfigNamespace from './config-namespace';
import FunctionConfigProvider from './providers/function';
import ObjectConfigProvider from './providers/object';
import ConfigProvider from './provider';
import merge from './utils/merge';

const log = debug('config');
const classes = {};

/**
 * Configuration class.
 */
export default class Config {
  schema = new Schema()

  providers = []

  values = {}

  storedValues = {}

  /**
   * Register configuration provider class under a name.
   * @param {String} name - Provider class name.
   * @param {ConfigProvider} klass - Class extending ConfigProvider.
   * @returns this
   */
  static register(name, klass) {
    if (typeof name !== 'string') {
      throw new TypeError('argument 1 has to be string');
    }

    if (!(klass.prototype instanceof ConfigProvider)) {
      throw new TypeError('argument 2 has to be ConfigProvider');
    }

    classes[name] = klass;
    return this;
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
      options = { load: provider };
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
    this.providers.push(provider);
    return this;
  }

  /**
   * @param {Object} desc schema descriptior map
   * @returns this
   */
  schema(desc) {
    this.schema.add(desc);
    return this;
  }

  /**
   * @returns Promise
   */
  async reload() {
    const configs = await Promise.all(
      this.providers.map(provider => provider.load()),
    );

    this.storedValues = _.merge({}, ...configs);
    this.schema.validateAll(this.storedValues);
    this.values = _.cloneDeep(this.storedValues);
  }

  /**
   * @return {any} value.
   */
  get(key, def) {
    if (!key) {
      return this.values;
    }

    return _.get(this.values, key, def);
  }

  /**
   * @return this
   */
  set(...args) {
    let [values] = args;

    /* key, value */
    if (args.length >= 2 && (_.isString(values) || _.isArray(values))) {
      const [key, value] = args;
      values = {};
      _.set(values, key, value);
    }

    /* object */
    if (!_.isObjectLike(values)) {
      throw new TypeError();
    }

    merge(this.values, values);
    return this;
  }

  /**
   * @returns {Primise}
   */
  async persist() {
    const providers = _.filter(this.providers, { writable: true });

    if (providers.length === 0) {
      return;
    }

    const changes = diff(this.storedValues, this.values);

/*
    _.filter(this.schema, { stringified: true }).forEach((schema) => {
      if (_.find(changed, change => util.startsWith(change.path, schema.path))) {
        const value = this.get(schema.path);
        _.remove(changed, change => util.startsWith(change.path, schema.path));
        removed.push(schema.path);
        changed.push({ path: schema.path, value: JSON.stringify(value) });
      }

      if (_.find(removed, path => util.startsWith(path, schema.path))) {
        const value = this.get(schema.path);
        _.remove(removed, path => util.startsWith(path, schema.path));
        removed.push(schema.path);
        changed.push({ path: schema.path, value: JSON.stringify(value) });
      }
    });

    changed = _.uniqBy(changed, 'path');
    removed = _.uniq(removed);

    await Promise.all(_.flatten(
      providers.map(provider => removed.map((path) => {
        log(`remove '${path.join('.')}'`);
        return provider.remove(path);
      })),
    ));

    await Promise.all(_.flatten(
      providers.map(provider => changed.map((change) => {
        log(`set '${change.path.join('.')}' = '${change.value}'`);
        return provider.set(change.path, change.value);
      })),
    ));

    this.storedValues = _.cloneDeep(this.values);
*/
  }

  /**
   * @return this
   */
  remove(key) {
    _.unset(this.values, key);
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
