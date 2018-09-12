import Config from '../src';

describe('Config', () => {
  const config = new Config();

  describe('Schema', () => {
    it('can define default value', () => {
      config.schema({
        'sys.logging': true,
      });
    });

    it('can define', () => {
      config.schema({
        'sys.watching': {
          default: false,
        },
      });
    });
  });

  it('should add from plain object', () => {
    config.use({
      cpanel: {
        staffer: {
          id: 97,
          name: 'lxndr',
          password: '12345',
        },
      },
    });
  });

  it('should add from file', () => {
    config.use('file', {
      path: 'tests/fixtures/config.json',
      mutable: true,
    });
  });

  it('should reload from all sources', () => config.reload());

  it('should set values', () => {
    config.set({
      cpanel: {
        staffer: {
          id: 100,
          name: 'ugt;i',
        },
      },
      oth: [1, 5, { foo: true }],
      arr: [],
    });
  });

  it('persist', () => config.persist());
});
