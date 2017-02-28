const TapWebpackPlugin = require('tap-webpack-plugin');

module.exports = [
  // test bundle configuration
  {
    target: 'node',
    entry: './test/webpack',
    output: {
      path: 'tmp',
      filename: 'test.js',
    },
    plugins: [
      new TapWebpackPlugin(),
    ],
  },
  // export npm modules to browser scripts
  {
    entry: {
      album: './plugins/album/lib/client.js',
      editAlbum: './plugins/editAlbum/lib/client.js',
    },
    resolve: {
      extensions: ['.css', '.js', '.jsx'],
    },
    output: {
      filename: './plugins/[name]/public/assets/bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.jsx$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['react', 'es2015'],
              },
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
