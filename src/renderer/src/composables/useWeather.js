/**
 * @author GPUawa
 * @since 2025/10/24
 * @license GPL-3.0
 * @description 实时天气显示组件
 */

import { ref } from 'vue'
import { getWeatherTypeFromCode, dayWeatherMap, nightWeatherMap } from '../utils/weatherMapping.js'

// 天气状态设置
const todayWeather = ref('')
const weatherIcon = ref('')

// 获取今日天气
const fetchTodayWeather = async () => {
    try {
        const weatherData = await window.electronAPI.fetchWeather()
        if (!weatherData || weatherData.status !== 200) {
            throw new Error('获取天气数据失败')
        }
        const current = weatherData?.current
        if (!current) {
            throw new Error('天气预报数据不可用')
        }
        // 天气代码
        const weatherCode = current.weatherCode || '0'
        // 温度
        const temperature = current.temperature
        // 早晚状态
        const isDaytime = current.isDaytime ?? true
        // 天气类型
        const weatherType = getWeatherTypeFromCode(weatherCode)
        
        //判断白天还是夜间
        const now = new Date()
        const hour = now.getHours()
        const isNight = hour < 6 || hour >= 18
        const night = isDaytime === undefined ? isNight : !isDaytime
        // 根据时间选择映射表
        const weatherMap = night ? nightWeatherMap : dayWeatherMap
        weatherIcon.value = weatherMap[weatherType] || '999'

        todayWeather.value = `${temperature}℃`
    } catch (error) {
        todayWeather.value = '天气获取失败'
        weatherIcon.value = '999'
    }
}

export function useWeather() {
    return {
        todayWeather,
        weatherIcon,
        fetchTodayWeather
    }
}