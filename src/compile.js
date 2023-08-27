const { compileFile } = require('bytenode')

function encryptFile() {
    const { writeFileSync } = require('fs')
    compileFile({
        filename: __dirname + '/main.js',
        output: __dirname + '/main.jsc',
        compileAsModule: true,
    })
    writeFileSync(__dirname + '/starter.js', "require('bytenode');\nrequire('./main.jsc');")
}
encryptFile()
console.log('complete compile')
