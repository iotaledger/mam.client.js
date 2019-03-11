module.exports = (env, options) => ({
    entry: __dirname + '/src/node.js',
    output: {
        path: __dirname + '/lib',
        filename: `mam${options.target === 'node' ? '.client' : '.web'}${options.mode === 'development' ? '' : '.min'}.js`,
        library: 'Mam',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    mode: options.mode,
    target: options.target,
    devtool: 'none',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    targets: {
                                        browsers: '> 5%',
                                        node: '6'
                                    }
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    node: {
        fs: 'empty',
        child_process: 'empty',
        path: 'empty'
    }
})
