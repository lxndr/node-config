import {Config} from './config';
import env from './providers/env';
import file from './providers/file';
import directory from './providers/directory';
export default Config;

Config.register('env', env);
Config.register('file', file);
Config.register('directory', directory);
