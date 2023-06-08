import {ipcMain, IpcMainEvent, IpcMainInvokeEvent} from 'electron'
import EventEmitter from 'events'

export class ipcClient {
    static localEvents: EventEmitter = new EventEmitter()
    static clientEvents: EventEmitter = new EventEmitter()

    static on(event: string, eventHandler: (event: IpcMainEvent, ...args: any[]) => void) {
        ipcMain.on(event, eventHandler)
    }

    static once(event: string, eventHandler: (event: IpcMainEvent, ...args: any[]) => void) {
        ipcMain.once(event, eventHandler)
    }

    static handle(event: string, eventHandler: (event: IpcMainInvokeEvent, ...args: any[]) => void) {
        ipcMain.handle(event, eventHandler)
    }

    /**
     * @description 通过mainwindow进行广播,并且发送消息到mainwindow.webContents
     * @param event
     * @param args
     */
    static emitToRender(event: string, ...args: any[]) {
        // ipcClient.currentWindow(event, ...args)
        // ipcMain.emit(event, ...args)
        ipcClient.localEvents.emit('emitToRender', event, ...args)
    }

    static registerToEmit(event: string, eventHandler: (subEvent: string, ...args: any[]) => void) {
        ipcClient.localEvents.on(event, eventHandler)
    }

    static emitLocal(event: string, ...args: any[]) {
        ipcClient.localEvents.emit(event, ...args)
    }

    static onLocal(event: string, handler: (...args: any[]) => void) {
        ipcClient.localEvents.on(event, handler)
    }

    static onceLocal(event: string, handler: (...args: any[]) => void) {
        ipcClient.localEvents.once(event, handler)
    }

    static onClient(event: string, handler: (...args: any[]) => void) {
        ipcClient.clientEvents.on(event, handler)
    }

    static emitClient(event: string, ...args: any[]) {
        ipcClient.clientEvents.emit(event, ...args)
    }

    static emitToChild(event: string, module: string, arg: any) {
        ipcClient.clientEvents.emit('sendToIpc', 'extensionProcess:' + module, {event: event, message: arg})
    }
}
