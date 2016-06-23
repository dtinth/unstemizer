'user strict'
const path = require('path')

module.exports = {
  entry: './src/demo',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    loaders: [
      { test: /\.js/, include: path.resolve(__dirname, 'src'), loader: 'babel' }
    ]
  }
}
