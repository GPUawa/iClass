// src/main/scheduleLoader.js
const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

class ScheduleLoader {
    constructor(configPath) {
        this.configPath = configPath || path.join(__dirname, '../../configs/schedule.yaml')
        this.scheduleData = null
        this.loadSchedule()
    }

    /**
     * 加载课表配置文件
     */
    loadSchedule() {
        try {
            if (fs.existsSync(this.configPath)) {
                this.scheduleData = yaml.load(fs.readFileSync(this.configPath, 'utf8'))
                console.log('课表配置加载成功')
            } else {
                console.warn('课表配置文件不存在，使用默认配置')
                this.scheduleData = this.getDefaultSchedule()
            }
        } catch (error) {
            console.error('加载课表配置失败:', error)
            this.scheduleData = this.getDefaultSchedule()
        }
    }

    /**
     * 获取默认课表配置
     */
    getDefaultSchedule() {
        return {
            schedules: [
                {
                    name: "星期一",
                    enable_day: 1,
                    weeks: "all",
                    classes: [
                        { subject: "语文", start_time: "08:00:00", end_time: "09:00:00" },
                        { subject: "数学", start_time: "09:00:00", end_time: "10:00:00" }
                    ]
                }
            ]
        }
    }

    /**
     * 计算当前是第几周
     * @param {Date} date 
     */
    getWeekNumber(date) {
        const janFirst = new Date(date.getFullYear(), 0, 1)
        return Math.ceil(((date - janFirst) / 86400000 + janFirst.getDay() + 1) / 7)
    }

    /**
     * 获取指定日期的课程
     * @param {Date} date 
     */
    getTodayClasses(date = new Date()) {
        if (!this.scheduleData) this.loadSchedule()

        const dayIndex = date.getDay() || 7
        const weekNum = this.getWeekNumber(date)
        const weekType = weekNum % 2 === 0 ? 'even' : 'odd'

        return this.scheduleData.schedules
            .filter(schedule =>
                schedule.enable_day === dayIndex &&
                (schedule.weeks === 'all' || schedule.weeks === weekType)
            )
            .flatMap(schedule => schedule.classes)
    }

    /**
     * 重新加载课表配置
     */
    reloadSchedule() {
        this.loadSchedule()
        return true
    }

    /**
     * 获取完整课表配置
     */
    getFullSchedule() {
        return this.scheduleData
    }
}
module.exports = ScheduleLoader