import {IExtension} from './extend.js'

/**
 * @description activate是插件激活时执行的函数,
 * beforeClose会在结束插件结束之前执行,
 */
export interface IExtensionInstance {
    activate: () => void
    beforeClose: () => void
}

class WorkerActivator {
    static beforeExtensionClose: () => void

    static async activate(iExtension: IExtension) {
        try {
            let {extension} = await import(iExtension.main)
            let instance: IExtensionInstance = extension
            instance.activate()
            WorkerActivator.beforeExtensionClose = instance.beforeClose
            if (iExtension.worker) {
                await require(iExtension.worker)
            }
        } catch (e: any) {
            throw e
        }
    }

    static beforeClose() {
        WorkerActivator.beforeExtensionClose()
    }
}

process.on('message', (param: { event: string, message?: IExtension }) => {
    switch (param.event) {
        case 'extension:activate':
            if (param.message) WorkerActivator.activate(param.message)
            break
        case 'extension:close': {
            WorkerActivator.beforeClose()
            process.exit(0)
            break
        }
    }
})
