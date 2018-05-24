const config = new Config({
  enchance: true,
});

config.use({
  cpanel: {
    staffer: {
      id: 97,
      name: 'lxndr',
      password: '12345',
    },
  },
});

before('reload config', () => config.reload());

describe('Proxy', () => {
/*
  it('get value', () => {
    expect(config.cpanel.staffer.id).to.equal(97);
  });

  it('set value', () => {
    config.cpanel.staffer.id = 100;
  });

  it('remove value', () => {
    delete config.cpanel.staffer;
  });
*/
});
