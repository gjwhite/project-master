const path = require('path');

module.exports = {
  entry: './app/src/index.js',
  output: {
    path: __dirname + '/app/dist',
    filename: 'index_bundle.js',
    publicPath: ''
  },
  devServer: {
      contentBase: './app/dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules\/(?!(dom7|ssr-window|swiper)\/).*/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  plugins: [
  ]
};
