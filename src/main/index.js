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
import icon from '../../resources/images/icon.png?asset'
const https = require('https')
const http = require('http')

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

    // 保存窗口引用以便全局访问
    global.mainWindow = mainWindow

    return mainWindow
}

// 显示/隐藏窗口功能
function showHideWindow() {
    if (!global.mainWindow) return

    // 发送消息给渲染进程，让其控制界面显示/隐藏
    global.mainWindow.webContents.send('toggle-app-visibility')
}

// 创建系统托盘
function createTray() {
    const tray = new Tray(join(__dirname, '../../resources/images/icon.png'))
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '👀 显示/隐藏',
            click: () => {
                showHideWindow()
            }
        },
        { type: 'separator' },
        {
            label: '❌ 退出程序', 
            role: 'quit' 
        }
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

    ipcMain.handle('weather:getTodayWeather', async () => {
        return new Promise((resolve, reject) => {
            const url = 'https://weatherapi.market.xiaomi.com/wtr-v3/weather/all?latitude=0&longitude=0&locationKey=weathercn%3A101010100&appKey=weather20151024&sign=zUFJoAR2ZVrDy1vF3D07&isGlobal=false&locale=zh_cn'

            https.get(url, (response) => {
                let data = ''

                response.on('data', (chunk) => {
                    data += chunk
                })

                response.on('end', () => {
                    try {
                        const weatherData = JSON.parse(data)
                        const now = new Date();
                        const hour = now.getHours();
                        const isDaytime = hour >= 6 && hour < 18;

                        resolve({
                            status: 200,
                            current: {
                                temperature: weatherData.current.temperature.value,
                                unit: weatherData.current.temperature.unit,
                                weatherCode: '0',
                                isDaytime: isDaytime
                            }
                        });
                    } catch (error) {
                        reject(new Error('解析天气数据失败: ' + error.message))
                    }
                })
            }).on('error', (error) => {
                reject(new Error('网络请求失败: ' + error.message))
            })
        })
    })

    // 添加显示/隐藏窗口的IPC处理程序
    ipcMain.handle('window:toggle', () => {
        if (!global.mainWindow) return { success: false, error: '窗口不存在' }

        try {
            // 发送消息给渲染进程，让其控制界面显示/隐藏
            global.mainWindow.webContents.send('toggle-app-visibility')
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
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

// 确保在所有窗口关闭时退出应用
app.on('window-all-closed', () => {
    // 在macOS上，除非用户使用Cmd + Q明确退出
    // 否则保持应用和菜单栏处于活动状态
    if (process.platform !== 'darwin') {
        app.quit()
    }
})