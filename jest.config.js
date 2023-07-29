/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./tests/setup.ts'],
  moduleNameMapper: {
    '@db': '<rootDir>/src/connect/db',
    // "@api/*": ["./src/api/*"],
    // "@repo(/.*)": "./src/repo$1",
    // "@config": ["./src/config/config"],
    "~/(.*)": "<rootDir>/src/$1"
  }
};