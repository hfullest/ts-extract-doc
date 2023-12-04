import { Config } from 'jest';

export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  verbose: true,
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  transform: {
    '^.+\\.ts$': ['ts-jest',{ tsconfig: './tsconfig.cjs.json',}],
  },
  testPathIgnorePatterns: ['node_modules', '.history', 'example', 'src/__tests__/fixtures'],
} as Config;
