import _ from 'lodash';
import deepDiff from 'deep-diff';

function _walk(object, path, valFn) {
  _.each(object, (value, key) => {
    const valuePath = path.concat([key]);
    if (_.isPlainObject(value) || _.isArray(value)) {
      _walk(value, valuePath, valFn);
    } else {
      valFn(valuePath, value, object);
    }
  });
}

export function walk(object, valFn) {
  _walk(object, [], valFn);
}

function _merge(target, source, path, cb) {
  _.each(source, (value, key) => {
    const valuePath = path.concat([key]);
    if (_.isPlainObject(value)) {
      if (!_.isObjectLike(target[key])) {
        target[key] = {};
      }
      _merge(target[key], value, valuePath, cb);
/*
    } else if (_.isArray(value)) {
      if (!_.isArray(target[key])) {
        target[key] = [];
      }
      _merge(target[key], value, valuePath, cb);
*/
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
export function merge(target, sources, cb) {
  if (!_.isArray(sources)) {
    sources = [sources];
  }

  if (!cb) {
    cb = () => {};
  }

  _.each(sources, source => {
    _merge(target, source, [], cb);
  });
}

/**
 *
 */
export function diff(oldObject, newObject) {
  const changed = [];
  const removed = [];

  deepDiff.observableDiff(oldObject, newObject, item => {
    if (item.kind === 'N' || item.kind === 'E') {
      if (_.isPlainObject(item.rhs)) {
        walk(item.rhs, (valuePath, value) => {
          const path = [item.path].concat(valuePath);
          changed.push({path, value});
        });
      } else {
        changed.push({path: item.path, value: item.rhs});
      }
    } else if (item.kind === 'D') {
      removed.push(item.path);
    } else if (item.kind === 'A') {
      item = {
        kind: item.item.kind,
        path: item.path.concat(item.index),
        rhs: item.item.rhs
      };

      if (item.kind === 'N' || item.kind === 'E') {
        if (_.isPlainObject(item.rhs)) {
          walk(item.rhs, (valuePath, value) => {
            const path = [item.path].concat(valuePath);
            changed.push({path, value});
          });
        } else {
          changed.push({path: item.path, value: item.rhs});
        }
      } else if (item.kind === 'D') {
        removed.push(item.path);
      }
    }
  });

  return {changed, removed};
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

export function proxify(config) {
  return new Proxy(config, {
    has(target, property) {
      if (property in target) {
        return target[property];
      }
      return target.get(property) !== undefined;
    },
    get(target, property) {
      if (property in target) {
        return target[property];
      }
      return target.get(property);
    },
    set(target, property, value) {
      if (property in target) {
        target[property] = value;
      } else {
        target.set(property, value);
      }
      return true;
    },
    deleteProperty(target, property) {
      target.remove(property);
      return true;
    }
  });
}
