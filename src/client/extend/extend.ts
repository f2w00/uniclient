import { existsSync } from 'fs'
import EventEmitter from 'events'
import { GlobalWorkspaceManager } from '../workspace/workspace'
import { ClientStore } from '../store/store.js'
import { ExtensionActivator } from './activator.js'
import { ipcClient } from '../../platform/ipc/handlers/ipc.handler.js'
import { rendererEvents } from '../../platform/ipc/events/ipc.events.js'
const { plugins, platform } = require('../paths.js')

type extensionStorage = string
type extensionActivateEvent = string

enum storeNames {
    extension = 'extensions',
}

export interface IExtensionIdentifier {
    id: string
    uuid: string | null
}

export interface IExtension {
    version: string
    engine: string
    main: string
    identifier: IExtensionIdentifier
    storage: extensionStorage
    onEvents: extensionActivateEvent[]
    projectExtend: string[]
    worker: string | null
    render: string | null
}

export interface IExtensionManager {
    onStart: string[]
    enabledExtensions: IExtension[]
}

function verifyStoragePath(path: string) {
    return existsSync(path)
}

export class ExtensionManager extends EventEmitter implements IExtensionManager {
    enabledExtensions: IExtension[]
    onStart: string[]

    constructor(manager: IExtensionManager) {
        super()
        this.enabledExtensions = manager.enabledExtensions
        this.onStart = manager.onStart
        new ExtensionActivator()
        this.loadExtensions()
    }

    async loadExtensions() {
        this.enabledExtensions.forEach((extension: IExtension, index: number) => {
            if (verifyStoragePath(plugins + extension.storage)) {
                this.onStart.includes(extension.identifier.id)
                    ? ExtensionActivator.doActivateExtension(extension, true)
                    : ExtensionActivator.doActivateExtension(extension, false)
            } else {
                delete this.enabledExtensions[index]
                this.emit('extension-invalid', extension)
            }
        })
    }

    findExtension(from: string, extension: IExtension): number {
        if (from == 'enabled') {
            this.enabledExtensions.find((extend, index) => {
                if (extend.identifier === extension.identifier) {
                    return index
                }
            })
        }
        return -1
    }

    installExtension(extension: IExtension) {
        if (verifyStoragePath(extension.storage)) {
            this.enabledExtensions.push(extension)
            //插入project extend到全局workspace管理的空间中
            GlobalWorkspaceManager.addProjectExtend(extension.projectExtend)
        }
    }

    uninstallExtension(extension: IExtension) {
        if (verifyStoragePath(extension.storage)) {
            let n = this.findExtension('enabled', extension)
            if (n != -1) {
                delete this.enabledExtensions[n]
            }
        }
    }

    addExtensionOnStart(extensionId: string) {
        this.enabledExtensions.forEach((extension) => {
            if (extension.identifier.id == extensionId) {
                this.onStart.push(extensionId)
            }
        })
    }

    removeExtensionOnStart(extensionId: string) {
        this.onStart.find((id, index) => {
            if (id == extensionId) {
                delete this.onStart[index]
            }
        })
    }

    beforeClose() {
        ExtensionActivator.beforeClose()
    }
}

export class GlobalExtensionManager {
    currentManager!: ExtensionManager
    revert!: Function

    constructor() {
        ClientStore.create({
            name: storeNames.extension,
            fileExtension: 'json',
            clearInvalidConfig: false,
        })
        this.startUp()
    }

    async startUp() {
        this.revert = await this.hookRequire(platform)
        await this.loadManager()
        await this.bindEventsToMain()
    }

    /**
     * @description 将api注入到插件运行过程中,通过劫持extension.js文件的require
     *  然后替换其中的uniclient字段改为api实际路径
     * @param apiPath
     */
    async hookRequire(apiPath: string) {
        const pirates = await import('pirates')
        apiPath = apiPath.replace(/\\/g, '/')
        const matcher = (filename: string) => {
            return filename.includes('plugins')
        }
        return pirates.addHook(
            (code: string, filename: string) => {
                return code.replace(/require\((['"])uniclient\1\)/, `require("${apiPath}")`)
            },
            { exts: ['.js'], matcher: matcher }
        )
    }

    loadManager() {
        let manager: IExtensionManager = ClientStore.get(storeNames.extension, 'globalExtensionManager')
        this.currentManager = new ExtensionManager(manager)
        //监听无效扩展事件
        this.currentManager.on('extension-invalid', (extension: IExtension) => {
            console.log(extension.identifier)
        })
    }

    /**
     * @description 将插件相关的所有事件绑定到主进程上面,并且制定了相关listener
     */
    bindEventsToMain() {
        //绑定插件安装
        ipcClient.on(rendererEvents.extensionEvents.install, (event, workspace: string, extension: IExtension) => {
            this.currentManager.installExtension(extension)
        })
        //绑定插件卸载方法
        ipcClient.on(rendererEvents.extensionEvents.uninstall, (event, workspace: string, extension: IExtension) => {
            this.currentManager.uninstallExtension(extension)
        })
    }

    updateStoreOfManagers() {
        ClientStore.set(storeNames.extension, 'globalExtensionManager', {
            enabledExtensions: this.currentManager.enabledExtensions,
            onStart: this.currentManager.onStart,
        })
    }

    beforeClose() {
        this.updateStoreOfManagers()
        this.revert()
        this.currentManager.beforeClose()
    }
}
