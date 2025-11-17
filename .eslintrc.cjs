module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { project: false, sourceType: 'module' },
  env: { node: true, es2020: true },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  rules: {
    'import/order': ['error', { 'newlines-between': 'always' }],
  },
};
