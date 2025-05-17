/** @type {import('jest').Config} */
const config = {
    verbose: true,
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: `coverage/v${process.env.VUE_VERSION}`,
    coverageProvider: 'v8',
    preset: '@vue/cli-plugin-unit-jest',
    setupFiles: ['<rootDir>/.scripts/jest.setup.ts'],
    moduleFileExtensions: ['js', 'ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/__tests__/*.spec.ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest'
    }
};

export default config;
