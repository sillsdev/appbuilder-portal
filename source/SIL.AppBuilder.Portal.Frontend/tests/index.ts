// typescript typing hack
// cannot redeclare block-scoped variable chai
export {};


// require all modules ending in "-test" from the current directory and
// all subdirectories
const requireGlobalTest = require.context('./acceptance', true, /-test/);
const requireContextualTests = require.context('./../src', true, /-test/);

requireGlobalTest.keys().forEach(requireGlobalTest);
requireContextualTests.keys().forEach(requireContextualTests);

var chai = require('chai');
var sinon = require('sinon');
var chaiSubset = require('chai-subset');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);
chai.use(chaiSubset);
