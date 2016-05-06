import fs from 'fs';
import _ from 'lodash';
import {ConfigProvider} from '../provider';
import jsonParser from '../parsers/json';
import yamlParser from '../parsers/yaml';

const parsers = {
  json: jsonParser,
  yaml: yamlParser
};

export default class FileConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();
    this.values = {};
    this.path = options.path;

    this.parser = options.parser || 'json';
    if (_.isString(this.parser)) {
      if (!parsers[this.parser]) {
        throw new TypeError(`Parser '${this.parser}' is unknown`);
      }
      this.parser = parsers[this.parser];
    }
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
