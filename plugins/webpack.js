module.exports = {
  entry: {
    album: './plugins/album/lib/client.js',
    editAlbum: './plugins/editAlbum/lib/client.js'
  },
  resolve: {
    extensions: ['', '.css', '.js', '.jsx'],
  },
  output: {
    filename: './plugins/[name]/public/assets/bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'es2015'],
        },
      },
      { test: /\.css$/, loader: 'style!css' },
      { test: /\.(jpe?g|png|gif|svg)$/i, loader: "url-loader?limit=100000" }
    ],
  },
};
