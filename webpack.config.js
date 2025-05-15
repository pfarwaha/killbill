const path = require('path');

module.exports = {
  target: 'web',
  mode: 'development',
  entry: {
    script: './src/webview/script.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist', 'webview'),
    filename: '[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}; 