import { ref } from 'vue'

// 天气相关状态
const todayWeather = ref('')
const weatherIcon = ref('')

// 天气类型到图标代码的映射
const getWeatherIconCode = (weatherType) => {
    // 获取当前时间，判断是白天还是晚上
    const now = new Date()
    const hour = now.getHours()
    const isNight = hour < 6 || hour >= 18

    // 白天天气映射
    const dayWeatherMap = {
        '晴': '100',
        '多云': '101',
        '少云': '102',
        '晴间多云': '103',
        '阴': '104',
        '阵雨': '300',
        '强阵雨': '301',
        '雷阵雨': '302',
        '强雷阵雨': '303',
        '雷阵雨伴有冰雹': '304',
        '小雨': '305',
        '中雨': '306',
        '大雨': '307',
        '极端降雨': '308',
        '毛毛雨/细雨': '309',
        '暴雨': '310',
        '大暴雨': '311',
        '特大暴雨': '312',
        '冻雨': '313',
        '小到中雨': '314',
        '中到大雨': '315',
        '大到暴雨': '316',
        '暴雨到大暴雨': '317',
        '大暴雨到特大暴雨': '318',
        '小雪': '400',
        '中雪': '401',
        '大雪': '402',
        '暴雪': '403',
        '雨夹雪': '404',
        '雨雪天气': '405',
        '阵雨夹雪': '406',
        '阵雪': '407',
        '小到中雪': '408',
        '中到大雪': '409',
        '大到暴雪': '410',
        '薄雾': '500',
        '雾': '501',
        '霾': '502',
        '扬沙': '503',
        '浮尘': '504',
        '沙尘暴': '507',
        '强沙尘暴': '508',
        '浓雾': '509',
        '强浓雾': '510',
        '中度霾': '511',
        '重度霾': '512',
        '严重霾': '513',
        '大雾': '514',
        '特强浓雾': '515',
        '热': '900',
        '冷': '901',
        '未知': '999'
    }

    // 夜间天气映射
    const nightWeatherMap = {
        '晴': '150',
        '多云': '151',
        '少云': '152',
        '晴间多云': '153',
        '阴': '104',
        '阵雨': '350',
        '强阵雨': '351',
        '雷阵雨': '302',
        '强雷阵雨': '303',
        '雷阵雨伴有冰雹': '304',
        '小雨': '305',
        '中雨': '306',
        '大雨': '307',
        '极端降雨': '308',
        '毛毛雨/细雨': '309',
        '暴雨': '310',
        '大暴雨': '311',
        '特大暴雨': '312',
        '冻雨': '313',
        '小到中雨': '314',
        '中到大雨': '315',
        '大到暴雨': '316',
        '暴雨到大暴雨': '317',
        '大暴雨到特大暴雨': '318',
        '小雪': '400',
        '中雪': '401',
        '大雪': '402',
        '暴雪': '403',
        '雨夹雪': '404',
        '雨雪天气': '405',
        '阵雨夹雪': '456',
        '阵雪': '457',
        '小到中雪': '408',
        '中到大雪': '409',
        '大到暴雪': '410',
        '薄雾': '500',
        '雾': '501',
        '霾': '502',
        '扬沙': '503',
        '浮尘': '504',
        '沙尘暴': '507',
        '强沙尘暴': '508',
        '浓雾': '509',
        '强浓雾': '510',
        '中度霾': '511',
        '重度霾': '512',
        '严重霾': '513',
        '大雾': '514',
        '特强浓雾': '515',
        '热': '900',
        '冷': '901',
        '未知': '999'
    }

    // 根据时间选择对应的映射表
    const weatherMap = isNight ? nightWeatherMap : dayWeatherMap
    return weatherMap[weatherType] || '999'
}

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

        // 提取天气类型、最高温和最低温
        const weatherType = current.weatherCode || '0'
        const temperature = current.temperature

        // 获取白天/夜晚状态
        const isDaytime = current.isDaytime ?? true

        // 始终显示晴天图标，根据时间区分早晚
        weatherIcon.value = isDaytime ? '100' : '150'

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
