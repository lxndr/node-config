/* globals localStorage */
/* eslint-disable class-methods-use-this */

import _ from 'lodash';
import * as util from '../util';
import ConfigProvider from '../provider';

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
    localStorage.setItem(key.join('.'), value);
  }

  remove(path) {
    _.flow(
      () => _.transform(localStorage, (result, value, key) => {
        if (util.startsWith(_.toPath(key), path)) {
          result.push(key);
        }
      }, []),

      (keys) => {
        _.each(keys, (key) => {
          localStorage.removeItem(key);
        });
      },
    )();
  }
}
