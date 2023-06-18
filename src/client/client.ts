import { GlobalExtensionManager } from './extend/extend.js'
import { Workbench } from '../workbench/workbench'
import { Broker } from '../platform/base/broker/broker.js'
import { app, BrowserWindow } from 'electron'
import { ErrorHandler } from './error/error.js'
import { ClientError, Log } from '../platform/base/log/log.js'
import { parallel, series } from 'async'
import { ClientStore } from './store/store.js'
import { ipcClient } from '../platform/ipc/handlers/ipc.handler.js'
import { MainEmitEvents, renderEvents } from '../platform/ipc/events/ipc.events.js'
import { GlobalWorkspaceManager } from './workspace/workspace'
import { ProcessManager } from './process/process.js'
import { globalShortcut } from 'electron'
import { mainIconPath, mainPreloadPath, mainViewPath } from './paths.js'

enum shortCuts {
    dev = 'Alt+d',
    zoomUp = 'CommandOrControl+=',
    zoomDown = 'CommandOrControl+-',
}

export class Client {
    workbench!: Workbench
    broker!: Broker
    mainWindow!: BrowserWindow
    extension!: GlobalExtensionManager
    beforeCloseRender: Function[] = []

    constructor() {
        try {
            this.requestSingleInstance()
            this.startup()
        } catch (e: any) {
            console.error(e.message)
            app.exit(1)
        }
    }

    private requestSingleInstance() {
        if (!app.requestSingleInstanceLock()) {
            app.quit()
        }
    }

    private async startup() {
        try {
            this.initErrorHandler()
            this.createBaseService()
            await this.createWorkbench()
            await this.initServices()
            this.bindQuitEvents()
        } catch (e: any) {
            console.log('出错了')
            throw e
        }
    }

    private initErrorHandler() {
        new ErrorHandler()
        ErrorHandler.setUnexpectedErrorHandler((error: any) => {
            console.log(error)
            if ('source' in error) {
                Log.error(error)
            } else {
                Log.error(
                    new ClientError(
                        'Uncaught',
                        'An unexpected exception while application running',
                        error.message,
                        error.stack
                    )
                )
            }
        })
        ErrorHandler.setUnhandledRejection((rejection: any) => {
            console.log(rejection)
            Log.error(
                new ClientError(
                    'UnhandledRejection',
                    'An UnhandledRejection while application running',
                    rejection.message,
                    rejection.stack
                )
            )
        })
    }

    private bindQuitEvents() {
        ipcClient.onRender(renderEvents.benchEvents.quit, () => {
            this.quit()
        })
        ipcClient.onRender(renderEvents.benchEvents.close, () => {
            this.quit()
        })
        ipcClient.onRender(renderEvents.benchEvents.beforeClose, (_, callback) => {
            this.beforeCloseRender.push(callback)
        })
    }

    private createBaseService() {
        new ClientStore()
    }

    private createWorkbench() {
        this.workbench = new Workbench(mainPreloadPath, mainViewPath, mainIconPath)
        this.mainWindow = this.workbench.getMainWindow()
        this.mainWindow.webContents.once('did-finish-load', async () => {
            await this.mainWindow.show()
            ipcClient.onLocal('emitToRender', (event, ...args) => {
                this.mainWindow.webContents.send(event, ...args)
            })
        })
        this.registerShortCut()
    }

    private registerShortCut() {
        globalShortcut.register(shortCuts.dev, () => {
            if (this.mainWindow.isFocused()) {
                this.mainWindow.webContents.isDevToolsOpened()
                    ? this.mainWindow.webContents.closeDevTools()
                    : this.mainWindow.webContents.openDevTools()
            }
        })
        globalShortcut.register(shortCuts.zoomUp, () => {
            let current = this.mainWindow.webContents.getZoomLevel()
            this.mainWindow.webContents.setZoomLevel(current + 0.1)
            ipcClient.emitToRender(MainEmitEvents.logEmitEvents.notice, {
                title: '全局缩放',
                message: `${Math.round((current + 0.1) * 100)}%`,
            })
        })
        globalShortcut.register(shortCuts.zoomDown, () => {
            let current = this.mainWindow.webContents.getZoomLevel()
            this.mainWindow.webContents.setZoomLevel(current - 0.1)
            ipcClient.emitToRender(MainEmitEvents.logEmitEvents.notice, {
                title: '全局缩放',
                message: `${Math.round((current - 0.1) * 100)}%`,
            })
        })
    }

    private async initServices() {
        ipcClient.onceLocal('extension:loaded', () => {
            new GlobalWorkspaceManager()
        })
        parallel([
            // 初始化Broker中间转发者服务
            async () => {
                this.broker = new Broker()
            },
            //初始化进程管理者
            async () => {
                new ProcessManager()
            },
            //初始化log服务
            async () => {
                new Log()
            },
            //初始化插件服务
            async () => {
                this.extension = new GlobalExtensionManager()
            },
        ])
    }

    private quit() {
        this.mainWindow.hide()
        this.beforeCloseRender.forEach((func) => func())
        series([
            //终结broker转发者服务
            async () => {
                this.broker.beforeClose()
            },
            //结束extensionManager服务
            async () => {
                this.extension.beforeClose()
            },
            async () => {
                this.broker.beforeClose()
            },
        ]).then(() => {
            this.workbench.beforeClose()
            ProcessManager.beforeClose()
            app.quit()
        })
    }
}
