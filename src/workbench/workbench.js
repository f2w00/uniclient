"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const store_js_1 = require("../platform/base/store/store.js");
class Workbench extends events_1.EventEmitter {
    constructor(preload, homeViewPath, icon, width, height) {
        super();
        this.winState = (0, electron_window_state_1.default)({
            defaultWidth: Math.floor((electron_1.screen.getPrimaryDisplay().workAreaSize.width * 3) / 4),
            defaultHeight: Math.floor((electron_1.screen.getPrimaryDisplay().workAreaSize.height * 3) / 4),
        });
        this.createMainWindow({
            preloadPath: preload,
            indexHtmlPath: homeViewPath,
            width: width,
            height: height,
            minHeight: 600,
            minWidth: 800,
            icon: icon,
        });
        this.existViews = new Map();
    }
    createMainWindow(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.mainWindow = new electron_1.BrowserWindow({
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
            });
            yield this.mainWindow.loadFile(options.indexHtmlPath);
            this.initBind(this.mainWindow);
            this.winState.manage(this.mainWindow);
        });
    }
    initBind(mainWindow) {
        ipc_handler_js_1.ipcClient.onRender(ipc_events_js_1.renderEvents.benchEvents.minimize, () => {
            mainWindow.minimize();
        });
        ipc_handler_js_1.ipcClient.onRender(ipc_events_js_1.renderEvents.benchEvents.maximize, () => {
            mainWindow.isMaximized() ? mainWindow.restore() : mainWindow.maximize();
        });
        ipc_handler_js_1.ipcClient.onRender('render:config.update', (event, configName, configData) => {
            let config = configData;
            store_js_1.ClientStore.set('config', configName, config);
        });
    }
    createWindow(viewUrl, isWebView) {
        return __awaiter(this, void 0, void 0, function* () {
            const window = new electron_1.BrowserWindow({
                frame: false,
            });
            isWebView ? yield window.loadFile(viewUrl) : yield window.loadURL(viewUrl);
        });
    }
    createView(viewId, viewUrl, rectangle = { x: 0, y: 0, width: 300, height: 300 }, isWebView = false) {
        return __awaiter(this, void 0, void 0, function* () {
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
                ? yield browserView.webContents.loadURL(viewUrl).then(() => {
                    this.mainWindow.addBrowserView(browserView);
                })
                : yield browserView.webContents.loadFile(viewUrl).then(() => {
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
        });
    }
    getMainWindow() {
        return this.mainWindow;
    }
    beforeClose() {
    }
}
exports.Workbench = Workbench;
