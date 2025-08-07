const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(lucide-react)/)', // 👈 transpile lucide-react
  ],
};

module.exports = createJestConfig(customJestConfig);
