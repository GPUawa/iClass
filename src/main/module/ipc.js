/**
 * @author GPUawa
 * @since 2025/12/28
 * @license GPL-3.0
 * @description IPC 注册
 */

import { ipcMain } from 'electron';

/**
 * 注册所有 IPC 通信
 * @param {object} cses - csesLoader 的实例
 */
export function registerIPC(cses) {
    // 课表相关
    ipcMain.handle('schedule:getTodayClasses', (_, dateString) => {
        const date = dateString ? new Date(dateString) : new Date();
        return cses.getTodayClasses(date);
    });

    ipcMain.handle('schedule:reload', () => {
        cses.loadSchedule();
        return true;
    });

    // 窗口控制相关
    ipcMain.handle('window:toggle', () => {
        if (!global.mainWindow) return { success: false, error: '窗口不存在' };
        try {
            global.mainWindow.webContents.send('toggle-app-visibility');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:minimize', () => {
        if (!global.settingsWindow) return { success: false, error: '设置窗口不存在' };
        try {
            global.settingsWindow.minimize();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:maximize', () => {
        if (!global.settingsWindow) return { success: false, error: '设置窗口不存在' };
        try {
            if (global.settingsWindow.isMaximized()) {
                global.settingsWindow.unmaximize();
                return { success: true, maximized: false };
            } else {
                global.settingsWindow.maximize();
                return { success: true, maximized: true };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('settings:close', () => {
        if (!global.settingsWindow) return { success: false, error: '设置窗口不存在' };
        try {
            global.settingsWindow.close();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
}
