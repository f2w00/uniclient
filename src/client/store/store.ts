import Store from 'electron-store'
import { ipcClient } from '../../platform/ipc/handlers/ipc.handler'
import { appDataPath } from '../paths'

export type storeOptions = {
    name: string
    fileExtension: string
    clearInvalidConfig: boolean
}

export class ClientStore {
    static stores: Map<string, Store>
    static cwd: string
    static inited = false
    static renderStore: Store

    constructor(cwd?: string) {
        if (!ClientStore.inited) {
            ClientStore.cwd = cwd ? cwd : appDataPath
            ClientStore.stores = new Map<string, Store>()
            ClientStore.create({
                name: 'config',
                fileExtension: 'json',
                clearInvalidConfig: false,
            })
            ClientStore.renderStore = new Store({
                name: 'render',
                fileExtension: 'json',
                clearInvalidConfig: false,
            })
            ClientStore.inited = true
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
        ipcClient.handle('render:store', (event, purpose: string, key: string, value?: any) => {
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

export class StartRecord {
    static moduleNum = 5
    static startedServices: string[] = []

    static completeLoading(module: string) {
        StartRecord.startedServices.push(module)
        if (module == 'extension') ipcClient.emitLocal('extension:loaded')
        if (StartRecord.startedServices.length >= StartRecord.moduleNum) {
            ipcClient.emitLocal('client:start.complete')
        }
    }
}
