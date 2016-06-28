import globby from 'globby';
import _ from 'lodash';
import {ConfigProvider} from '../provider';
import FileConfigProvider from '../providers/file';
import jsonParser from '../parsers/json';

export default class DirectoryConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();
    this.path = options.path || 'config/**/*.json';
    this.parser = options.parser || jsonParser;
  }

  load() {
    return globby(this.path)
      .then(files => {
        return Promise.all(
          files.map(file => {
            const provider = new FileConfigProvider({
              path: file,
              parser: this.parser
            });

            return provider.load();
          })
        );
      })
      .then(values => {
        return _.merge({}, ...values);
      });
  }
}
