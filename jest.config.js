import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // next.config.jsとテスト環境用の.envファイルが配置されたディレクトリをセット
  dir: './',
});

// Jestのカスタム設定
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/e2e/',  // Playwright E2Eテストを除外
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(next-auth)/)',
  ],
  collectCoverageFrom: [
    // テスト対象のファイルのみを指定
    'src/lib/permissions.ts',
    'src/lib/email.ts',
    'src/lib/email-notifications.ts',
    'src/lib/supabase.ts',
    'src/components/Footer.tsx',
    'src/components/LoadingSpinner.tsx',
    'src/components/DashboardLayout.tsx',
    'src/components/AvatarUpload.tsx',
    'src/components/NavigationLink.tsx',
    'src/components/emails/*.tsx',
  ],
  // カバレッジ閾値: テスト対象ファイルのみで計算
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};

export default createJestConfig(customJestConfig);
