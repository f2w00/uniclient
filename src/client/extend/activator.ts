import { ProcessManager } from '../process/process'
import { ChildProcess } from 'child_process'
import { IExtension, IExtensionIdentifier } from './extend.js'
import { ipcClient } from '../../platform/ipc/handlers/ipc.handler'
const { plugins, extensionHost } = require('../paths')

type extensionId = string

/**
 * @description activate是插件激活时执行的函数,
 * beforeClose会在结束插件结束之前执行,
 */
export interface IExtensionInstance {
    activate: () => void
    beforeClose: () => void
}

export interface IExtensionInstanceManager {
    identifier: IExtensionIdentifier
    worker?: ChildProcess
    instance?: IExtensionInstance
}

export class ExtensionActivator {
    static extensionInstanceManagers: Map<extensionId, IExtensionInstanceManager> = new Map()

    static async doActivateExtension(iExtension: IExtension, onStart?: boolean) {
        if (onStart) {
            if (iExtension.worker) {
                ExtensionActivator.activateWorker(iExtension)
            } else {
                let { extension } = await require(plugins + iExtension.main)
                let instance: IExtensionInstance = extension
                await instance.activate()
                ExtensionActivator.extensionInstanceManagers.set(iExtension.identifier.id, {
                    identifier: iExtension.identifier,
                    worker: undefined,
                    instance: instance,
                })
            }
        } else {
            if (iExtension.worker) {
                ExtensionActivator.bindActivateEvents(iExtension.onEvents, async () => {
                    ExtensionActivator.activateWorker(iExtension)
                })
                ipcClient.emitLocal('extension:loaded')
            } else {
                ExtensionActivator.bindActivateEvents(iExtension.onEvents, async () => {
                    let { extension } = await require(plugins + iExtension.main)
                    let instance: IExtensionInstance = extension
                    ExtensionActivator.extensionInstanceManagers.set(iExtension.identifier.id, {
                        identifier: iExtension.identifier,
                        worker: undefined,
                        instance: instance,
                    })
                })
            }
        }
    }

    static async activateWorker(iExtension: IExtension) {
        if (!ExtensionActivator.extensionInstanceManagers.has(iExtension.identifier.id)) {
            let worker = await ProcessManager.createChildProcess(
                extensionHost,
                'extensionProcess:' + iExtension.identifier.id,
                {
                    event: 'extension:activate',
                    message: iExtension,
                }
            )
            ExtensionActivator.extensionInstanceManagers.set(iExtension.identifier.id, {
                identifier: iExtension.identifier,
                worker: plugins + worker,
                instance: undefined,
            })
        }
    }

    static bindActivateEvents(events: string[], handler: () => void | Promise<void>) {
        events.forEach((event) => {
            ipcClient.onceLocal(event, handler)
        })
    }

    static beforeClose() {
        ExtensionActivator.extensionInstanceManagers.forEach((value, key) => {
            if (value.instance) {
                value.instance.beforeClose()
            }
        })
    }
}
