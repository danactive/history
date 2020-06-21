module.exports = {
  collectCoverageFrom: [
    'ui/app/**/*.{js,jsx}',
    '!ui/app/**/*.test.{js,jsx}',
    '!ui/app/*/RbGenerated*/*.{js,jsx}',
    '!ui/app/app.jsx',
    '!ui/app/global-styles.js',
    '!ui/app/*/*/Loadable.{js,jsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 98,
      branches: 91,
      functions: 98,
      lines: 98,
    },
  },
  moduleDirectories: ['node_modules', 'app'],
  moduleNameMapper: {
    '.*\\.(css|less|styl|scss|sass)$': '<rootDir>/internals/mocks/cssModule.js',
    '.*\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/internals/mocks/image.js',
  },
  setupFilesAfterEnv: [
    '<rootDir>/internals/testing/test-bundler.js',
    '@testing-library/jest-dom/extend-expect',
  ],
  testRegex: 'tests/.*\\.test\\.js$',
  snapshotSerializers: [],
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
};
