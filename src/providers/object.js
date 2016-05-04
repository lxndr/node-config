import _ from 'lodash';
import {ConfigProvider} from '../provider';

export default class ObjectConfigProvider extends ConfigProvider {
  constructor(object) {
    super();
    this.object = _.clone(object);
  }

  load() {
    return this.object;
  }
}
