// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

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

const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared'] as const;
const layersBelow = (layer: (typeof LAYERS)[number]) => LAYERS.slice(LAYERS.indexOf(layer) + 1);

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

      'import/resolver': {
        typescript: { project: './tsconfig.app.json' },
      },

      'boundaries/elements': LAYERS.map((type) => ({
        type,
        pattern: `src/${type}/*`,
        capture: ['slice'],
      })),
    },

    rules: {
      'react/prop-types': 'off',

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

      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            ...LAYERS.map((layer) => ({
              from: { element: { type: layer } },
              allow: { to: { element: { types: { anyOf: layersBelow(layer) } } } },
            })),

            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },

            {
              from: {
                element: { types: { anyOf: ['app', 'pages', 'widgets', 'features', 'entities'] } },
              },
              allow: {
                to: {
                  element: {
                    type: '{{ from.element.types.[0] }}',
                    captured: { slice: '{{ from.element.captured.slice }}' },
                  },
                },
              },
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
  ...storybook.configs['flat/recommended'],
]);
