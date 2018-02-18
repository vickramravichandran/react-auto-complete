const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const bundleAnalyzerPlugin = new BundleAnalyzerPlugin({
  analyzerMode: 'static'
});

const paths = {
  DIST: path.resolve(__dirname, 'dist'),
  SRC: path.resolve(__dirname, 'src'),
  JS: path.resolve(__dirname, 'src/js')
};

// Webpack configuration
module.exports = {
  entry: {
    vendor: [
      'react', 'react-dom', 'react-dom/server',
      'prop-types', 'classnames', 'axios', 'prismjs'
    ],
    mock_data: path.join(paths.JS, 'examples/MockData'),
    app: path.join(paths.JS, 'app.js')
  },
  output: {
    path: paths.DIST,
    filename: '[name].bundle.js'
  },
  devtool: 'cheap-module-source-map',
  plugins: [
    //bundleAnalyzerPlugin,
    new HtmlWebpackPlugin({
      template: path.join(paths.SRC, 'index.html'),
      hash: true
    }),
    new ExtractTextPlugin('app.bundle.css'),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['common', 'vendor', 'mock_data'],
      minChunks: 2,
      filename: '[name].chunk.js'
    }),
    new CopyWebpackPlugin([
      {
        from: path.resolve(paths.SRC, 'data-files/**/*'),
        to: path.resolve(paths.DIST, 'data-files/'),
        force: true,
        flatten: true
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(paths.SRC, 'images/favicons/**/*'),
        to: path.resolve(paths.DIST, 'images/favicons'),
        force: true,
        flatten: true
      }
    ])
  ],
  watch: false,
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
    ignored: /node_modules/
  },
  // Loaders configuration
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // To be safe, you can use enforce: "pre" section to check source files,
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
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          use: 'css-loader'
        })
      },
      {
        test: /\.(png|jpg|gif|eot|woff|ttf|svg|)$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  // Enable importing JS files without specifying their's extension
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [
      paths.SRC,
      paths.JS,
      path.resolve('./node_modules')
    ],
    alias: {
      src: paths.SRC
    }
  }
};
