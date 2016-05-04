/* globals localStorage */

import _ from 'lodash';
import {ConfigProvider} from '../provider';

export default class LocalStorageConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();

    if (typeof localStorage === 'undefined') {
      throw new Error('Web Storage API is not supported by this platform');
    }

    this.basePath = options.basePath || null;
  }

  _parseString(s) {
    try {
      return JSON.parse(s);
    } catch (e) {
      /* if string could not be parsed, return as it is
         if string empty, return null */
      return s || null;
    }
  }

  load() {
    return _.transform(localStorage, (result, value, key) => {
      _.set(result, key, this._parseString(value));
    }, {});
  }

  set(key, value) {
    localStorage.setItem(key, value);
  }

  remove(key) {
    const path = _.toPath(key);

    _.flow(
      () => {
        return _.transform(localStorage, (result, _value, _key) => {
          const _path = _.toPath(_key);
          const hit = _.every(path, (item, index) => _path[index] === item);

          if (hit) {
            result.push(_key);
          }
        }, []);
      },

      keys => {
        _.each(keys, key => {
          localStorage.removeItem(key);
        });
      }
    )();
  }
}
