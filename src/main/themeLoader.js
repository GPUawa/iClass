import { nativeTheme, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'

class ThemeSystem {
    constructor() {
        this.themes = new Map()
        this.themeDir = path.join(__dirname, '../themes')
        this.currentTheme = null
        this.initThemeDir()
    }

    // 初始化主题目录
    initThemeDir() {
        if (!fs.existsSync(this.themeDir)) {
            fs.mkdirSync(this.themeDir, { recursive: true })
        }
    }

    // 加载所有主题
    async loadAllThemes() {
        const themeFolders = fs.readdirSync(this.themeDir)
        themeFolders.forEach(folder => {
            const themePath = path.join(this.themeDir, folder)
            this.loadTheme(themePath)
        })
    }

    // 加载主题
    loadTheme(themePath) {
        try {
            const configPath = path.join(themePath, 'theme.json')
            if (!fs.existsSync(configPath)) return

            const config = JSON.parse(fs.readFileSync(configPath))
            this.themes.set(config.id, {
                path: themePath,
                config
            })
        } catch (err) {
            console.error(`[Theme] Load failed: ${themePath}`, err)
        }
    }

    // 应用主题
    applyTheme(themeId) {
        const theme = this.themes.get(themeId)
        if (!theme) return false

        this.currentTheme = theme
        nativeTheme.themeSource = theme.config.mode || 'system'

        const windows = BrowserWindow.getAllWindows()
        windows.forEach(win => {
            win.webContents.send('theme:changed', theme.config)
        })

        return true
    }

    // IPC通信接口
    setupIPCHandlers() {
        ipcMain.handle('theme:list', () => {
            return Array.from(this.themes.values()).map(t => t.config)
        })

        ipcMain.handle('theme:apply', (_, themeId) => {
            return this.applyTheme(themeId)
        })
    }
}

export default new ThemeSystem()