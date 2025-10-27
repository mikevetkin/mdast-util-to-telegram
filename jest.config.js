export default {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.js'],
  collectCoverageFrom: ['lib/**/*.js', 'index.js'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },
  transform: {}
}






