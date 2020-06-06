module.exports = {
	extends: ['airbnb', 'airbnb/hooks'] ,
	rules: {
		'max-len': [2, 150, 4],
		'jsx-a11y/tabindex-no-positive': 'off',
		'react/prop-types': 'off',
		'react/jsx-props-no-spreading': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
};
