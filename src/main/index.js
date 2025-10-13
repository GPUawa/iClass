/**
 * @author GPUawa
 * @since 2025/10/12
 * @license GPL-3.0
*/

import { app, shell, BrowserWindow, ipcMain, screen, Menu, Tray } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import PluginSystem from './pluginLoader'
import ThemeSystem from './themeLoader'

// 创建主窗口
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
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.setAlwaysOnTop(1, 'normal');
        mainWindow.setIgnoreMouseEvents(1);
        mainWindow.setVisibleOnAllWorkspaces(1);

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

// 任务栏托盘图标
function createTray() {
    const tray = new Tray(join(__dirname, '../../resources/icon.png'))

    const contextMenu = Menu.buildFromTemplate([
        {
            type: 'separator'
        },
        {
            label: '❌ 退出软件',
            role: 'quit'
        }
    ])

    tray.setToolTip('iClass');
    tray.setContextMenu(contextMenu);
}

// 创建窗口
app.whenReady().then(async() => {
    electronApp.setAppUserModelId('gpuawa.iClass')

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    await PluginSystem.initAllPlugins()
    PluginSystem.setupIPCHandlers()
  
    await ThemeSystem.loadAllThemes()
    ThemeSystem.setupIPCHandlers()
    ThemeSystem.applyTheme('default') // 应用默认主题

    createWindow()
    createTray()
})