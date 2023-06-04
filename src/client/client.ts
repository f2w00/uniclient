import { GlobalExtensionManager } from './extend/extend.js'
import { initModel, Workbench } from './../workbench/workbench.js'
import { Broker } from '../platform/base/broker/broker.js'
import { app, BrowserWindow } from 'electron'
import { ErrorHandler } from './error/error.js'
import { ClientError, Log } from '../platform/base/log/log.js'
import async from 'async'
import { ClientStore } from './store/store.js'
import { ipcClient } from '../platform/ipc/handlers/ipc.handler.js'
import { rendererEvents } from '../platform/ipc/events/ipc.events.js'
import { GlobalWorkspaceManager } from './workspace/workspace'
import { ProcessManager } from './process/process.js'

import path from 'path'

class Client {
    workbench!: Workbench
    broker!: Broker
    // persist!: PersistenceManager
    mainWindow!: BrowserWindow
    extensionManager!: GlobalExtensionManager
    static dev: boolean | undefined

    constructor(dev?: boolean) {
        try {
            Client.dev = dev
            this.requestSingleInstance()
            this.startup()
            this.bindQuitEvents()
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
            this.createBaseService()
            this.createWorkbench()
            this.initErrorHandler()
            await this.initServices()
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
        ipcClient.on(rendererEvents.benchEvents.quit, () => {
            this.quit()
        })
        ipcClient.on(rendererEvents.benchEvents.close, () => {
            this.quit()
        })
    }

    private createBaseService() {
        new ClientStore()
    }

    private createWorkbench() {
        let initOptions: initModel = ClientStore.get('config', 'workbenchConfig')
        this.workbench = new Workbench(
            path.join(__dirname, '../workbench/preload.js'),
            path.join(__dirname, '../workbench/index.html'),
            Client.dev
        )
        this.mainWindow = this.workbench.getMainWindow()
        this.mainWindow.webContents.once('dom-ready', () => {
            ipcClient.emitToRender('client:init', initOptions)
        })
        this.mainWindow.webContents.once('did-finish-load', async () => {
            await this.mainWindow.show()
            ipcClient.registerToEmit('emitToRender', (event, ...args) => {
                this.mainWindow.webContents.send(event, ...args)
            })
        })
    }

    private async initServices() {
        async
            .parallel([
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
                //初始化postbox服务
                async () => {},
            ])
            .then(() => {
                this.extensionManager = new GlobalExtensionManager()
                new GlobalWorkspaceManager()
            })
    }

    private setErrorHandler(errorHandler: (error: any) => void) {
        ErrorHandler.setUnexpectedErrorHandler(errorHandler)
    }

    private quit() {
        this.workbench.beforeClose()
        ProcessManager.beforeClose()
        async
            .series([
                //终结broker转发者服务
                async () => {
                    this.broker.beforeClose()
                },
                //结束extensionManager服务
                async () => {
                    this.extensionManager.beforeClose()
                },
                async () => {
                    this.broker.beforeClose()
                },
            ])
            .then(() => {
                app.quit()
            })
    }
}

const client = new Client(true)
