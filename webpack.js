const path = require('path');
const TapWebpackPlugin = require('tap-webpack-plugin');

module.exports = [
  // test bundle configuration
  {
    target: 'node',
    entry: './test/webpack',
    output: {
      path: path.resolve(__dirname, './tmp'),
      filename: 'test.js'
    },
    plugins: [
      new TapWebpackPlugin()
    ]
  },
  // export npm modules to browser scripts
  {
    entry: {
      album: './plugins/album/lib/browser.js',
      editAlbum: './plugins/editAlbum/lib/browser.js',
      walk: './plugins/walk/lib/browser.js'
    },
    resolve: {
      extensions: ['.css', '.js', '.jsx']
    },
    output: {
      filename: './plugins/[name]/public/assets/bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.jsx$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['react', 'es2015']
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.(jpe?g|png|gif|svg)$/i,
          use: ['url-loader?limit=100000']
        }
      ]
    }
  }
];
