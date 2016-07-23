'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Config = require('../../').Config;

chai.should();
chai.use(chaiAsPromised);

global.expect = chai.expect;
global.assert = chai.assert;
global.Config = Config;

