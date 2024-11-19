/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleDirectories: ['node_modules', 'src'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'], 
  moduleFileExtensions: ['ts', 'js', "json", "node"], 
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      // json.config???
    }],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts', 
    '!src/**/index.ts', 
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'], 
  testTimeout: 30000, 
};
