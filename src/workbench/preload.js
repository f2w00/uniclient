const { ipcRenderer, contextBridge } = require('electron')

function exposeInMain() {
    let mainFunctions = {
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
        file: async (fileName) => {
            return await ipcRenderer.invoke('render:folder.open', fileName)
        },
        send: async (event, ...args) => {
            ipcRenderer.send(event, ...args)
        },
        invoke: async (event, ...args) => {
            return ipcRenderer.invoke(event, ...args)
        },
    }
    contextBridge.exposeInMainWorld('uniclient', mainFunctions)
}
exposeInMain()
// window.uniclient.store('set', 'leftSide','ok')
