import { contextBridge } from 'electron'

contextBridge.exposeInMainWorld('scheduleAPI', {
    getConfig: () => ipcRenderer.invoke('get-schedule-config'),
    getTodayClasses: () => ipcRenderer.invoke('get-today-classes')
})