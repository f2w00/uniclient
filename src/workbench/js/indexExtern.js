const { ipcRenderer } = require('electron')
const { Broker } = require('../platform/base/broker/broker')

// new Broker()
function mainMini() {
    ipcRenderer.send('render:bench.mini')
}
function mainMax() {
    ipcRenderer.send('render:bench.max')
}
function mainClose() {
    ipcRenderer.send('render:bench.close')
}
function getLogError(callback) {
    ipcRenderer.on('main:log.error', (_event, value) => {
        callback(value)
    })
}
function getLogInfo(callback) {
    ipcRenderer.on('main:log.info', (_event, value) => {
        callback(value)
    })
}
function getLogWarn(callback) {
    ipcRenderer.on('main:log.warn', (_event, value) => {
        callback(value)
    })
}
function subscript(callback) {
    ipcRenderer.on("pipe:uaclient.pushed", (event, value) => {
        // console.log(value)
        callback(value)
    })
}