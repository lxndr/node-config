import Config from '../src';

const config = new Config();

describe('Schema', () => {
  it('add', () => {
    config.schema({
      'sys.logging': {
        default: true,
        atomic: true,
      },
    });
  });
});
