import _ from 'lodash';

function obj2arr(obj) {
  const ret = [];

  _.each(obj, (val, key) => {
    const idx = parseInt(key, 10);
    if (_.isFinite(idx)) {
      ret[idx] = val;
    }
  });

  return ret;
}

export default function toArray(val) {
  return _.isPlainObject(val) ? obj2arr(val) : Array.from(val);
}
