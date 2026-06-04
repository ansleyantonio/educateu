// @ts-check

const eslint = require('@eslint/js');
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        ...require('globals').node,
        ...require('globals').es2020,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      // Code quality rules
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',

      // Additional best practices
      '@typescript-eslint/explicit-function-return-type': 'warn', // Encourage explicit return types
      '@typescript-eslint/no-unused-expressions': 'error', // Prevent unused expressions
      'prefer-const': 'error', // Prefer const over let when possible (this is a core ESLint rule)
      '@typescript-eslint/no-var-requires': 'error', // Prefer ES6 imports over require
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'], // Prefer interfaces over types when possible
      '@typescript-eslint/array-type': ['error', { default: 'array-simple' }], // Consistent array syntax
      '@typescript-eslint/no-non-null-assertion': 'warn', // Warn on non-null assertions
      '@typescript-eslint/prefer-nullish-coalescing': 'warn', // Prefer ?? over ||
      '@typescript-eslint/prefer-optional-chain': 'warn', // Prefer optional chaining
    },
    ignores: ['dist/', 'build/', 'node_modules/', '*.min.js'],
  },
];
