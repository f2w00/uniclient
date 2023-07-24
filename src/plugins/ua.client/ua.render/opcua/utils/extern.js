const require = parent.window.require;
const { ipcRenderer } = require('electron')

function subscript(callback) {
    ipcRenderer.on("pipe:uaclient.pushed", (event, value) => {
        // console.log(value)
        callback(value)
    })
}