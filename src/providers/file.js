import fs from 'fs';
import _ from 'lodash';
import {ConfigProvider} from '../provider';
import jsonParser from '../parsers/json';

export default class FileConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();
    this.values = {};

    _.defaults(options, {
      parser: jsonParser
    });

    this.path = options.path;
    this.parser = options.parser;
  }

  load() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, 'utf8', (err, text) => {
        if (err) {
          reject(err);
          return;
        }

        this.values = this.parser.parse(text);
        resolve(this.values);
      });
    });
  }

  set(key, value) {
    _.set(this.values, key, value);
  }

  remove(key) {
    _.unset(this.values, key);
  }
}
