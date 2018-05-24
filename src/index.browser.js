import Config from './config';
import LocalStorageConfigProvider from './providers/localStorage';

export default Config;
export { Config };

Config.register('localStorage', LocalStorageConfigProvider);
