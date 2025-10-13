/**
 * @author GPUawa
 * @since 2025/10/12
 * @license GPL-3.0
 */

import { app, shell, BrowserWindow, ipcMain, screen, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import yaml from 'js-yaml'

let scheduleLoader

// 课表加载器类
class ScheduleLoader {
    constructor() {
        this.configPath = join(__dirname, '../../configs/schedule.yaml')
        this.loadSchedule()
    }

    loadSchedule() {
        try {
            this.scheduleData = yaml.load(fs.readFileSync(this.configPath, 'utf8'))
        } catch (error) {
            console.error('加载课表失败:', error)
            this.scheduleData = this.getDefaultSchedule()
        }
    }

    getWeekNumber(date) {
        const janFirst = new Date(date.getFullYear(), 0, 1)
        return Math.ceil(((date - janFirst) / 86400000 + janFirst.getDay() + 1) / 7)
    }

    getTodayClasses(date = new Date()) {
        const dayIndex = date.getDay() || 7
        const weekNum = this.getWeekNumber(date)
        const weekType = weekNum % 2 === 0 ? 'even' : 'odd'

        return this.scheduleData.schedules
            .filter(s => s.enable_day === dayIndex && (s.weeks === 'all' || s.weeks === weekType))
            .flatMap(s => s.classes)
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        x: 0,
        y: 0,
        width: screen.getPrimaryDisplay().workAreaSize.width,
        height: screen.getPrimaryDisplay().workAreaSize.height,
        frame: false,
        transparent: true,
        skipTaskbar: true,
        minimizable: false,
        maximizable: false,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.setAlwaysOnTop(1, 'normal')
        mainWindow.setIgnoreMouseEvents(1)
        mainWindow.setVisibleOnAllWorkspaces(1)
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

function createTray() {
    const tray = new Tray(join(__dirname, '../../resources/icon.png'))
    const contextMenu = Menu.buildFromTemplate([
        { type: 'separator' },
        { label: '❌ 退出软件', role: 'quit' }
    ])
    tray.setToolTip('iClass')
    tray.setContextMenu(contextMenu)
}

// ipc
function registerIPC() {
    ipcMain.handle('schedule:getTodayClasses', (_, dateString) => {
        const date = dateString ? new Date(dateString) : new Date()
        return scheduleLoader.getTodayClasses(date)
    })
    ipcMain.handle('schedule:reload', () => {
        scheduleLoader.loadSchedule()
        return true
    })
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('gpuawa.iClass')
    scheduleLoader = new ScheduleLoader()

    registerIPC()

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()
    createTray()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})