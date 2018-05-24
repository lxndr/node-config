const util = require('../lib/util');

describe('Utilities', () => {
  it('obj2arr', () => {
    const obj = {
      foo: 'bar', 0: 'a', 1: 'b', 2: 78, 3: true,
    };
    const arr = ['a', 'b', 78, true];
    const res = util.obj2arr(obj);
    expect(res).to.deep.equal(arr);
  });
});
