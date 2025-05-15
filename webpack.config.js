const path = require('path');

module.exports = {
  target: 'web',
  mode: 'development',
  entry: './src/webview/script.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webview.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'es6'
              }
            }
          }
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  }
}; 