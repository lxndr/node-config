import * as yaml from 'yaml';

export default {
  parse(text) {
    return yaml.safeLoad(text);
  },

  stringify(value) {
    return yaml.safeDump(value);
  }
};
