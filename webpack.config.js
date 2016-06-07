
var path = require('path');
var autoprefixer = require('autoprefixer');

var HtmlWebpackPlugin = require('html-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var BowerWebpackPlugin = require("bower-webpack-plugin");

module.exports = {
    context: path.join(__dirname),
    entry:  './src',
    output: {
        path:     'dist',
        filename: 'bundle.js'
    },
    plugins: [
        new HtmlWebpackPlugin({ title: 'Three.js Labyrinth Game' }),
        new BowerWebpackPlugin(),
        new CopyWebpackPlugin([{
            from: 'src/static',
            flatten: true
        }])
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
            },
            {
                test: /\.(dae|obj|mtl|json)$/i,
                loader: 'file'
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
