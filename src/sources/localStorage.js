/* globals localStorage */

import _ from 'lodash';
import {ConfigSource} from '../source';

export class LocalStorageConfigSource extends ConfigSource {
  constructor(options = {}) {
    super();

    if (typeof localStorage === 'undefined') {
      throw new Error('Web Storage API is not supported by this platform');
    }

    this.basePath = options.basePath || null;
  }

  load() {
    const obj = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      _.set(obj, key, value);
    }

    return obj;
  }

  set(key, value) {
    localStorage.setItem(key, value);
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}
