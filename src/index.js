import os from 'os';
import _ from 'lodash';
import {EventEmitter} from 'events';
import {ConfigProvider} from './provider';

const $classes = Symbol('classes');
const $providers = Symbol('providers');

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
    this[$classes] = {};
    this[$providers] = [];

    this.register('object', require('./providers/object'));

    if (os.platform === 'browser') {
      this.register('localStorage', require('./providers/localStorage'));
    } else {
      this.register('file', require('./providers/file'));
      this.register('directory', require('./providers/directory'));
    }
  }

  /**
   * @param {String} name - Provider class name.
   * @param {Class} klass - Class extending ConfigProvider.
   */
  register(name, klass) {
    this[$classes][name] = klass;
  }

  /**
   * Adds provider.
   * @param {Provider} provider
   */
  provider(arg1, arg2) {
    if (typeof arg1 === 'string') {
      const Class = this[$classes][arg1];

      if (!Class) {
        throw new TypeError(`Provider class '${arg1}' is unknown.`);
      }

      this[$providers].push(new Class(arg2));
    } else if (arg1 instanceof ConfigProvider) {
      this[$providers].push(arg1);
    } else if (typeof arg1 === 'object') {
      this.provider('object', arg1);
    } else {
      throw new TypeError();
    }

    return this;
  }

  /**
   * @returns Promise
   */
  reload() {
    return Promise.all(
      this[$providers].map(a => a.load())
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

        const list = _.filter(this[$providers], {mutable: true});
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
    const list = _.filter(this[$providers], {mutable: true});
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
