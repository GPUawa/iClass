const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    schedule: {
        getTodayClasses: (date) => ipcRenderer.invoke('schedule:getTodayClasses', date),
        reload: () => ipcRenderer.invoke('schedule:reload')
    },
    fetchWeather: () => ipcRenderer.invoke('weather:getTodayWeather'),
    // 添加显示/隐藏应用的接口
    onToggleAppVisibility: (callback) => {
        ipcRenderer.on('toggle-app-visibility', callback)
    },
    toggleAppVisibility: () => ipcRenderer.invoke('window:toggle')
})