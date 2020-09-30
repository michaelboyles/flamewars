module.exports = [
    {
        mode: 'development',
        entry: './create-comment-request-handler.ts',
        output: {
            filename: './out.js'
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                }
            ]
        },
        externals: {
            'aws-sdk': 'aws-sdk'
        }
    }
]