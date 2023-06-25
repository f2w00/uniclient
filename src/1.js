const { compileFile } = require('bytenode')

function encryptFile() {
    const { writeFileSync } = require('fs')
    compileFile({
        filename: __dirname + '/main.js',
        output: __dirname + '/main.jsc',
        compileAsModule: true,
    })
    writeFileSync(__dirname + '/main2.js', "require('bytenode');\nrequire('./main.jsc');")
}
encryptFile()
