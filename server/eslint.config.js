const js = require('@eslint/js');

/**
 * Deliberately based on `eslint:recommended` (bug-catching rules like
 * no-dupe-keys, no-unused-vars, no-undef) rather than a strict style guide
 * like airbnb-base. This codebase wasn't written against a style guide, and
 * retrofitting one now would bury real issues under hundreds of unrelated
 * style complaints. The goal here is exactly what would have caught the
 * duplicate-declaration merge-conflict bugs found during the Phase 1 audit
 * — not to relitigate everyone's formatting choices.
 */
module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        exports: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['src/**/__tests__/**/*.js', 'src/__tests__/**/*.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        jest: 'readonly',
      },
    },
  },
  {
    ignores: ['node_modules/**', 'coverage/**'],
  },
];
