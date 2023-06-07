const { app, Menu } = require('electron')
const env = require('dotenv')
const product = require('./client/product.json')
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
    let dataPath = product['appData']
    if (!dataPath || !existsSync(dataPath)) {
        const { join } = require('path')
        const { existsSync, writeFile, mkdirSync, readdirSync } = require('fs')
        dataPath = join(__dirname, '../client.data')
        product['appData'] = dataPath
        writeFile('./src/client/product.json', JSON.stringify(product), (err) => {
            console.log(err)
        })
        mkdirSync(dataPath)
        generateConfigs(dataPath)
    }
    return dataPath
}

function generateConfigs(filePath) {
    const { ClientStore } = require('./client/store/store')
    new ClientStore(filePath)
    let plugins = detectPlugins()
    ClientStore.create({
        name: 'extensions',
        fileExtension: 'json',
        clearInvalidConfig: false,
    })
    ClientStore.set('extensions', 'globalExtensionManager', {
        onStart: [],
        enabledExtensions: plugins.plugins,
    })
    ClientStore.create({
        name: 'workspace',
        fileExtension: 'json',
        clearInvalidConfig: false,
    })
    ClientStore.set('workspace', 'globalWorkspaceManager', {
        recentManagers: [],
        currentManager: {},
        projectExtend: plugins.infos.projectExtend,
    })
}

function detectPlugins() {
    const { join } = require('path')
    const { existsSync, readdirSync } = require('fs')
    let paths = readdirSync(join(__dirname, './plugins'))
    let plugins = []
    let infos = { projectExtend: [] }
    paths.forEach((value, index) => {
        if (existsSync(value + '/package.json')) {
            let { uniExtension: uniPlugin } = require(value + '/package.json')
            uniPlugin ? plugins.push(uniPlugin) : null
            if ('projectExtend' in uniPlugin) {
                infos.projectExtend.push(uniPlugin.projectExtend)
            }
        }
    })
    return { plugins: plugins, infos: infos }
}
//todo 手动输入命令实现,electron-squirrel-startup处理安装问题,处理全局路径问题,主进程中实现html页面的加载
