const path = require('path');
const TapWebpackPlugin = require('tap-webpack-plugin');

module.exports = [
  // test bundle configuration
  {
    mode: 'none',
    target: 'node',
    entry: './server/test/webpack',
    output: {
      path: path.resolve(__dirname),
      filename: './tmp/test.js',
    },
    plugins: [
      new TapWebpackPlugin(),
    ],
  },
  // export npm modules to browser scripts
  {
    mode: 'none',
    entry: {
      album: './server/plugins/album/lib/browser.js',
      editAlbum: './server/plugins/editAlbum/lib/browser.js',
    },
    resolve: {
      extensions: ['.css', '.js', '.jsx'],
    },
    output: {
      path: path.resolve(__dirname),
      filename: './server/plugins/[name]/public/assets/bundle.js',
    },
    module: {
      rules: [
        {
          exclude: /(node_modules)/,
          test: /\.jsx$/,
          use: [
            {
              loader: 'babel-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: ['url-loader?limit=100000'],
        },
      ],
    },
  },
];
