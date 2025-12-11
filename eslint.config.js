const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  {
    ignores: ['**/build*.js'],
    files: ['**/*.@(ts|tsx)', '*.stories.@(ts|tsx|js|jsx|mjs|cjs)'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
      eslintPluginPrettierRecommended,
    ],
    processor: angular.processInlineTemplates,

    rules: {
      '@angular-eslint/component-selector': [ 'error', { 'type': 'element', 'style': 'kebab-case' } ],
      '@angular-eslint/directive-selector': [ 'error', { 'type': 'attribute', 'style': 'camelCase' } ],
      '@angular-eslint/component-class-suffix': 'off',
      '@angular-eslint/directive-class-suffix': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/array-type': ['error', { 'default': 'generic' }],
      '@angular-eslint/no-input-rename': 'off'
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
      eslintPluginPrettierRecommended,
    ],
    rules: {
      '@angular-eslint/template/prefer-self-closing-tags': 'error',
      '@angular-eslint/template/label-has-associated-control': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off'
    },
  },
);
