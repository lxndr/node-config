import _ from 'lodash';

export default class Schema {
  constructor() {
    this.keys = {};
  }

  /**
   *
   */
  add(desc) {
    if (!_.isObject(desc)) {
      throw new TypeError('Schema descriptor must be an object');
    }

    _.each(desc, (schema, key) => {
      const path = _.toPath(key);

      if (!_.isObject(schema)) {
        schema = { default: schema };
      }

      schema.path = path;
      this.keys.push(schema);
    });

    return this;
  }

  validate(value) {
    
  }
}
