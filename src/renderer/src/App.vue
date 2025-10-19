<script setup>
import { onMounted, ref, computed } from 'vue'
import './assets/main.css'

const headerVisible = ref(false)
const todayClasses = ref([])
const currentDate = ref(new Date())
const loading = ref(false)
const error = ref(null)
const todayWeather = ref('')

const todaySchedule = computed(() => {
    if (loading.value) return "加载中..."
    if (error.value) return "加载失败"
    if (!todayClasses.value.length) return "今日无课程"

    return todayClasses.value.map(cls => {
        return cls.subject.slice(0, 1)
    }).join(' ')
})

// 从后端获取今日课程
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
        if (!weatherData) {
            throw new Error('获取天气数据失败');
        }
        const temperatureData = weatherData?.forecastDaily?.temperature;
        if (!temperatureData?.value?.length) {
            throw new Error('温度数据不可用');
        }
        const todayTemp = temperatureData.value[0];

        todayWeather.value = `${todayTemp.from}℃ ~ ${todayTemp.to}℃`;
    } catch (error) {
        todayWeather.value = '天气获取失败';
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
        <div class="weather">{{ todayWeather }}</div>
        <div class="schedule">{{ todaySchedule }}</div>
        <div class="time">
            {{ (currentDate.getMonth() + 1).toString().padStart(2, '0') }}/{{
                currentDate.getDate().toString().padStart(2, '0') }} 周{{ ['日', '一', '二', '三', '四', '五',
                '六'][currentDate.getDay()] }} {{ currentDate.toLocaleTimeString('zh-CN',
                { hour: '2-digit', minute: '2-digit', hour12: false }) }}
        </div>
    </div>
</template>