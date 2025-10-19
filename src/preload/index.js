const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    schedule: {
        getTodayClasses: (date) => ipcRenderer.invoke('schedule:getTodayClasses', date),
        reload: () => ipcRenderer.invoke('schedule:reload')
    },
    fetchWeather: () => ipcRenderer.invoke('weather:getTodayWeather')
})