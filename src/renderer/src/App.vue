<script setup>
import { onMounted, ref, computed } from 'vue'
import './assets/main.css'
import './assets/qweather-icons.css'

const headerVisible = ref(false)
const todayClasses = ref([])
const currentDate = ref(new Date())
const loading = ref(false)
const error = ref(null)
const todayWeather = ref('')
const weatherIcon = ref('')

// 天气类型到图标代码的映射
const getWeatherIconCode = (weatherType) => {
    // 获取当前时间，判断是白天还是晚上
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour < 6 || hour >= 18;

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
    const weatherMap = isNight ? nightWeatherMap : dayWeatherMap;
    return weatherMap[weatherType] || '999';
}

const todaySchedule = computed(() => {
    if (loading.value) return "加载中..."
    if (error.value) return "加载失败"
    if (!todayClasses.value.length) return "今日无课程"

    return todayClasses.value.map(cls => {
        return cls.subject.slice(0, 1)
    }).join(' ')
})

const fetchTodayClasses = async () => {
    try {
        loading.value = true
        error.value = null
        todayClasses.value = await window.electronAPI.schedule.getTodayClasses(
            currentDate.value.toISOString()
        )
    } catch (err) {
        console.error('获取课程失败:', err)
        error.value = err.message
        todayClasses.value = []
    } finally {
        loading.value = false
    }
}

const checkDateChange = () => {
    const oldDate = new Date(currentDate.value)
    currentDate.value = new Date()
    if (oldDate.getDate() !== currentDate.value.getDate()) {
        fetchTodayClasses()
    }
}

const fetchTodayWeather = async () => {
    try {
        const weatherData = await window.electronAPI.fetchWeather();
        if (!weatherData || weatherData.status !== 200) {
            throw new Error('获取天气数据失败');
        }
        const todayForecast = weatherData?.data?.forecast?.[0];
        if (!todayForecast) {
            throw new Error('天气预报数据不可用');
        }

        // 提取天气类型、最高温和最低温
        const weatherType = todayForecast.type;
        const highTemp = todayForecast.high.replace('高温 ', '').replace('℃', '');
        const lowTemp = todayForecast.low.replace('低温 ', '').replace('℃', '');

        // 设置天气图标
        weatherIcon.value = getWeatherIconCode(weatherType);

        todayWeather.value = `${highTemp}~${lowTemp}℃`;
    } catch (error) {
        todayWeather.value = '天气获取失败';
        weatherIcon.value = '999'; // 未知天气图标
    }
};

onMounted(async () => {
    setTimeout(() => {
        headerVisible.value = true
    }, 100)

    await fetchTodayClasses()
    await fetchTodayWeather()

    setInterval(() => {
        checkDateChange()
    }, 1000)

    setInterval(() => {
        checkDateChange()
    }, 600000)
})
</script>

<template>
    <div class="header-bars" :class="{ visible: headerVisible }">
        <div class="weather"><i :class="`qi qi-${weatherIcon}`" v-if="weatherIcon"></i>&nbsp;{{ todayWeather }}</div>
        <div class="schedule">{{ todaySchedule }}</div>
        <div class="time">
            {{ currentDate.toLocaleTimeString('zh-CN',
                { hour: '2-digit', minute: '2-digit', hour12: false }) }} | {{ (currentDate.getMonth() +
                1).toString().padStart(2, '0') }}/{{
                currentDate.getDate().toString().padStart(2, '0') }} 周{{ ['日', '一', '二', '三', '四', '五',
                '六'][currentDate.getDay()] }}
        </div>
    </div>
</template>