/**
 * @author GPUawa
 * @since 2025/12/28
 * @license GPL-3.0
 * @description IPC 注册
 */

import { ipcMain } from 'electron';
const https = require('https');

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

    // 天气相关
    ipcMain.handle('weather:getTodayWeather', async () => {
        return new Promise((resolve, reject) => {
            const url =
                'https://weatherapi.market.xiaomi.com/wtr-v3/weather/all?latitude=0&longitude=0&locationKey=weathercn%3A101010100&appKey=weather20151024&sign=zUFJoAR2ZVrDy1vF3D07&isGlobal=false&locale=zh_cn';

            https
                .get(url, response => {
                    let data = '';
                    response.on('data', chunk => {
                        data += chunk;
                    });
                    response.on('end', () => {
                        try {
                            const weatherData = JSON.parse(data);
                            const now = new Date();
                            const hour = now.getHours();
                            const isDaytime = hour >= 6 && hour < 18;

                            resolve({
                                status: 200,
                                current: {
                                    temperature: weatherData.current.temperature.value,
                                    unit: weatherData.current.temperature.unit,
                                    weatherCode: weatherData.current.weather,
                                    isDaytime: isDaytime,
                                },
                            });
                        } catch (error) {
                            reject(new Error('解析天气数据失败: ' + error.message));
                        }
                    });
                })
                .on('error', error => {
                    reject(new Error('网络请求失败: ' + error.message));
                });
        });
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
