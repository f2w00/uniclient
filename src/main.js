const { app, Menu } = require('electron')
const env = require('dotenv')
const product = require('./client/product.json')
const { map } = require('async')
require('v8-compile-cache')

if (process[1] == '--squirrel-firstrun') {
}

app.setPath('appData', generateUserDataPath())
Menu.setApplicationMenu(null)
app.whenReady().then(() => {
    startUp()
})

async function startUp(cachePath, workspacePath, appDataPath, config) {
    env.config()
    const { Client } = await require('./client/client.js')
    new Client(product['dev'])
}

/**
 * 如果是第一次运行(client.data文件夹不存在),那么会初始化client.data文件夹,然后创建ClientStore服务并且初始化存储文件
 * @returns
 */
function generateUserDataPath() {
    const { existsSync, writeFile, mkdirSync } = require('fs')
    let dataPath = product['appData']
    if (!dataPath) {
        const { join } = require('path')
        dataPath = join(__dirname, '../client.data')
        product['appData'] = dataPath
        writeFile('./src/client/product.json', JSON.stringify(product), (err) => {
            console.log(err)
        })
        if (!existsSync(dataPath)) {
            mkdirSync(dataPath)
        }
        generateConfigs(dataPath)
    }
    return dataPath
}

function generateConfigs(filePath) {
    const { ClientStore } = require('./client/store/store')
    new ClientStore(filePath)
    let pluginsInfo = detectPlugins()
    ClientStore.create({
        name: 'extensions',
        fileExtension: 'json',
        clearInvalidConfig: false,
    })
    ClientStore.set('extensions', 'globalExtensionManager', {
        onStart: pluginsInfo.plugins.onStart,
        enabledExtensions: pluginsInfo.plugins.list,
    })
    ClientStore.create({
        name: 'workspace',
        fileExtension: 'json',
        clearInvalidConfig: false,
    })
    ClientStore.set('workspace', 'recentManagers', [])
    ClientStore.set('workspace', 'currentManager', {})
    ClientStore.set('workspace', 'projectExtend', pluginsInfo.infos.projectExtend)
}

function detectPlugins() {
    const { join } = require('path')
    const { existsSync, readdirSync } = require('fs')
    let pluginPath = join(__dirname, './plugins')
    let paths = readdirSync(pluginPath)
    let plugins = []
    let onStart = []
    let extend = new Map()
    paths.forEach((value, index) => {
        let acualPath = pluginPath + '/' + value + '/package.json'
        if (existsSync(acualPath)) {
            let { uniPlugin } = require(acualPath)
            uniPlugin ? plugins.push(uniPlugin) : null
            if ('projectExtend' in uniPlugin) {
                uniPlugin.projectExtend.forEach((value) => {
                    extend.set(value, value)
                })
                if (uniPlugin.defaultStart) onStart.push(uniPlugin.identifier.id)
            }
        }
    })
    return { plugins: { list: plugins, onStart: onStart }, infos: { projectExtend: extend.values() } }
}
//todo 手动输入命令实现,electron-squirrel-startup处理安装问题,处理全局路径问题,主进程中实现html页面的加载
