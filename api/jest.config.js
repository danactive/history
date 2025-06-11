module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!cheerio)/"
  ],
  setupFilesAfterEnv: ['./test/jestsetup.js'],  // add this line
  testEnvironment: 'node',
};
