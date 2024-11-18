module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['./test/setup.js'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/test/__mocks__/fileMock.js',
    '\\.(css|less|scss|sass)$': '<rootDir>/test/__mocks__/styleMock.js'
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'jsx', 'json'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    'public_html/js/**/*.js',
    '!**/node_modules/**',
    '!**/__mocks__/**'
  ]
};
