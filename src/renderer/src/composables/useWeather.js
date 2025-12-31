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
        const url =
            'https://weatherapi.market.xiaomi.com/wtr-v3/weather/all?latitude=0&longitude=0&locationKey=weathercn%3A101010100&appKey=weather20151024&sign=zUFJoAR2ZVrDy1vF3D07&isGlobal=false&locale=zh_cn';
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`网络请求失败: ${response.statusText}`);
        }

        const weatherData = await response.json();

        const current = weatherData?.current;
        if (!current) {
            throw new Error('天气预报数据不可用');
        }

        const weatherCode = current.weather || '0';
        const temperature = current.temperature?.value;

        if (temperature === undefined) {
            throw new Error('无法获取温度信息');
        }

        // 计算日夜
        const now = new Date();
        const hour = now.getHours();
        const isDaytime = hour >= 6 && hour < 18;

        // 选择图标
        const weatherType = getWeatherTypeFromCode(weatherCode);
        const weatherMap = isDaytime ? dayWeatherMap : nightWeatherMap;
        weatherIcon.value = weatherMap[weatherType] || '999';

        // 温度显示
        todayWeather.value = `${temperature}℃`;
    } catch (error) {
        console.error('天气获取失败:', error);
        todayWeather.value = `天气获取失败: ${error.message}`;
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
