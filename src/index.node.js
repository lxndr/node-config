import Config from './config';
import EnvConfigProvider from './providers/env';
import FileConfigProvider from './providers/file';
import DirectoryConfigProvider from './providers/directory';

export default Config;
export { Config };

Config.register('env', EnvConfigProvider);
Config.register('file', FileConfigProvider);
Config.register('directory', DirectoryConfigProvider);
