const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (title, ...args) => ipcRenderer.send(title, ...args),
    /** Allows for replies*/postMessage: (title, ...args) => ipcRenderer.invoke(title, ...args)
})