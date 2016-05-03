import _ from 'lodash';
import {EventEmitter} from 'events';
import {ConfigSource} from './source';
import {ObjectConfigSource} from './sources/object';
import {LocalStorageConfigSource} from './sources/localStorage';
import {YamlConfigSource} from './sources/yaml';

const $classes = Symbol('classes');
const $sources = Symbol('sources');

class ConfigProxy {
  constructor(root, path) {
    this.root = root;
    this.path = path;
  }

  get(key, def) {
    key = key ? `${this.path}.${key}` : `${this.path}`;
    return this.root.get(key, def);
  }

  remove(key) {
    key = key ? `${this.path}.${key}` : `${this.path}`;
    return this.root.remove(key);
  }
}

/**
 * Configuration class.
 */
export class Config extends EventEmitter {
  constructor() {
    super();
    this[$classes] = {};
    this[$sources] = [];

    this.register('object', ObjectConfigSource);
    this.register('localStorage', LocalStorageConfigSource);
    this.register('yaml', YamlConfigSource);
  }

  /**
   * @param {String} name - Source class name.
   * @param {Class} klass - Class extending ConfigSource.
   */
  register(name, klass) {
    this[$classes][name] = klass;
  }

  /**
   * Adds source.
   * @param {Source} source
   */
  source(arg1, arg2) {
    if (typeof arg1 === 'string') {
      const Class = this[$classes][arg1];

      if (!Class) {
        throw new TypeError(`Source class '${arg1}' is unknown.`);
      }

      this[$sources].push(new Class(arg2));
    } else if (arg1 instanceof ConfigSource) {
      this[$sources].push(arg1);
    } else if (typeof arg1 === 'object') {
      this[$sources].push(new ObjectConfigSource(arg1));
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
      this[$sources].map(a => a.load())
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

        const list = _.filter(this[$sources], {mutable: true});
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
    const list = _.filter(this[$sources], {mutable: true});
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
