import * as yaml from 'js-yaml';

export default {
  parse(text) {
    return yaml.safeLoad(text);
  },

  stringify(value) {
    return yaml.safeDump(value);
  },
};
