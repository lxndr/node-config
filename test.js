import Config from './src';

const config = new Config();

config.set('logging.enabled', true);
config.set('logging.options', { a: 1, b: 2, c: { asd: '12' } });
