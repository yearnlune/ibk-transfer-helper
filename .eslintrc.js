module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 14,
    parser: '@typescript-eslint/parser',
    project: ['tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  plugins: ['import', 'simple-import-sort'],
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/airbnb-with-typescript',
    '@vue/prettier',
  ],
  ignorePatterns: ['.eslintrc.js', 'babel.config.js'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'import/prefer-default-export': 'off',
  },
};
