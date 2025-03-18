import HtmlWebpackPlugin from 'html-webpack-plugin';
import jsxConditionals from 'jsx-conditionals/transform.js';

export default {
    name: 'Client',
    mode: 'production',
    entry: './src/index.tsx',
    output: {
        filename: 'flamewars.js'
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
                        configFile: 'tsconfig.json',
                        getCustomTransformers: (program) => ({
                            before: [jsxConditionals.default(program, {})]
                        })
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
            template: 'src/index.html'
        })
    ]
}