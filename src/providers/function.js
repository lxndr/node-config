import { ConfigProvider } from '../provider';

export default class FunctionConfigProvider extends ConfigProvider {
  constructor(options = {}) {
    super();
    this.load = options.load;
  }
}
