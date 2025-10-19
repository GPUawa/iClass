/**
 * @author GPUawa
 * @since 2025/10/12
 * @license GPL-3.0
 * @description 主进程
 */

import { app, shell, BrowserWindow, ipcMain, screen, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { csesLoader } from './loaders/csesLoader.js'
import icon from '../../resources/icon.png?asset'

let cses

// 创建窗口
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
        mainWindow.setAlwaysOnTop(true, 'normal')
        mainWindow.setIgnoreMouseEvents(true)
        mainWindow.setVisibleOnAllWorkspaces(true)
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

// 创建系统托盘
function createTray() {
    const tray = new Tray(join(__dirname, '../../resources/icon.png'))
    const contextMenu = Menu.buildFromTemplate([
        { type: 'separator' },
        { label: '❌ 退出软件', role: 'quit' }
    ])
    tray.setToolTip('iClass')
    tray.setContextMenu(contextMenu)
}

// 注册 IPC 通信
function registerIPC() {
    ipcMain.handle('schedule:getTodayClasses', (_, dateString) => {
        const date = dateString ? new Date(dateString) : new Date()
        return cses.getTodayClasses(date)
    })
    ipcMain.handle('schedule:reload', () => {
        cses.loadSchedule()
        return true
    })
}

app.whenReady().then(() => {
    electronApp.setAppUserModelId('gpuawa.iClass')
    cses = new csesLoader()

    registerIPC()

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()
    createTray()
})