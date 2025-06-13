import js from '@eslint/js'
import next from '@next/eslint-plugin-next'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import jestDom from 'eslint-plugin-jest-dom'
import jsdoc from 'eslint-plugin-jsdoc'
import testingLibrary from 'eslint-plugin-testing-library'

export default [
  { // needs to be its own array index or is not applyed
    ignores: ['node_modules/', '.next', 'api/', 'dist'],
  },
  {
    plugins: {
      // TODO enable airbnb/hooks after resolve conflict with next
      // TODO enable airbnb it has better reasoning but Next v15 has ugly
      js, // ESLint core recommended rules
      '@typescript-eslint': ts, // TypeScript recommended rules
      'testing-library': testingLibrary,
      'jest-dom': jestDom,
      '@next/next': next,
      jsdoc,
    },
    languageOptions: {
      parser: tsParser, // Needed to .ts(x) files
      ecmaVersion: 2022, // Matches `target: "ES2022"`
      sourceType: 'module', // Matches `module: "ESNext"`
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      ...next.configs.recommended.rules,
      'max-len': [2, 150, 4], // increase page width
      'semi': ['error', 'never'], // remove semicolons
      'quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': false }],
      'jsdoc/require-description': 'warn', // Ensure descriptions are present
      'jsdoc/require-param-description': 'error', // Enforce if JSDoc comment exists than have a desc
      'jsdoc/require-param-type': 'error', // Enforce TS types in @param
      'jsdoc/check-param-names': 'error',  // Enforce TS names in @param
      'jsdoc/require-returns-type': 'error', // Enforce TS types in @returns
      'jsdoc/check-tag-names': 'error', // Validate JSDoc tag names
      'jsdoc/check-types': 'error', // Ensure TS types are correctly used
      'comma-dangle': ['error', 'always-multiline'],
    },
    settings: {
      jsdoc: {
        tagNamePreference: {
          'jest-environment': 'jest-environment', // Some unit test need to change the env
        },
      },
    },
  },
]
