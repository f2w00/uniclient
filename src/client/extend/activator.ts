import {ProcessManager} from '../process/process'
import {ChildProcess} from 'child_process'
import {IExtension, IExtensionIdentifier} from './extend.js'
import {ipcClient} from '../../platform/ipc/handlers/ipc.handler'
import path from 'path'

type extensionId = string

/**
 * @description activate是插件激活时执行的函数,
 * beforeClose会在结束插件结束之前执行,
 * 而workerEntrance提供一个需要做cpu密集型工作的js模块的绝对路径
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
        let fileName = path.join(__dirname, './host.js')
        let worker = undefined
        let instance: IExtensionInstance | undefined = undefined
        if (iExtension.worker) {
            // worker = await ProcessManager.createChildProcess(
            //     fileName, 'extensionProcess:' + iExtension.identifier.id, {
            //         event: 'extension:activate',
            //         message: iExtension
            //     })
            iExtension.onEvents.forEach((event) => {
                //todo 应当挂载到localevents上面
                ipcClient.onceLocal(event, async () => {
                    if (iExtension.worker) {
                        worker = await ProcessManager.createChildProcess(
                            fileName,
                            'extensionProcess:' + iExtension.identifier.id,
                            {event: 'extension:activate', message: iExtension}
                        )
                    }
                })
            })
            ipcClient.emitLocal('extension:loaded')
        } else {
            if (onStart) {
                let {extension} = await require(iExtension.main)
                instance = extension
            }
        }
        ExtensionActivator.extensionInstanceManagers.set(iExtension.identifier.id, {
            identifier: iExtension.identifier,
            worker: worker,
            instance: instance
        })
    }

    static beforeClose() {
        ExtensionActivator.extensionInstanceManagers.forEach((value, key) => {
            if (value.instance) {
                value.instance.beforeClose()
            }
        })
    }


    // /**
    //  * @description 每个插件的入口文件extension.js必须导出一个instance对象实现extensionInstance接口
    //  * @param iExtension
    //  */
    // static async doActivateExtension(iExtension: IExtension) {
    //     try {
    //         let extension = await import(iExtension.storage)
    //
    //         await extension.activate()
    //         let worker = undefined
    //         if (extension.workerEntrance) {
    //             // worker = new Worker(extension.workerEntrance)
    //             // fork(extension.workerEntrance)
    //             // require(extension.workerEntrance)
    //             worker = ProcessManager.createChildProcess(extension.workerEntrance, iExtension.identifier.id)
    //             // cluster.fork(extension.workerEntrance)
    //             // await require(extension.workerEntrance)
    //         }
    //         ExtensionActivator.extensionInstanceManagers.set(iExtension.identifier.id, {
    //             identifier: iExtension.identifier,
    //             worker: worker,
    //             instance: {
    //                 activate: extension.activate,
    //                 beforeClose: extension.beforeClose,
    //                 workerEntrance: extension.workerEntrance,
    //             },
    //         })
    //     } catch (e: any) {
    //         throw e
    //     }
    // }
    //
    // static terminateExtensionInstance(extensionId: string) {
    //     let instance = ExtensionActivator.extensionInstanceManagers.get(extensionId)
    //     try {
    //         if (instance) {
    //             instance.instance.beforeClose()
    //             if (instance.worker) instance.worker?.kill()
    //         }
    //     } catch (e: any) {
    //         throw e
    //     }
    // }
    //
    // static beforeClose() {
    //     ExtensionActivator.extensionInstanceManagers.forEach(
    //         (instance: IExtensionInstanceManager, extensionId: string) => {
    //             ExtensionActivator.terminateExtensionInstance(extensionId)
    //         }
    //     )
    // }
}

//
// const activator = new ExtensionActivator()
// ExtensionActivator.events.on('activate', (extension: IExtension) => {
//     activator.doActivateExtension(extension)
// })
