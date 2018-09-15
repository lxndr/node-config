import _ from 'lodash';
import deepDiff from 'deep-diff';

/**
 *
 */
export function diff(oldObject, newObject) {
  const changed = [];
  const removed = [];

  deepDiff.observableDiff(oldObject, newObject, (item) => {
    if (item.kind === 'N' || item.kind === 'E') {
      if (_.isPlainObject(item.rhs)) {
        walk(item.rhs, (valuePath, value) => {
          const path = [item.path].concat(valuePath);
          changed.push({ path, value });
        });
      } else {
        changed.push({ path: item.path, value: item.rhs });
      }
    } else if (item.kind === 'D') {
      removed.push(item.path);
    } else if (item.kind === 'A') {
      item = {
        kind: item.item.kind,
        path: item.path.concat(item.index),
        rhs: item.item.rhs,
      };

      if (item.kind === 'N' || item.kind === 'E') {
        if (_.isPlainObject(item.rhs)) {
          walk(item.rhs, (valuePath, value) => {
            const path = [item.path].concat(valuePath);
            changed.push({ path, value });
          });
        } else {
          changed.push({ path: item.path, value: item.rhs });
        }
      } else if (item.kind === 'D') {
        removed.push(item.path);
      }
    }
  });

  return { changed, removed };
}

/**
 * Checks if target array starts with array.
 */
export function startsWith(target, array) {
  return _.every(array, (item, index) => target[index] === item);
}
