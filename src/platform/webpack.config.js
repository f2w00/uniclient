const path = require('path')
// webpack中所有配置信息都应该写在module.exports中
module.exports = {
    // 入口文件
    mode:'production',
    entry: './uniclient.ts',
    // 指定打包文件输出的路径
    output: {
        path: path.resolve(__dirname, 'dist'),
        // 打包后的文件
        filename: 'uniclient.js',
    },
    // 指定webpack打包时使用的模块
    module: {
        // 指定要加载的规则
        rules: [
            {
                // 指定的是规则生效的文件
                test: /\.ts$/,
                // 要使用的loader
                use: 'ts-loader',
            },
        ],
    },
    externals: [({ context, request }, callback) => {
        if (request.includes('electron')) {
            return callback(null, `commonjs ${request}`)
        }
        callback()
    },],
    target: 'node',
    optimization: {
        minimize: false,
    },
}
//要安装"pg-hstore": "^2.3.4",不然报错
//安装npm i -D webpack webpack-cli typescript ts-loader
