import glob from 'glob';
import _ from 'lodash';
import {ConfigProvider} from '../provider';
import {FileConfigProvider} from '../providers/file';
import jsonParser from '../parsers/json';

export default class DirectoryConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();
    this.path = options.path || 'config';
    this.parser = options.parser || jsonParser;
  }

  load() {
    return new Promise((resolve, reject) => {
      glob(this.path, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        Promise.all(
          _.map(files, file => {
            const provider = new FileConfigProvider({
              path: file,
              parser: this.parser
            });

            return provider.load();
          })
        ).then(resolve, reject);
      });
    });
  }
}
