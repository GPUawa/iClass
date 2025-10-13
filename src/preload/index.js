const { contextBridge, ipcRenderer } = require('electron')

// 课表 api
contextBridge.exposeInMainWorld('electronAPI', {
    schedule: {
        getTodayClasses: (date) => ipcRenderer.invoke('schedule:getTodayClasses', date),
        reload: () => ipcRenderer.invoke('schedule:reload')
    }
})