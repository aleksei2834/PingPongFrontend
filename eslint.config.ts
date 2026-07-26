// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import prettierConfig from 'eslint-config-prettier';
import boundaries from 'eslint-plugin-boundaries';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],

    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      react.configs.flat.recommended,
      prettierConfig,
    ],

    languageOptions: {
      globals: globals.browser,
    },

    settings: {
      react: {
        version: 'detect',
      },

      'boundaries/elements': [
        {
          type: 'shared',
          pattern: 'src/shared/*',
        },

        {
          type: 'entities',
          pattern: 'src/entities/*',
        },

        {
          type: 'features',
          pattern: 'src/features/*',
        },

        {
          type: 'widgets',
          pattern: 'src/widgets/*',
        },

        {
          type: 'pages',
          pattern: 'src/pages/*',
        },

        {
          type: 'app',
          pattern: 'src/app/*',
        },
      ],
    },

    rules: {
      'react/react-in-jsx-scope': 'off',

      'import/no-cycle': 'error',

      'unused-imports/no-unused-imports': 'error',

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'boundaries/element-types': [
        'error',
        {
          default: 'disallow',

          rules: [
            {
              from: 'shared',
              disallow: ['entities', 'features', 'widgets', 'pages', 'app'],
            },

            {
              from: 'entities',
              disallow: ['features', 'widgets', 'pages', 'app'],
            },

            {
              from: 'features',
              disallow: ['widgets', 'pages', 'app'],
            },

            {
              from: 'widgets',
              disallow: ['pages', 'app'],
            },

            {
              from: 'pages',
              disallow: ['app'],
            },
          ],
        },
      ],
    },

    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
      boundaries,
    },
  },
]);
