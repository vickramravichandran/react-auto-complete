const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Constant with our paths
const paths = {
  DIST: path.resolve(__dirname, 'dist'),
  SRC: path.resolve(__dirname, 'src')
};

module.exports = {
  entry: path.resolve(paths.SRC, 'index.js'),
  output: {
    path: paths.DIST,
    filename: 'AutoComplete.js',
    libraryTarget: 'umd',
    library: 'AutoComplete'
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    new ExtractTextPlugin('AutoComplete.css'),
    new CopyWebpackPlugin([
      {
        from: path.resolve(paths.SRC, 'index.js'),
        to: path.resolve(paths.DIST, 'index.js'),
        force: true
      }
    ])
  ],
  // Loaders configuration
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // To be safe, you can use enforce: "pre" section to check source files
        // not modified by other loaders (like babel-loader)
        enforce: "pre",
        exclude: /node_modules/, // do not lint third-party code
        loader: "eslint-loader",
        options: {
          formatter: require('eslint/lib/formatters/stylish')
        }
      },
      // We are telling webpack to use "babel-loader" for .js and .jsx files
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          'babel-loader'
        ]
      },
      // Files will get handled by css loader and then passed to the extract text plugin
      // which will write it to the file we defined above
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      paths.SRC,
      path.resolve('./node_modules')
    ],
    alias: {
      src: paths.SRC
    }
  }
};
