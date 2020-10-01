module.exports = [
    {
        mode: 'development',
        entry: './create-comment-request-handler.ts',
        entry: {
            'create-comment-request-handler': './create-comment-request-handler.ts',
            'get-comments': './get-comments.ts'
        },
        output: {
            filename: '[name].js',
            library: 'main',
            libraryTarget: 'commonjs2'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: 'ts-loader'
                }
            ]
        },
        externals: ['aws-sdk']
    }
]