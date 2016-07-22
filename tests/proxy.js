const config = new Config({
  enchanced: true
});

config.use({
  cpanel: {
    staffer: {
      id: 97,
      name: 'lxndr',
      password: '12345'
    }
  }
});

before('reload config', () => {
  return config.reload();
});

describe('Proxy', () => {
  it('get value', () => {
    assert(config['staffer.id']).equals(97);
  });
});
