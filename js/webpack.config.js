module.exports = [
    {
        mode: 'development',
        entry: './create-comment-request-handler.ts',
        entry: {
            'create-comment-request-handler': './server/create-comment-request-handler.ts',
            'get-comments': './server/get-comments.ts'
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
    },
    {
        name: 'Client',
        mode: 'production',
        entry: './client/index.ts',
        output: {
            filename: 'index.js'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: 'ts-loader'
                }
            ]
        }
    }
]