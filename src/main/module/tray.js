/**
 * @author GPUawa
 * @since 2025/12/28
 * @license GPL-3.0
 * @description 系统托盘
 */

import { Tray, Menu } from 'electron';
import { join } from 'path';
import { showHideWindow, createSettingsWindow } from './windows.js';

export function createTray() {
    const iconPath = join(__dirname, '../../resources/images/icon.png');
    const tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: '👀 显示/隐藏',
            click: showHideWindow, // 直接调用 windows.js 中的函数
        },
        {
            label: '⚙️ 设置',
            click: createSettingsWindow, // 直接调用 windows.js 中的函数
        },
        { type: 'separator' },
        {
            label: '❌ 退出程序',
            role: 'quit',
        },
    ]);

    tray.setToolTip('iClass');
    tray.setContextMenu(contextMenu);
}
