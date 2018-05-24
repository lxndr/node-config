const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const { Config } = require('../../');

chai.should();
chai.use(chaiAsPromised);

global.expect = chai.expect;
global.assert = chai.assert;
global.Config = Config;
