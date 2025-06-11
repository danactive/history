const path = require('path');
const webpack = require('webpack');

module.exports = [
  {
    mode: 'none',
    entry: {
      album: './server/plugins/album/lib/browser.js',
      editAlbum: './server/plugins/editAlbum/lib/browser.js',
    },
    output: {
      path: path.resolve(__dirname),
      filename: './server/plugins/[name]/public/assets/bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          type: 'asset',
          parser: {
            dataUrlCondition: {
              maxSize: 100_000, // 100 KB
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ['.css', '.js', '.jsx'],
      fallback: {
        process: require.resolve('process/browser'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ],
  },
];
