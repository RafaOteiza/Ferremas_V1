module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  moduleDirectories: ['node_modules', '__mocks__'],
  setupFilesAfterEnv: ['./jest.setup.js']
}; 