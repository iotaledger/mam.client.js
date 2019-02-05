/* global __dirname, require, module*/

const webpack = require('webpack')
const path = require('path')

const output = 'lib/'
const libraryName = 'mam.'
const entry = __dirname + '/src/node.js'
const outputFile = libraryName + 'client.js'
const target = 'node'
const rules = [
  {
    test: /(\.jsx|\.js)$/,
    loader: 'babel-loader',
    exclude: /node_modules/
  }
]

const config = {
  entry,
  output: {
    path: __dirname + '/' + output,
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js']
  },
  target,
  node: {
    fs: 'empty',
    child_process: 'empty',
    path: 'empty'
  }
}
module.exports = config
