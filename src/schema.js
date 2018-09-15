import _ from 'lodash';
import toArray from './utils/to-array';

const types = {
  string: String,
  number: Number,
  array: toArray,
};

export default class Schema {
  keys = {}

  /**
   * @param {Object} desc schema descriptior map
   */
  add(desc) {
    if (!_.isObject(desc)) {
      throw new TypeError('Schema descriptor must be an object');
    }

    _.each(desc, (schema, key) => {
      if (!_.isObject(schema)) {
        schema = { default: schema };
      }

      this.keys[key] = schema;
    });

    return this;
  }

  validate(value) {
    value = _.get(values, schema.path);

    if (schema.stringified === true && typeof value === 'string') {
      value = JSON.parse(value);
    }

    if (schema.type === 'array') {
      value = obj2arr(value);
    }

    if (schema.default !== undefined && value === undefined) {
      value = schema.default;
    }

    _.set(values, schema.path, value);

    return this;
  }
}
