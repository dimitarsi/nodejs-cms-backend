/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testTimeout: 30 * 1000,
  testEnvironment: "node",
  setupFiles: [
    "<rootDir>/src/tests/setup.ts",
    "<rootDir>/src/tests/setupAfterEnv-createTestAccessTokens.ts",
  ],
  globalTeardown: "<rootDir>/src/tests/teardown.ts",
  moduleNameMapper: {
    "@db": "<rootDir>/src/connect/db",
    "@middleware/auth": "<rootDir>/src/middleware/auth.ts",
    "@config": "<rootDir>/src/config/config.ts",
    "@api/cms/": "<rootDir>/src/api/cms/",
    "~/(.*)": "<rootDir>/src/$1",
  },
}
