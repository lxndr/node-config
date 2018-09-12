import globby from 'globby';
import _ from 'lodash';
import ConfigProvider from '../provider';
import FileConfigProvider from './file';
import jsonParser from '../parsers/json';

export default class DirectoryConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();
    this.path = options.path || 'config/**/*.json';
    this.parser = options.parser || jsonParser;
  }

  async load() {
    const files = await globby(this.path);

    const values = Promise.all(files.map((file) => {
      const provider = new FileConfigProvider({
        path: file,
        parser: this.parser,
      });

      return provider.load();
    }));

    return _.merge({}, ...values);
  }
}
