<script setup>
import { onMounted, ref } from 'vue'
import './assets/main.css'
import './assets/qweather-icons.css'
import { useWeather } from './composables/useWeather.js'
import { useSchedule } from './composables/useSchedule.js'

const headerVisible = ref(false)
const appVisible = ref(true) // 控制整个应用的可见性

const { todayWeather, weatherIcon, fetchTodayWeather } = useWeather()
const { currentDate, todaySchedule, fetchTodayClasses, checkDateChange } = useSchedule()

// 切换应用显示/隐藏
const toggleAppVisibility = () => {
    appVisible.value = !appVisible.value
}

// 监听来自主进程的显示/隐藏请求
window.electronAPI.onToggleAppVisibility(() => {
    toggleAppVisibility()
})

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
    <div class="app-container" :class="{ 'app-hidden': !appVisible }">
        <div class="header-bars" :class="{ visible: headerVisible }">
            <div class="weather"><i :class="`qi qi-${weatherIcon}`" v-if="weatherIcon"></i>&nbsp{{ todayWeather }}</div>
            <div class="schedule">{{ todaySchedule }}</div>
            <div class="time">
                {{ currentDate.toLocaleTimeString('zh-CN',
                    { hour: '2-digit', minute: '2-digit', hour12: false }) }} | {{ (currentDate.getMonth() +
                    1).toString().padStart(2, '0') }}/{{
                    currentDate.getDate().toString().padStart(2, '0') }} 周{{ ['日', '一', '二', '三', '四', '五',
                    '六'][currentDate.getDay()] }}
            </div>
        </div>
    </div>
</template>

<style>
.app-container {
    transition: opacity 0.2s ease;
}

.app-hidden {
    opacity: 0;
    pointer-events: none;
}
</style>