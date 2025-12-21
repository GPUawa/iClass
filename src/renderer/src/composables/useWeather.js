/**
 * @author GPUawa
 * @since 2025/10/24
 * @license GPL-3.0
 * @description 实时天气显示组件
 */

import { ref } from 'vue';
import { getWeatherTypeFromCode, dayWeatherMap, nightWeatherMap } from '../utils/weatherMapping.js';

// 天气状态设置
const todayWeather = ref('');
const weatherIcon = ref('');

// 获取今日天气
const fetchTodayWeather = async () => {
    try {
        const weatherData = await window.electronAPI.fetchWeather();
        if (!weatherData || weatherData.status !== 200) {
            throw new Error('获取天气数据失败');
        }
        const current = weatherData?.current;
        if (!current) {
            throw new Error('天气预报数据不可用');
        }
        // 天气代码
        const weatherCode = current.weatherCode || '0';
        // 温度
        const temperature = current.temperature;
        // 早晚状态（由后端计算）
        const isDaytime = current.isDaytime;

        // 根据天气代码和日夜状态选择图标
        const weatherType = getWeatherTypeFromCode(weatherCode);
        const weatherMap = isDaytime ? dayWeatherMap : nightWeatherMap;
        weatherIcon.value = weatherMap[weatherType] || '999';

        // 设置温度显示
        todayWeather.value = `${temperature}℃`;
    } catch (error) {
        console.error('天气获取失败:', error);
        todayWeather.value = '天气获取失败';
        weatherIcon.value = '999';
    }
};

export function useWeather() {
    return {
        todayWeather,
        weatherIcon,
        fetchTodayWeather,
    };
}
