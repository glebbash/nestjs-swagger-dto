import type Jest from '@jest/types';

const config: Jest.Config.InitialOptions = {
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  collectCoverageFrom: ['**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  coverageDirectory: '../.coverage',
  testEnvironment: 'node',
};

export default config;
