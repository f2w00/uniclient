const { app, Menu, protocol } = require('electron')
const product = require('./client/product.json')
const { config } = require('dotenv')
config()
require('v8-compile-cache')

if (process[1] == '--squirrel-firstrun') {
}

app.setPath('appData', generateUserDataPath())
Menu.setApplicationMenu(null)
app.whenReady().then(() => {
    protocol.interceptFileProtocol(
        'file',
        (req, callback) => {
            const url = req.url.substr(8)
            callback(decodeURI(url))
        },
        (error) => {
            if (error) {
                console.error('Failed to register protocol')
            }
        }
    )
    startUp()
})

async function startUp() {
    const { Client } = await require('./client/client.js')
    new Client()
}

/**
 * 如果是第一次运行(client.data文件夹不存在),那么会初始化client.data文件夹,然后创建ClientStore服务并且初始化存储文件
 * @returns
 */
function generateUserDataPath() {
    const { existsSync, writeFile, mkdirSync, appendFile } = require('fs')
    let dataPath = product['appData']
    if (!dataPath) {
        const { join } = require('path')
        dataPath = join(__dirname, '../client.data')
        product['appData'] = dataPath
        writeFile('./src/client/product.json', JSON.stringify(product), (err) => {
            console.log(err)
        })
        if (!existsSync(dataPath)) {
            mkdir(dataPath)
        }
        generateConfigs(dataPath)
    }
    if (!process.env['V8_COMPILE_CACHE_CACHE_DIR']) {
        appendFile(String.raw('../.env'), `V8_COMPILE_CACHE_CACHE_DIR='${dataPath}'`, (err) => {
            console.log(err)
        })
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
    ClientStore.set('workspace', 'projectExtend', [...pluginsInfo.infos.projectExtend])
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
//todo electron-squirrel-startup处理安装问题
