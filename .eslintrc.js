module.exports = {
  // TODO enable plugin:testing-library/react
  // extends: ['airbnb', 'airbnb/hooks', 'next', 'plugin:testing-library/react', 'plugin:jest-dom/recommended'],
  extends: ['airbnb', 'airbnb/hooks', 'next', 'plugin:jest-dom/recommended'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'max-len': [2, 150, 4], // increase page width
    semi: [2, 'never'], // remove semicolons
    'react/jsx-props-no-spreading': 'off', // dislike rule
    'react/prop-types': 'off', // instead use typescript
    'react/require-default-props': 'off', // instead use typescript
    'react/react-in-jsx-scope': 'off', // Next.js magically includes
    'react/jsx-one-expression-per-line': 'off', // too vertical
    'jsx-a11y/anchor-is-valid': 'off', // next/link breaks this rule
    'react-hooks/exhaustive-deps': 'off', // exhaustive is excessive
    'react/jsx-filename-extension': [2, { extensions: ['.jsx', '.tsx'] }], // support React in TypeScript
    'import/extensions': ['error', 'ignorePackages', {
      js: 'never',
      mjs: 'never',
      jsx: 'never',
      ts: 'never',
      tsx: 'never',
    }], // support React in TypeScript
    'no-restricted-syntax': 'off', // Node.js no longer needs to be transpiled so this is unnecessary
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-unused-vars': 'off',
        'no-undef': 'off',
        'no-redeclare': 'off',
      },
    },
  ],
  env: {
    jest: true,
  },
}
