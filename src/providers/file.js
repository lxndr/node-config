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
    this.path = options.path;
    this.parser = options.parser || 'json';
    this.values = {};

    if (typeof options.path !== 'string') {
      throw new TypeError(`Parameter 'path' has to be provided.`);
    }

    if (typeof this.parser === 'string') {
      if (!parsers[this.parser]) {
        throw new TypeError(`Parser '${this.parser}' is unknown.`);
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
    return this.save();
  }

  remove(key) {
    _.unset(this.values, key);
    return this.save();
  }

  save() {
    return new Promise((resolve, reject) => {
      const data = this.parser.stringify(this.values);
      fs.writeFile(this.path, data, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  }
}
