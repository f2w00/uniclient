import { IProject } from './../platform/base/project/project'
import { BrowserView, BrowserWindow, Rectangle, screen } from 'electron'
import { EventEmitter } from 'events'
import { renderEvents } from '../platform/ipc/events/ipc.events.js'
import { ipcClient } from '../platform/ipc/handlers/ipc.handler.js'
import windowStateKeeper from 'electron-window-state'
import { ClientStore } from '../client/store/store.js'
import { workspaceAttribute } from '../client/workspace/workspace.js'

type viewId = string

type sideStyle = {
    selectDisplay: number
    width: number
    subDisplay: number[]
    extraButtons: {
        name: string
        loc: string
        iconPath: string
        renderPath: string
        clickToSend: string
    }[]
}

export type initModel = {
    leftSide: sideStyle
    rightSide: sideStyle
    downSide: sideStyle
    tutorial: { name: string; type: 'local' | 'web'; url: string }[]
    currentWorkspace: workspaceAttribute
    currentProject: IProject
}

export class Workbench extends EventEmitter {
    private existViews: Map<viewId, BrowserView>
    private mainWindow!: BrowserWindow
    private winState: windowStateKeeper.State

    constructor(preload: string, homeViewPath: string, icon?: string, width?: number, height?: number) {
        super()
        this.winState = windowStateKeeper({
            defaultWidth: Math.floor((screen.getPrimaryDisplay().workAreaSize.width * 3) / 4),
            defaultHeight: Math.floor((screen.getPrimaryDisplay().workAreaSize.height * 3) / 4),
        })
        this.createMainWindow({
            preloadPath: preload,
            indexHtmlPath: homeViewPath,
            width: width,
            height: height,
            minHeight: 600,
            minWidth: 800,
            icon: icon,
        })
        this.existViews = new Map()
    }

    private async createMainWindow(options: {
        preloadPath: string
        indexHtmlPath: string
        icon?: string
        minWidth?: number
        minHeight?: number
        width?: number
        height?: number
    }) {
        this.mainWindow = new BrowserWindow({
            x: this.winState.x,
            y: this.winState.y,
            width: this.winState.width,
            minWidth: options.minWidth,
            minHeight: options.minHeight,
            height: this.winState.height,
            frame: false,
            center: true,
            show: false,
            icon: options.icon,
            webPreferences: {
                preload: options.preloadPath,
                devTools: true,
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false,
            },
        })
        await this.mainWindow.loadFile(options.indexHtmlPath)
        this.initBind(this.mainWindow)
        this.winState.manage(this.mainWindow)
    }

    initBind(mainWindow: BrowserWindow) {
        ipcClient.onRender(renderEvents.benchEvents.minimize, () => {
            mainWindow.minimize()
        })
        ipcClient.onRender(renderEvents.benchEvents.maximize, () => {
            mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize()
        })
        ipcClient.onRender('render:config.update', (event, configName, configData) => {
            let config: initModel = configData
            ClientStore.set('config', configName, config)
        })
    }

    public async createWindow(viewUrl: string, isWebView: boolean) {
        const window = new BrowserWindow({
            // ...this.winState.winOptions,
            frame: false,
        })
        isWebView ? await window.loadFile(viewUrl) : await window.loadURL(viewUrl)
    }

    public async createView(
        viewId: string,
        viewUrl: string,
        rectangle: Rectangle = { x: 0, y: 0, width: 300, height: 300 },
        isWebView: boolean = false
    ) {
        if (this.existViews.has(viewId)) {
            return false
        }
        const browserView = new BrowserView({
            webPreferences: {
                nodeIntegration: true,
                devTools: true,
                enablePreferredSizeMode: true,
            },
        })

        isWebView
            ? await browserView.webContents.loadURL(viewUrl).then(() => {
                  this.mainWindow.addBrowserView(browserView)
              })
            : await browserView.webContents.loadFile(viewUrl).then(() => {
                  this.mainWindow.addBrowserView(browserView)
              })
        browserView.setBounds(rectangle)
        browserView.setAutoResize({
            horizontal: true,
            width: true,
            vertical: false,
            height: false,
        })
        // browserView.webContents.openDevTools()
        // this.bindCloseEvent(viewId, browserView)
        this.existViews.set(viewId, browserView)
        this.emit('created:view.' + viewId)
        return true
    }

    public getMainWindow(): BrowserWindow {
        return this.mainWindow
    }

    beforeClose() {
        // this.mainWindow.hide()
        // this.emit('close')
    }

    // private bindCloseEvent(viewId: string, view: BrowserView) {
    //     EventBind.onceBind()
    //     ipcMain.once("close:view." + viewId, () => {
    //         view.webContents.close()
    //     })
    // }
}
