import {Config} from './config';
import LocalStorageConfigProvider from './providers/localStorage';
export {Config};
export default Config;

Config.register('localStorage', LocalStorageConfigProvider);
