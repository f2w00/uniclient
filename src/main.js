const { app, Menu } = require('electron')
const { existsSync } = require('fs')
const env = require('dotenv')
const product = require('./client/product.json')
require('v8-compile-cache')

if (process[1] == '--squirrel-firstrun') {
    //指定数据存储路径
}
env.config()

const workspacePath = app.setPath('appData', getUserDataPath())
Menu.setApplicationMenu(null)
const codeCachePath = getCodeCachePath()

// let clientLanguage = undefined
// if ("getPerferredSystemLanguages" in app) {
//     clientLanguage = app.getPerferredSystemLanguages()?.[0] ??'cn'
// }
app.whenReady().then(() => {
    onReady()
})

async function startUp(cachePath, workspacePath, appDataPath, config) {
    const { Client } = await require('./client/client.js')
    new Client(product['dev'])
}

async function onReady() {
    startUp()
}

function getUserDataPath() {
    let dataPath = product['appData']
    if (!dataPath || !existsSync(dataPath)) {
        const { join } = require('path')
        dataPath = join(__dirname, '../client.data')
        product['appData'] = dataPath
        fs.writeFile('./src/client/product.json', JSON.stringify(product), (err) => {
            console.log(err)
        })
    }
    return dataPath
}

function getCodeCachePath() {
    const commit = product.commit
    if (!commit) {
        return undefined
    }
    return path.join(userDataPath, 'CacheData', commit)
}

// export function createPKI() {
//     let exec = require("child_process").exec
//     exec("npx node-opcua-pki createPKI")
// }
//todo 手动输入命令实现,electron-squirrel-startup处理安装问题,处理全局路径问题,主进程中实现html页面的加载
