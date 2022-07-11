module.exports = {
  extends: ['airbnb', 'airbnb/hooks', 'next'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'max-len': [2, 150, 4], // increase page width
    semi: [2, 'never'], // remove semicolons
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off', // Next.js magically includes
    'react/jsx-one-expression-per-line': 'off', // too vertical
    'jsx-a11y/anchor-is-valid': 'off', // next/link breaks this rule
    'react-hooks/exhaustive-deps': 'off', // exhaustive is excessive
  },
  env: {
    jest: true,
  },
}
