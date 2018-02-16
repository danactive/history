const path = require('path');
const TapWebpackPlugin = require('tap-webpack-plugin');

module.exports = [
  // test bundle configuration
  {
    target: 'node',
    entry: './server/test/webpack',
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
      album: './server/plugins/album/lib/browser.js',
      editAlbum: './server/plugins/editAlbum/lib/browser.js',
      exploreVideo: './server/plugins/exploreVideo/lib/browser.js',
      walk: './server/plugins/walk/lib/browser.js'
    },
    resolve: {
      extensions: ['.css', '.js', '.jsx']
    },
    output: {
      filename: './server/plugins/[name]/public/assets/bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.jsx$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['react', 'env']
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
