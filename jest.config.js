module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).ts',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).ts',
  ],

  // Coverage settings
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Transform files
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Ignore patterns
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],

  // TypeScript config
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.lib.json',
    },
  },

  // Clear mocks between tests
  clearMocks: true,

  // Verbose output
  verbose: true,
}
