import js from '@eslint/js';

import { globalIgnores } from 'eslint/config';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-plugin-prettier/recommended';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  prettierConfig,
  svelte.configs['flat/recommended'],
  svelte.configs['flat/prettier'],
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js', '**/*.ts'],

    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["playwright.config.ts"]
        },
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteFeatures: {
          experimentalGenerics: true
        },
        svelteConfig,
      }
    }
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none'
        }
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external', 'internal'], 'parent', 'sibling'],
          alphabetize: { order: 'asc' },
          named: true
        }
      ],
      'import/no-unresolved': 'off',
    }
  },
  globalIgnores([
    '**/.DS_Store',
    '**/node_modules',
    'build',
    '.svelte-kit',
    'package',
    '**/.env',
    '**/.env.*',
    '!**/.env.example',
    '**/pnpm-lock.yaml',
    '**/package-lock.json',
    '**/yarn.lock',
    'out',
    '**/*.js'
  ])
);
