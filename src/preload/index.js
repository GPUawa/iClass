/**
 * @author GPUawa
 * @since 2025/10/19
 * @license GPL-3.0
 * @description 预加载脚本
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * @typedef {Object} WeatherData
 * @property {number} status - HTTP状态码
 * @property {Object} current - 当前天气数据
 * @property {number} current.temperature - 温度值
 * @property {string} current.unit - 温度单位
 * @property {number|string} current.weatherCode - 天气代码
 * @property {boolean} current.isDaytime - 是否为白天
 */

/**
 * @typedef {Object} ScheduleItem
 * @property {string} subject - 课程名称
 * @property {string} start_time - 开始时间 (HH:mm:ss)
 * @property {string} end_time - 结束时间 (HH:mm:ss)
 */

/**
 * @typedef {Object} IPCResponse
 * @property {boolean} success - 操作是否成功
 * @property {*} [data] - 响应数据
 * @property {string} [error] - 错误信息
 */

/**
 * @typedef {Object} WindowStateResponse
 * @property {boolean} success - 操作是否成功
 * @property {boolean} [maximized] - 窗口是否最大化
 * @property {string} [error] - 错误信息
 */

// 存储事件监听器，用于清理
const eventListeners = new Map();

/**
 * 安全的事件监听器管理器
 */
const eventManager = {
    /**
     * 添加事件监听器
     * @param {string} channel - IPC通道名称
     * @param {Function} callback - 回调函数
     * @returns {Function} 清理函数
     */
    on(channel, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(`Callback must be a function for channel: ${channel}`);
        }

        const listener = (event, ...args) => {
            try {
                callback(event, ...args);
            } catch (error) {
                console.error(`Error in IPC listener for channel ${channel}:`, error);
            }
        };

        ipcRenderer.on(channel, listener);

        // 存储监听器以便后续清理
        if (!eventListeners.has(channel)) {
            eventListeners.set(channel, []);
        }
        eventListeners.get(channel).push(listener);

        // 返回清理函数
        return () => this.removeListener(channel, listener);
    },

    /**
     * 移除特定监听器
     * @param {string} channel - IPC通道名称
     * @param {Function} listener - 要移除的监听器
     */
    removeListener(channel, listener) {
        ipcRenderer.removeListener(channel, listener);
        const listeners = eventListeners.get(channel);
        if (listeners) {
            const index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    },

    /**
     * 移除通道的所有监听器
     * @param {string} channel - IPC通道名称
     */
    removeAllListeners(channel) {
        ipcRenderer.removeAllListeners(channel);
        eventListeners.delete(channel);
    },

    /**
     * 清理所有事件监听器
     */
    cleanup() {
        eventListeners.forEach((listeners, channel) => {
            listeners.forEach(listener => {
                ipcRenderer.removeListener(channel, listener);
            });
        });
        eventListeners.clear();
    },
};

/**
 * 课表相关API
 */
const scheduleAPI = {
    /**
     * 获取今日课程表
     * @param {string|Date} [date] - 日期字符串或Date对象
     * @returns {Promise<ScheduleItem[]>} 课程列表
     * @throws {Error} 当参数无效或请求失败时抛出错误
     */
    async getTodayClasses(date) {
        try {
            if (date !== undefined && date !== null) {
                // 验证日期参数
                const parsedDate = date instanceof Date ? date : new Date(date);
                if (isNaN(parsedDate.getTime())) {
                    throw new Error('Invalid date parameter');
                }
            }
            return await ipcRenderer.invoke('schedule:getTodayClasses', date);
        } catch (error) {
            console.error('Failed to get today classes:', error);
            throw error;
        }
    },

    /**
     * 重新加载课表
     * @returns {Promise<boolean>} 是否成功
     */
    async reload() {
        try {
            return await ipcRenderer.invoke('schedule:reload');
        } catch (error) {
            console.error('Failed to reload schedule:', error);
            throw error;
        }
    },
};

/**
 * 窗口控制API
 */
const windowAPI = {
    /**
     * 切换应用可见性
     * @returns {Promise<IPCResponse>} 操作结果
     */
    async toggle() {
        try {
            return await ipcRenderer.invoke('window:toggle');
        } catch (error) {
            console.error('Failed to toggle window:', error);
            throw error;
        }
    },

    /**
     * 监听应用可见性切换事件
     * @param {Function} callback - 回调函数
     * @returns {Function} 清理函数
     */
    onToggleVisibility(callback) {
        return eventManager.on('toggle-app-visibility', callback);
    },
};

/**
 * 设置窗口API
 */
const settingsWindowAPI = {
    /**
     * 最小化设置窗口
     * @returns {Promise<IPCResponse>} 操作结果
     */
    async minimize() {
        try {
            return await ipcRenderer.invoke('settings:minimize');
        } catch (error) {
            console.error('Failed to minimize settings window:', error);
            throw error;
        }
    },

    /**
     * 最大化/还原设置窗口
     * @returns {Promise<WindowStateResponse>} 操作结果和窗口状态
     */
    async maximize() {
        try {
            return await ipcRenderer.invoke('settings:maximize');
        } catch (error) {
            console.error('Failed to maximize settings window:', error);
            throw error;
        }
    },

    /**
     * 关闭设置窗口
     * @returns {Promise<IPCResponse>} 操作结果
     */
    async close() {
        try {
            return await ipcRenderer.invoke('settings:close');
        } catch (error) {
            console.error('Failed to close settings window:', error);
            throw error;
        }
    },
};

/**
 * 主应用API
 */
const appAPI = {
    /**
     * 监听打开设置事件
     * @param {Function} callback - 回调函数
     * @returns {Function} 清理函数
     */
    onOpenSettings(callback) {
        return eventManager.on('open-settings', callback);
    },

    /**
     * 清理所有事件监听器
     */
    cleanup() {
        eventManager.cleanup();
    },
};

// 向渲染进程暴露API
contextBridge.exposeInMainWorld('electronAPI', {
    schedule: scheduleAPI,
    window: windowAPI,
    settingsWindow: settingsWindowAPI,
    app: appAPI,
    // 保留旧的API以保持向后兼容
    toggleAppVisibility: windowAPI.toggle,
    onToggleAppVisibility: windowAPI.onToggleVisibility,
    onOpenSettings: appAPI.onOpenSettings,
});
