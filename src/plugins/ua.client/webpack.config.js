const path = require('path')

module.exports = {
    mode: 'production',
    entry: path.join(__dirname, './ua.servant/ua.servant.js'),
    resolve: { alias: { hexoid: require.resolve('hexoid') } },
    output: {
        path: __dirname,
        filename: 'uaclient.js',
    },
    externals: [
        ({ context, request }, callback) => {
            if (/^uniclient$/.test(request)) {
                return callback(null, `commonjs ${request}`)
            }
            callback()
        },
    ],
    target: 'node',
    optimization: {
        minimize: false,
    },
}
