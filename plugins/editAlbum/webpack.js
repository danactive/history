const path = require('path');

module.exports = {
  entry: path.join(__dirname, './lib/client.js'),
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  output: {
    filename: path.join(__dirname, './public/assets/client.js'),
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'babel-loader',
      query: {
        presets: ['react', 'es2015'],
      },
    }],
  },
};
