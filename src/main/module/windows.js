/**
 * @author GPUawa
 * @since 2025/12/28
 * @license GPL-3.0
 * @description 窗口创建
 */

import { BrowserWindow, screen, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../../resources/images/icon.png?asset';

// 主窗口
export function createWindow() {
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
            sandbox: true,
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.on('ready-to-show', () => {
        mainWindow.setAlwaysOnTop(true, 'normal');
        mainWindow.setIgnoreMouseEvents(true);
        mainWindow.setVisibleOnAllWorkspaces(true);
        mainWindow.show();
    });

    mainWindow.webContents.setWindowOpenHandler(details => {
        shell.openExternal(details.url);
        return { action: 'deny' };
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
    }

    global.mainWindow = mainWindow;
    return mainWindow;
}

// 设置窗口
export function createSettingsWindow() {
    if (global.settingsWindow && !global.settingsWindow.isDestroyed()) {
        global.settingsWindow.focus();
        return global.settingsWindow;
    }
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const settingsWindow = new BrowserWindow({
        width: width * 0.7,
        height: height * 0.7,
        minWidth: 800,
        minHeight: 600,
        minimizable: true,
        maximizable: true,
        resizable: true,
        frame: false,
        show: false,
        modal: false,
        autoHideMenuBar: true,
        center: true,
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: true,
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
        ...(process.platform === 'linux' ? { icon } : {}),
    });

    settingsWindow.on('ready-to-show', () => {
        settingsWindow.center();
        settingsWindow.show();
    });

    settingsWindow.on('closed', () => {
        global.settingsWindow = null;
    });

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#/settings`);
    } else {
        settingsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
            hash: '/settings',
        });
    }

    global.settingsWindow = settingsWindow;
    return settingsWindow;
}

// 显示/隐藏主窗口
export function showHideWindow() {
    if (!global.mainWindow) return;
    global.mainWindow.webContents.send('toggle-app-visibility');
}
