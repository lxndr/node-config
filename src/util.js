import _ from 'lodash';

function _merge(target, source, path, cb) {
  if (target === source) {
    return;
  }

  _.each(source, (value, key) => {
    const valuePath = path.concat([key]);
    if (_.isObjectLike(value)) {
      if (!_.isObjectLike(target[key])) {
        target[key] = {};
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
