const config = new Config({
  enchaned: false
});

describe('Basics', () => {
  it('should add from plain object', () => {
    config.use({
      cpanel: {
        staffer: {
          id: 97,
          name: 'lxndr',
          password: '12345'
        }
      }
    });
  });

  it('should add from file', () => {
    config.use('file', {
      path: 'tests/fixtures/config.json',
      mutable: true
    });
  });

  it('should reload from all sources', () => {
    return config.reload();
  });

  it('should set values', () => {
    return config.set({
      cpanel: {
        staffer: {
          id: 100,
          name: 'ugt;i'
        }
      },
      oth: {
        ioi: 9
      }
    });
  });
});
