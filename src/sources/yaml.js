import * as fs from 'fs';
import * as yaml from 'js-yaml';
import {ConfigSource} from '../source';

export class YamlConfigSource extends ConfigSource {
  constructor(file) {
    super();
    this.file = file;
  }

  load() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.file, 'utf8', (err, text) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(yaml.safeLoad(text, {
          filename: this.file
        }));
      });
    });
  }

  set(key, value) {
  }

  remove(key) {
  }
}
