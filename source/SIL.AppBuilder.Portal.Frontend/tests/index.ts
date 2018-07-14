// require all modules ending in "-test" from the current directory and
// all subdirectories
const requireGlobalTest = require.context('./acceptance', true, /-test/);
const requireContextualTests = require.context('./../src', true, /-test/);

requireGlobalTest.keys().forEach(requireGlobalTest);
requireContextualTests.keys().forEach(requireContextualTests);

require('./test-setup');
