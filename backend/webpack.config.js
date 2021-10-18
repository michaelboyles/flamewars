module.exports = {
    name: 'Server',
    mode: 'production',
    entry: {
        'add-comment': './src/add-comment.ts',
        'delete-comment': './src/delete-comment.ts',
        'edit-comment': './src/edit-comment.ts',
        'get-comments': './src/get-comments.ts',
        'get-replies': './src/get-replies.ts',
        'get-number-of-comments': './src/get-number-of-comments.ts',
        'vote': './src/vote.ts'
    },
    output: {
        filename: '[name].js',
        library: {
            type: 'commonjs2'
        }
    },
    target: 'node',
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: "tsconfig.json"
                    }
                }]
            }
        ]
    },
    externals: ['aws-sdk'],
    optimization: {
        splitChunks: {
            name: 'vendor',
            chunks: 'all'
        }
    }
}