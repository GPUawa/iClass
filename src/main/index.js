/**
 * @author GPUawa
 * @since 2025/10/12
 * @license GPL-3.0
 * @description 主进程
 */

import { app, BrowserWindow } from 'electron';
import { electronApp, optimizer } from '@electron-toolkit/utils';
import { csesLoader } from './loaders/csesLoader.js';
import { createWindow } from './module/windows.js';
import { createTray } from './module/tray.js';
import { registerIPC } from './module/ipc.js';

let cses;

app.whenReady().then(() => {
    electronApp.setAppUserModelId('gpuawa.iClass');
    // 初始化课表加载器
    cses = new csesLoader();
    // 注册 IPC
    registerIPC(cses);

    // 优化窗口快捷键
    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });

    // 创建主窗口和托盘
    createWindow();
    createTray();

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
