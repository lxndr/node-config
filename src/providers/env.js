import _ from 'lodash';
import ConfigProvider from '../provider';

/**
 * EnvConfigProvider
 */
export default class EnvConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();
    this.name = options.name || 'CONFIG';
  }

  load() {
    const pairs = _.split(process.env[this.name], ',');
    return _.transform(pairs, (result, pair) => {
      const idx = pair.indexOf('=');
      if (idx > -1) {
        const key = pair.substring(0, idx);
        const value = pair.substring(idx + 1);
        _.set(this.values, key, value);
      }
    }, {});
  }
}
