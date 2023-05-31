"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workbench = void 0;
const electron_1 = require("electron");
const events_1 = require("events");
const ipc_events_js_1 = require("../platform/ipc/events/ipc.events.js");
const ipc_handler_js_1 = require("../platform/ipc/handlers/ipc.handler.js");
const electron_window_state_1 = __importDefault(require("electron-window-state"));
const store_js_1 = require("../client/store/store.js");
class Workbench extends events_1.EventEmitter {
    existViews;
    mainWindow;
    winState;
    constructor(preload, homeViewPath, dev = false, width, height) {
        super();
        this.winState = (0, electron_window_state_1.default)({
            defaultWidth: (electron_1.screen.getPrimaryDisplay().workAreaSize.width * 3) / 4,
            defaultHeight: (electron_1.screen.getPrimaryDisplay().workAreaSize.height * 3) / 4,
        });
        this.createMainWindow(preload, homeViewPath, dev, electron_1.screen.getPrimaryDisplay().workAreaSize.width / 4, electron_1.screen.getPrimaryDisplay().workAreaSize.height / 4, width, height);
        this.existViews = new Map();
    }
    async createMainWindow(preloadPath, indexHtmlPath, dev = false, minWidth, minHeight, width, height) {
        this.mainWindow = new electron_1.BrowserWindow({
            x: this.winState.x,
            y: this.winState.y,
            width: this.winState.width,
            minWidth: minWidth,
            minHeight: minHeight,
            height: this.winState.height,
            frame: false,
            center: true,
            show: false,
            webPreferences: {
                preload: preloadPath,
                devTools: true,
                nodeIntegration: true,
                contextIsolation: false,
            },
        });
        if (dev) {
            this.mainWindow.webContents.openDevTools();
        }
        await this.mainWindow.loadFile(indexHtmlPath);
        this.initBind(this.mainWindow);
        this.winState.manage(this.mainWindow);
    }
    initBind(mainWindow) {
        ipc_handler_js_1.ipcClient.on(ipc_events_js_1.rendererEvents.benchEvents.minimize, () => {
            mainWindow.minimize();
        });
        ipc_handler_js_1.ipcClient.on(ipc_events_js_1.rendererEvents.benchEvents.maximize, () => {
            if (mainWindow.isMaximized()) {
                mainWindow.restore();
            }
            else {
                mainWindow.maximize();
            }
        });
        ipc_handler_js_1.ipcClient.on('render:config.update', (event, configName, configData) => {
            let config = configData;
            store_js_1.ClientStore.set('config', configName, config);
        });
    }
    async createWindow(viewUrl, isWebView) {
        const window = new electron_1.BrowserWindow({
            frame: false,
        });
        isWebView ? await window.loadFile(viewUrl) : await window.loadURL(viewUrl);
    }
    async createView(viewId, viewUrl, rectangle = { x: 0, y: 0, width: 300, height: 300 }, isWebView = false) {
        if (this.existViews.has(viewId)) {
            return false;
        }
        const browserView = new electron_1.BrowserView({
            webPreferences: {
                nodeIntegration: true,
                devTools: true,
                enablePreferredSizeMode: true,
            },
        });
        isWebView
            ? await browserView.webContents.loadURL(viewUrl).then(() => {
                this.mainWindow.addBrowserView(browserView);
            })
            : await browserView.webContents.loadFile(viewUrl).then(() => {
                this.mainWindow.addBrowserView(browserView);
            });
        browserView.setBounds(rectangle);
        browserView.setAutoResize({
            horizontal: true,
            width: true,
            vertical: false,
            height: false,
        });
        this.existViews.set(viewId, browserView);
        this.emit('created:view.' + viewId);
        return true;
    }
    getMainWindow() {
        return this.mainWindow;
    }
    beforeClose() {
        this.mainWindow.hide();
    }
}
exports.Workbench = Workbench;
