module.exports = {
  extends: ['airbnb', 'airbnb/hooks'],
  rules: {
    'max-len': [2, 150, 4], // increase page width
    semi: [2, 'never'], // remove semicolons
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off', // Next.js magically includes
  },
  env: {
    jest: true,
  },
}
