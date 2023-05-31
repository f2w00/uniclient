const { app, Menu, ipcRenderer, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')
require('v8-compile-cache')
const product = require('./client/product.json')

if (process[1] == '--squirrel-firstrun') {
    //指定数据存储路径
}

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
    await import('./client/client.js')
}

async function onReady() {
    startUp()
}

function getUserDataPath() {
    let dataPath = product['appData']
    if (!dataPath || !fs.existsSync(dataPath)) {
        dataPath = path.join(__dirname, '../client.data')
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
//todo 项目实现,手动输入命令实现,electron-squirrel-startup处理安装问题,处理全局路径问题,主进程中实现html页面的加载,插件加载问题
