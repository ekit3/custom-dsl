module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^&/(.*)$': '<rootDir>/tests/$1'
  },
  moduleFileExtensions: [
    'js',
    'json',
    'ts'
  ],
  testMatch: [
    '**/tests/(unit|integration)/**/*.(spec|test).(js|ts)|'
  ],
  globals: {
    transform: {
      '.ts': 'ts-jest'
    },
    'ts-jest': {
      compiler: 'typescript'
    }
  },
  resetMocks: true,
  restoreMocks: true
};
