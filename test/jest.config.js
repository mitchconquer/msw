module.exports = {
  testRegex: '(.+)\\.test\\.ts$',
  // Increase the test timeout to allow webpack build
  // and Puppeteer bootstrapping to take place.
  testTimeout: 60000,
  moduleNameMapper: {
    '^msw(.*)': '<rootDir>/..$1',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
