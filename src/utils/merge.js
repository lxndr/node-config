import _ from 'lodash';

function merge(target, source, path) {
  _.each(source, (value, key) => {
    const valuePath = path.concat([key]);
    if (_.isPlainObject(value)) {
      if (!_.isObjectLike(target[key])) {
        target[key] = {};
      }
      merge(target[key], value, valuePath);
    } else {
      target[key] = value;
    }
  });
}

/**
 * @param {Object} target
 * @param {Object|Object[]} sources
 */
export default function mergeAll(target, sources) {
  if (!_.isArray(sources)) {
    sources = [sources];
  }

  _.each(sources, (source) => {
    merge(target, source, []);
  });
}
