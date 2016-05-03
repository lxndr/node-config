import _ from 'lodash';
import {ConfigSource} from '../source';

export class ObjectConfigSource extends ConfigSource {
  constructor(object) {
    super();
    this.object = _.clone(object);
  }

  load() {
    return this.object;
  }
}
