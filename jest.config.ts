
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testTimeout: 50000,
  coverageReporters: ['html'], // Add 'html' to the coverageReporters array
  coverageDirectory: 'coverage', // Set the directory for coverage reports (optional)
  // verbose: true,
  silent: true, // Suppresses Jest console output except for test results.
};
