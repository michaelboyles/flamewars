module.exports = [
    {
        mode: 'development',
        entry: './create-comment-request-handler.ts',
        output: {
            filename: './out.js',
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