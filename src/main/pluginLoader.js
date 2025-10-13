import { ipcMain, app, safeStorage } from 'electron'
import path from 'path'
import fs from 'fs'

class PluginSystem {
    constructor() {
        this.plugins = new Map()
        this.pluginDir = path.join(__dirname, '../plugins')
        this.initPluginDir()
    }

    // 初始化插件目录
    initPluginDir() {
        if (!fs.existsSync(this.pluginDir)) {
            fs.mkdirSync(this.pluginDir, { recursive: true })
        }
    }

    // 加载插件
    async loadPlugin(pluginPath) {
        try {
            const manifestPath = path.join(pluginPath, 'manifest.json')
            if (!fs.existsSync(manifestPath)) {
                throw new Error('Missing manifest.json')
            }

            const manifest = JSON.parse(fs.readFileSync(manifestPath))
            const entryPath = path.join(pluginPath, manifest.main)
            if (!this.validatePlugin(manifest)) {
                throw new Error('Plugin validation failed')
            }
            const plugin = (await import(entryPath)).default
            this.plugins.set(manifest.id, {
                instance: new plugin(),
                manifest
            })

            console.log(`[Plugin] Loaded: ${manifest.name}@${manifest.version}`)
        } catch (err) {
            console.error(`[Plugin] Load failed: ${pluginPath}`, err)
        }
    }

    // 验证插件
    validatePlugin(manifest) {
        const requiredFields = ['id', 'name', 'version', 'main']
        return requiredFields.every(field => field in manifest)
    }

    // 初始化所有插件
    async initAllPlugins() {
        const pluginFolders = fs.readdirSync(this.pluginDir)
        await Promise.all(
            pluginFolders.map(folder =>
                this.loadPlugin(path.join(this.pluginDir, folder))
            )
        )
    }

    // IPC通信接口
    setupIPCHandlers() {
        ipcMain.handle('plugin:list', () => {
            return Array.from(this.plugins.values()).map(p => p.manifest)
        })

        ipcMain.handle('plugin:execute', (_, pluginId, method, ...args) => {
            const plugin = this.plugins.get(pluginId)
            return plugin?.instance[method]?.(...args)
        })
    }
}

export default new PluginSystem()