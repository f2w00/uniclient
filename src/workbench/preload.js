const { ipcRenderer } = require('electron')
const { rendererEvents } = require('../platform/ipc/events/ipc.events')

function exposeInMain() {
    const mainFunctions = {
        /**
         * @description 操作持久化,存放在client.data/render.json中
         * @param {'set'|'get'|'del'} purpose 指明动作意图
         * @param {string} key 用于指定键值对中的键
         * @param {any|undefined} value 仅用于purpose:set选项
         * @returns
         */
        store: async (purpose, key, value) => {
            return await ipcRenderer.invoke('render:store', purpose, key, value)
        },
        /**
         * @param {'open'|'loadWorkspace'} purpose
         * @param {string} fileName
         * @returns {{name: string,isDir: boolean,child: Object[] | undefined}[]}
         */
        file: async (purpose, fileName, ...args) => {
            return await ipcRenderer.invoke('render:folder' + `.${purpose}`, fileName, ...args)
        },
        /**
         *
         * @param {'info'} purpose
         * @param  {...any} args
         * @returns
         */
        client: async (purpose, ...args) => {
            return await ipcRenderer.invoke('render:client' + `.${purpose}`, ...args)
        },
        send: async (event, ...args) => {
            ipcRenderer.send(event, ...args)
        },
        invoke: async (event, ...args) => {
            return ipcRenderer.invoke(event, ...args)
        },
        mainNotice: async (callback) => {
            ipcRenderer.on('notice', (_, message) => {
                callback(message)
            })
        },
        rendererEvents: rendererEvents,
        // getExtensions: async () => {
        //     return await ipcRenderer.invoke('extension:infos.get')
        // }
    }
    window.uniclient = mainFunctions
}
exposeInMain()
// window.uniclient.store('set', 'leftSide','ok')
