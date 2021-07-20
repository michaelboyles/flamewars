const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = [
    {
        name: 'Server',
        mode: 'production',
        entry: {
            'add-comment': './src/server/add-comment.ts',
            'delete-comment': './src/server/delete-comment.ts',
            'edit-comment': './src/server/edit-comment.ts',
            'get-comments': './src/server/get-comments.ts',
            'get-replies': './src/server/get-replies.ts',
            'get-number-of-comments': './src/server/get-number-of-comments.ts',
            'vote': './src/server/vote.ts'
        },
        output: {
            filename: 'server/[name].js',
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
                            configFile: "server/tsconfig.json"
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
    },
    {
        name: 'Client',
        mode: 'production',
        entry: './src/client/index.tsx',
        output: {
            filename: 'client/index.js'
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js']
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'ts-loader',
                        options: {
                            configFile: 'src/client/tsconfig.json'
                        }
                    }]
                },
                {
                    test: /\.s?css$/,
                    use: ['style-loader', 'css-loader', 'sass-loader']
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'src/client/index.html'
            })
        ]
    }
]