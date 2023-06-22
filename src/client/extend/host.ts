import {IExtension} from './extend.js'
import {platform, plugins} from '../../platform/base/paths'

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
            let {extension} = await require(plugins + iExtension.main)
            let instance: IExtensionInstance = extension
            instance.activate()
            WorkerActivator.beforeExtensionClose = instance.beforeClose
            if (iExtension.worker) {
                await WorkerActivator.hookRequire(platform)
                await require(plugins + iExtension.worker)
            }
        } catch (e: any) {
            throw e
        }
    }

    static async hookRequire(apiPath: string) {
        const pirates = await import('pirates')
        apiPath = apiPath.replace(/\\/g, '/')
        const matcher = (filename: string) => {
            return filename.includes('plugins')
        }
        return pirates.addHook(
            (code: string, filename: string) => {
                return code.replace(/(require\([',"])(uniclient)/g, '$1' + apiPath + '/uniclient');
            },
            {exts: ['.js'], matcher: matcher}
        )
    }

    static beforeClose() {
        WorkerActivator.beforeExtensionClose()
    }
}

process.on('message', (param: { event: string; message?: IExtension }) => {
    switch (param.event) {
        case 'extension:activate':
            if (param.message) WorkerActivator.activate(param.message)
            break
        case 'extension:close': {
            WorkerActivator.beforeClose()
            process.exit(0)
        }
            break
        default:
            break
    }
})
