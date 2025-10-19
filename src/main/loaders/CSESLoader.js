/**
 * @author GPUawa
 * @since 2025/10/19
 * @license GPL-3.0
 * @description CSES 课表加载模块
 */

import fs from 'fs'
import yaml from 'js-yaml'
import { join } from 'path'

export class ScheduleLoader {
    constructor() {
        this.configPath = join(__dirname, '../../configs/schedule.yaml')
        this.loadSchedule()
    }
    // 加载课表文件
    loadSchedule() {
        try {
            this.scheduleData = yaml.load(fs.readFileSync(this.configPath, 'utf8'))
        } catch (error) {
            console.error('加载课表失败:', error)
            this.scheduleData = this.getDefaultSchedule()
        }
    }
    getDefaultSchedule() {
        return {
            schedules: []
        }
    }
    // 获取当周
    getWeekNumber(date) {
        const janFirst = new Date(date.getFullYear(), 0, 1)
        return Math.ceil(((date - janFirst) / 86400000 + janFirst.getDay() + 1) / 7)
    }

    // 获取当天课程
    getTodayClasses(date = new Date()) {
        const dayIndex = date.getDay() || 7
        const weekNum = this.getWeekNumber(date)
        const weekType = weekNum % 2 === 0 ? 'even' : 'odd'

        return this.scheduleData.schedules
            .filter(s => s.enable_day === dayIndex && (s.weeks === 'all' || s.weeks === weekType))
            .flatMap(s => s.classes)
    }
}
