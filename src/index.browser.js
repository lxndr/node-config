import Config from './config';
import LocalStorageConfigProvider from './providers/localStorage';

export default Config;

Config.register('localStorage', LocalStorageConfigProvider);
