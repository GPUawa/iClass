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
    onOpenSettings: callback => {
        ipcRenderer.on('open-settings', callback);
    },
    settingsWindow: {
        minimize: () => ipcRenderer.invoke('settings:minimize'),
        maximize: () => ipcRenderer.invoke('settings:maximize'),
        close: () => ipcRenderer.invoke('settings:close'),
    },
});
