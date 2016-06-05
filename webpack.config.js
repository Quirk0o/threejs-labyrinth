
var autoprefixer = require('autoprefixer');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var BowerWebpackPlugin = require("bower-webpack-plugin");

module.exports = {
    entry:  './src',
    output: {
        path:     'dist',
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({ title: 'Three.js Labyrinth Game' }),
        new BowerWebpackPlugin()
    ],
    module: {
        loaders: [
            {
                test:   /\.js/,
                loader: 'babel',
                include: __dirname + '/src'
            },
            {
                test:   /\.css/,
                loaders: ['style', 'css']
            },
            {
                test:   /\.html/,
                loader: 'html'
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            }
        ]
    },
    postcss: [ autoprefixer({ browsers: ['last 2 versions'] }) ],
    devServer: {
        contentBase: "./dist",
        progress: true,
        colors: true
    },
    devtool: 'source-map'
};
