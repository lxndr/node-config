import _ from 'lodash';

function _walk(object, path, cb) {
  _.each(object, (value, key) => {
    const valuePath = path.concat([key]);
    if (_.isObjectLike(value)) {
      _walk(value, valuePath, cb);
    } else {
      cb(valuePath, value);
    }
  });
}

export function walk(object, cb) {
  _walk(object, [], cb);
}

function _merge(target, source, path, cb) {
  _.each(source, (value, key) => {
    const valuePath = path.concat([key]);
    if (_.isObjectLike(value)) {
      if (_.isObject(value) && !_.isObject(target[key])) {
        target[key] = {};
      } else if (_.isArray(value) && !_.isArray(target[key])) {
        target[key] = [];
      }
      _merge(target[key], value, valuePath, cb);
    } else {
      cb(valuePath, value);
      target[key] = value;
    }
  });
}

/**
 * Lo-dash mergeWith is not good enough.
 * @param {Object} target
 * @param {Object|Object[]} sources
 * @param {Function} cb
 */
export function merge(target, sources, cb = () => {}) {
  if (!_.isArray(sources)) {
    sources = [sources];
  }

  _.each(sources, source => {
    _merge(target, source, [], cb);
  });
}

/**
 * Checks if target array starts with array.
 */
export function startsWith(target, array) {
  return _.every(array, (item, index) => target[index] === item);
}

export function obj2arr(obj) {
  if (!_.isObject(obj)) {
    return obj;
  }

  const ret = [];

  _.each(obj, (val, key) => {
    const idx = parseInt(key, 10);
    if (typeof idx === 'number' && !isNaN(idx)) {
      ret[idx] = val;
    }
  });

  return ret;
}
