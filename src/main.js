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

function aesDecrypt(encrypted, key) {
    const crypto = require('crypto')
    const decipher = crypto.createDecipher('aes192', key)
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
}

function authenticate(code, key) {
    if (aesDecrypt(code, key) == 'UniclientByHhjAndWq') {
        return true
    } else {
        return false
    }
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
    ClientStore.create({ name: 'share', fileExtension: 'json', clearInvalidConfig: false })
    ClientStore.set('share', 'uniclientActivate', {
        leftTabActivate: 'space',
        rightTabActivate: '',
        bottomTabActivate: '',
        mainTabsActivate: 'welcome',
    })
    ClientStore.set('share', 'uniclientMenuConfig', [
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
    ClientStore.set('share', 'workbenchConfig', {
        rightSide: {
            display: false,
        },
        leftSide: {
            display: true,
        },
        bottomSide: {
            display: true,
        },
    })
    ClientStore.set('share', 'pluginInstalled', [
        {
            title: 'opcua',
            content: '解决opcua连接配置,以及数据库功能',
            iconUrl: '../../../src/plugins/ua.client/ua.render/opcua/assets/PluginIcon.svg',
            author: 'f2w00',
        },
        {
            title: 'esay-report',
            content: '快速生成样式多变的报表,功能简洁而强大',
            iconUrl: '../../../src/plugins/easy-report/assets/PluginIcon.svg',
            author: 'wangqi2002',
        },
    ])
    ClientStore.set('share', 'subviewLeftTabsData', [
        {
            title: 'mainMenu',
            name: 'mainMenu',
            iconSrc: './assets/icon/icon.svg',
            disabled: true,
        },
        {
            title: 'space',
            name: 'space',
            content: '项目',
            iconSrc: './assets/icon/space.svg',
            viewPath: './components/projectView.html',
        },
        {
            title: 'plugin',
            name: 'plugin',
            content: '插件',
            iconSrc: './assets/icon/plugin.svg',
            viewPath: './components/pluginView.html',
        },
        {
            title: 'tutorial',
            name: 'tutorial',
            content: '用户手册',
            iconSrc: './assets/icon/tutorial.svg',
            viewPath: './components/tutorial/tutorial.html',
            clickSendToWindow: [
                {
                    event: 'leftBar:click.tutorial',
                    params: [
                        {
                            title: 'tutorial',
                            name: 'tutorial',
                            content: 'Tab 1 content',
                            src: './components/tutorial/uniclient.html',
                        },
                        {
                            title: 'uaclient',
                            name: 'uaclient',
                            content: 'uaclient',
                            src: './components/tutorial/uniclient.html',
                        },
                        {
                            title: 'ok',
                            name: 'ok',
                            content: 'ok',
                            src: './components/tutorial/uniclient.html',
                        },
                    ],
                },
            ],
        },
        {
            title: 'opcua',
            name: 'opcua',
            content: 'opcua',
            iconSrc: '../../src/plugins/ua.client/ua.render/opcua/assets/project.svg',
            viewPath: '../../src/plugins/ua.client/ua.render/opcua/address.html',
            clickSendToWindow: [],
            clickCreateTab: [
                {
                    event: 'leftBar:created.opcua',
                    params: [
                        {
                            title: 'dataView',
                            name: 'dataView',
                            content: 'dataView',
                            position: 'main',
                            src: '../../src/plugins/ua.client/ua.render/opcua/dataView.html',
                        },
                        {
                            title: 'attributes',
                            name: 'attributes',
                            content: 'attributes',
                            iconSrc: './assets/icon/attribute-management.svg',
                            position: 'right',
                            src: '../../src/plugins/ua.client/ua.render/opcua/attributes.html',
                        },
                    ],
                },
            ],
        },
        {
            title: 'easy-report',
            name: 'easy-report',
            content: 'easy-report',
            iconSrc: '../../src/plugins/easy-report/assets/report.svg',
            viewPath: '../../src/plugins/easy-report/index.html',
            clickSendToWindow: [],
            clickCreateTab: [
                {
                    event: 'leftBar:created.easy-report',
                    params: [
                        {
                            title: 'easy-report',
                            name: 'easy-report',
                            content: 'easy-report',
                            position: 'main',
                            src: '../../src/plugins/easy-report/dist/index.html',
                        },
                    ],
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

//todo 写入配置文件,验证激活码
