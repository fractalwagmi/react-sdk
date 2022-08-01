const customJestConfig = {
  // // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  // if using TypeScript with a baseUrl set to the root directory then you need the below for alias' to work
  moduleDirectories: ['node_modules', '<rootDir>/'],
  preset: 'ts-jest',
};

module.exports = customJestConfig;
