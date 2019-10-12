var path = require("path")   // 获取 nodejs 中的 path 对象
var webpack = require("webpack")   // 获取安装好的 webpack 对象
const TerserPlugin = require('terser-webpack-plugin');
var htmlWebpackPlugin = require('html-webpack-plugin');

// 输出
module.exports = {
    mode: "development",          // 编译模式 development，production
    context: path.resolve(__dirname, './src'),   // 找到项目内的 src 目录
    entry: {
        app: './app.js'   // 入口文件
    },
    output: {
        path: path.resolve(__dirname, './dist'),   // 输出文件夹
        filename:'[name]-[hash].js'
    },
    plugins:[
        new htmlWebpackPlugin({
            template:'../index.html'
        })
    ],
    module:{
        rules:[
            {
                test:/.css$/,
                use:[
                    //注意：这里的顺序很重要，不要乱了顺序
                    'style-loader',
                    'css-loader'
                ]
            },
            {
                test:/.(jpg|png|gif|svg)$/,
                use:[
                    'file-loader'
                ]
            },
            {
                test:/\.js$/,
                exclude:/(node_modules|bower_components)/,//排除掉node_module目录
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['env'] //转码规则
                    }
                }
            }
        ]
    },
    mode: 'development',
    devServer:{
      hot:true,
      inline:true
    },  
    optimization: {
        minimizer: [
            new TerserPlugin({
                cache: true, // 开启缓存
                parallel: true, // 支持多进程
                sourceMap: true, 
            }),
        ]
    }
}