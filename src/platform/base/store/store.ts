import Store from 'electron-store'
import {ipcClient} from '../../ipc/handlers/ipc.handler'
import {appDataPath} from '../paths'
import {LocalEvents, renderEvents} from '../../ipc/events/ipc.events'

export type storeOptions = {
    name: string
    fileExtension: string
    clearInvalidConfig: boolean
}

export class ClientStore {
    static stores: Map<string, Store> = new Map<string, Store>()
    static cwd: string
    static renderStore: Store

    constructor(options?: { client?: boolean; cwd?: string }) {
        ClientStore.cwd = options?.cwd ? options.cwd : appDataPath + '/store'
        if (options?.client) {
            ClientStore.renderStore = new Store({
                name: 'render',
                fileExtension: 'json',
                clearInvalidConfig: false,
            })
            this.initBind()
        }
    }

    static set(storeName: string, key: string, content: any): boolean {
        let store = ClientStore.stores.get(storeName)
        if (store) {
            store.set(key, content)
            return true
        } else {
            return false
        }
    }

    static get(storeName: string, key: string): any {
        let store = ClientStore.stores.get(storeName)
        if (store) {
            return store.get(key)
        } else {
            return false
        }
    }

    static del(storeName: string, key: string) {
        let store = ClientStore.stores.get(storeName)
        if (store) {
            store.delete(key)
            return true
        } else {
            return false
        }
    }

    static has(storeName: string, key: string): boolean {
        let store = ClientStore.stores.get(storeName)
        if (store) {
            return store.has(key)
        } else {
            return false
        }
    }

    static create(options: storeOptions) {
        let result = ClientStore.stores.get(options.name)
        if (!result) {
            let store = new Store({ ...options, cwd: ClientStore.cwd })
            ClientStore.stores.set(options.name, store)
            return store
        } else {
            return result
        }
    }

    private initBind() {
        ipcClient.handleRender(renderEvents.storeEvents.store, (event, purpose: string, key: string, value?: any) => {
            let result = undefined
            switch (purpose) {
                case 'set':
                    {
                        ClientStore.renderStore.set(key, value)
                        result = true
                    }
                    break
                case 'get':
                    result = ClientStore.renderStore.get(key)
                    break
                case 'del':
                    {
                        ClientStore.renderStore.delete(key)
                        result = true
                    }
                    break
                default:
                    break
            }
            return result
        })
    }
}

export class StorePrivate {
    static store: Store

    constructor(options: storeOptions) {
        StorePrivate.store = new Store({...options, cwd: appDataPath + '/store'})
    }

    static set(key: string, content: any): boolean {
        StorePrivate.store.set(key, content)
        return true
    }

    static get(key: string): any {
        return StorePrivate.store.get(key)
    }

    static del(key: string) {
        StorePrivate.store.delete(key)
        return true
    }

    static has(key: string): boolean {
        return StorePrivate.store.has(key)
    }
}

export class RunningRecord {
    static moduleNum = 5
    static startedServices: Map<string, string> = new Map()

    static completeLoading(module: string) {
        RunningRecord.startedServices.set(module, module)
        if (module == 'extension') ipcClient.emitLocal(LocalEvents.innerEvents.loadedExtension)
        if (RunningRecord.startedServices.size >= RunningRecord.moduleNum) {
            ipcClient.emitLocal(LocalEvents.innerEvents.completeLoading)
            ipcClient.emitToRender('clientLoaded')
        }
    }

    static completeClose(module: string) {
        RunningRecord.startedServices.delete(module)
        if (module == 'extension') ipcClient.emitLocal(LocalEvents.innerEvents.extensionClosed)
        if (RunningRecord.startedServices.size == 1) {
            ipcClient.emitLocal(LocalEvents.innerEvents.completeClose)
        }
    }
}

export const sharedData = new Store({
                                        name: 'share',
                                        clearInvalidConfig: false,
                                        fileExtension: 'json',
                                        cwd: appDataPath + '/store',
                                    })
