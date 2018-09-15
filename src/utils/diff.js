import _ from 'lodash';

function diffValue(old, val, cb) {
  
}

function diffObject(oldObj, newObj, cb) {
  _.each(oldObj, (oval, key) => {
    const nval = newObj[key];

    if (!nval) {
      cb(key);
    } else {
      cb(key, nval);
    }
  });
}

function diffArray(old, arr, cb) {
  _.each(old, (oval, idx) => {
    const nval = arr[idx];

    if (!nval) {
      cb(idx);
    } else {
      cb(idx, nval);
    }
  });
}

export default function diff(oldObj, newObj) {
  const changed = [];
  const removed = [];

  if (_.isArray(oldObj)) {
    if (_.isArray(newObj)) {

    } else {

    }
  } else if (_.isPlainObject(oldObj)) {

  }

  return { changed, removed };
}
