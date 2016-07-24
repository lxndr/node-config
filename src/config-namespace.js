import _ from 'lodash';

const $config = Symbol('config');
const $path = Symbol('path');

export class ConfigNamespace {
  constructor(config, path) {
    this[$config] = config;
    this[$path] = path;
  }

  _fullPath(key) {
    return this[$path].concat(_.toPath(key));
  }

  of(path) {
    return new ConfigNamespace(this[$config], this._fullPath(path));
  }

  get(key, def) {
    return this[$config].get(this._fullPath(key), def);
  }

  set(key, values) {
    if (_.isObjectLike(key)) {
      values = key;
      key = '';
    }

    return this[$config].set(this._fullPath(key), values);
  }

  remove(key) {
    return this[$config].remove(this._fullPath(key));
  }

  persist() {
    this[$config].persist();
  }
}
