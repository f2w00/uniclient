const { app, Menu, protocol } = require('electron')
const { config } = require('dotenv')
config()
require('v8-compile-cache')

app.setPath('appData', generateUserDataPath())
Menu.setApplicationMenu(null)
app.commandLine.appendArgument('--no-sandbox') //electron bug with gpu_error
app.whenReady().then(() => {
    protocol.interceptFileProtocol(
        'file',
        (req, callback) => {
            callback(decodeURI(req.url.slice(8)))
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
    const { existsSync } = require('fs')
    let dataPath = process.env['UNICLIENT_APPDATA']
    let cacheDir = process.env['V8_COMPILE_CACHE_CACHE_DIR']
    if (existsSync(dataPath) && existsSync(cacheDir)) {
        return dataPath
    } else {
        const { writeFileSync, readFile, mkdirSync } = require('fs')
        if (!cacheDir || !dataPath || !existsSync(cacheDir) || !existsSync(dataPath)) {
            const { join } = require('path')
            dataPath = join(__dirname, '../client.data')
            let envPath = join(__dirname, '../.env')
            console.log(existsSync('../.env'))
            if (!existsSync(envPath)) {
                let data = `V8_COMPILE_CACHE_CACHE_DIR='${dataPath}\cache'\nUNICLIENT_APPDATA='${dataPath}'\n`
                writeFileSync(envPath, String(data))
            } else {
                readFile(envPath, 'utf-8', (err, data) => {
                    if (data) {
                        data.replace(
                            /^V8_COMPILE_CACHE_CACHE_DIR=.*$/g,
                            `V8_COMPILE_CACHE_CACHE_DIR='${dataPath}/cache'`
                        )
                        data.replace(/^UNICLIENT_APPDATA=.*$/g, `UNICLIENT_APPDATA='${dataPath}'`)
                    } else {
                        let data = `V8_COMPILE_CACHE_CACHE_DIR='${dataPath}\\cache'\nUNICLIENT_APPDATA='${dataPath}'\n`
                    }
                    writeFileSync(envPath, String(data))
                })
            }
            if (!existsSync(dataPath)) {
                mkdirSync(dataPath)
            }
            generateConfigs(dataPath, join, existsSync, mkdirSync)
        }
        return dataPath
    }
}

function generateConfigs(dataPath, join, existsSync, mkdirSync) {
    const { ClientStore } = require('./platform/base/store/store')
    new ClientStore({ client: false, cwd: dataPath + '/store' })
    const detectPlugins = () => {
        const { readdirSync } = require('fs')
        let pluginPath = join(__dirname, './plugins')
        let paths = readdirSync(pluginPath)
        let plugins = []
        let onStart = []
        let extend = new Map()
        paths.forEach((value, index) => {
            let actualPath = pluginPath + '/' + value + '/package.json'
            if (existsSync(actualPath)) {
                let { uniPlugin } = require(actualPath)
                uniPlugin ? plugins.push(uniPlugin) : null
                if ('projectExtend' in uniPlugin) {
                    uniPlugin.projectExtend.forEach((value) => {
                        extend.set(value, value)
                    })
                    if (uniPlugin.defaultStart) onStart.push(uniPlugin.identifier.id)
                }
            }
        })
        return { plugins: { list: plugins, onStart: onStart }, infos: { projectExtend: Array.from(extend.values()) } }
    }
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
    ClientStore.set('workspace', 'projectExtend', pluginsInfo.infos.projectExtend)
    let defaultPath = join(__dirname, '../default')
    if (!existsSync(defaultPath)) {
        mkdirSync(defaultPath)
    }
    ClientStore.set('workspace', 'currentManager', {
        workspace: {
            workspaceName: 'default',
            storagePath: defaultPath,
        },
        folders: [],
        onStart: [],
    })
}

//todo 加密文件编码
// function encryptFile() {
//     const { compileFile } = require('bytenode')
//     const { writeFileSync } = require('fs')
//     compileFile({
//         filename: __dirname + './client/client.js',
//         output: __dirname + './client-out/client.jsc',
//     })
//     writeFileSync(__dirname + './client/client.js', "require('bytenode');\nrequire('./client.jsc);")
// }
