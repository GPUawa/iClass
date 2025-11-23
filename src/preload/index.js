const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    schedule: {
        getTodayClasses: date => ipcRenderer.invoke('schedule:getTodayClasses', date),
        reload: () => ipcRenderer.invoke('schedule:reload'),
    },
    fetchWeather: () => ipcRenderer.invoke('weather:getTodayWeather'),
    onToggleAppVisibility: callback => {
        ipcRenderer.on('toggle-app-visibility', callback);
    },
    toggleAppVisibility: () => ipcRenderer.invoke('window:toggle'),
});
