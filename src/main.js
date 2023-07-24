const { config } = require('dotenv')
config()
require('v8-compile-cache')

async function electronStart() {
    const { app, Menu, protocol } = require('electron')
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
        clientStart()
    })
}
electronStart()

async function clientStart() {
    const { Client } = await require('../src/client/client.js')
    new Client()
}

/**
 * 如果是第一次运行(client.data文件夹不存在),那么会初始化client.data文件夹,然后创建ClientStore服务并且初始化存储文件
 * @returns
 */
function generateUserDataPath() {
    const { existsSync, readFileSync } = require('fs')
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
            if (!existsSync(envPath)) {
                console.log('2')
                let data = `V8_COMPILE_CACHE_CACHE_DIR='${dataPath}\cache'\nUNICLIENT_APPDATA='${dataPath}'\n`
                writeFileSync(envPath, String(data))
            } else {
                let data = readFileSync(envPath, 'utf-8')
                if (data.includes('V8_COMPILE_CACHE_CACHE_DIR' && data.includes('UNICLIENT_APPDATA'))) {
                    data = data.replace(
                        /^V8_COMPILE_CACHE_CACHE_DIR=.*$/g,
                        `V8_COMPILE_CACHE_CACHE_DIR='${dataPath}/cache'`
                    )
                    data = data.replace(/^UNICLIENT_APPDATA=.*$/g, `UNICLIENT_APPDATA='${dataPath}'`)
                    writeFileSync(envPath, String(data))
                } else {
                    let data = `V8_COMPILE_CACHE_CACHE_DIR='${dataPath}\\cache'\nUNICLIENT_APPDATA='${dataPath}'\n`
                    writeFileSync(envPath, String(data))
                }
                config()
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
    const { ClientStore } = require('../src/platform/base/store/store.js')
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
    ClientStore.create({ name: 'render', fileExtension: 'json', clearInvalidConfig: false })
    ClientStore.set('render', 'uniclientActivate', {
        leftTabActivate: 'space',
        rightTabActivate: '',
        bottomTabActivate: '',
        mainTabsActivate: 'welcome',
    })
    ClientStore.set('render', 'uniclientMenuConfig', [
        {
            label: '日志',
            tips: 'Log',
            fn: 'function fn(that){ console.log("Log") }',
        },
        {
            label: '文档',
            tips: 'Document',
            fn: 'function fn(that){ console.log("Document") }',
        },
        {
            label: '设置',
            tips: 'Settings',
            fn: 'function fn(that){ console.log("Settings") }',
            disabled: true,
        },
        {
            line: true,
        },
        {
            label: 'OPCUA',
            tips: '',
            children: [
                {
                    label: '服务',
                    tips: 'Server',
                    fn: 'function fn(that){ console.log("Server", "addServerView fn"); that.handleAddserver({ viewPath: \'../../src/plugins/ua.client/ua.render/opcua/addServerView.html\' }) }',
                },
                {
                    label: '打开',
                    tips: 'Open',
                    fn: 'function fn(that){ console.log("OPCUA", "打开") }',
                },
                {
                    label: '编辑',
                    tips: 'Edit',
                    disabled: true,
                    fn: 'function fn(that){ console.log("OPCUA", "编辑") }',
                },
                {
                    label: '删除',
                    tips: 'Delete',
                    fn: 'function fn(that){ console.log("OPCUA", "删除") }',
                },
            ],
        },
    ])
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
