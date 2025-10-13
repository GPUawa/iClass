<script setup>
import { onMounted, ref, computed } from 'vue'
import './assets/main.css'

const headerVisible = ref(false)
const todayClasses = ref([])
const currentDate = ref(new Date())
const loading = ref(false)
const error = ref(null)

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

const getWeekNumber = (date) => {
    const janFirst = new Date(date.getFullYear(), 0, 1)
    return Math.ceil(((date - janFirst) / 86400000 + janFirst.getDay() + 1) / 7)
}

const checkDateChange = () => {
    const oldDate = new Date(currentDate.value)
    currentDate.value = new Date()
    if (oldDate.getDate() !== currentDate.value.getDate()) {
        fetchTodayClasses()
    }
}

onMounted(async () => {
    setTimeout(() => {
        headerVisible.value = true
    }, 100)

    await fetchTodayClasses()

    setInterval(() => {
        checkDateChange()
    }, 1000)
})
</script>

<template>
    <div class="header-bars" :class="{ visible: headerVisible }">
        <div class="weather">天气</div>
        <div class="schedule">{{ todaySchedule }}</div>
        <div class="time">
            周{{ ['日', '一', '二', '三', '四', '五', '六'][currentDate.getDay()] }} {{ currentDate.toLocaleTimeString('zh-CN',
                { hour: '2-digit', minute: '2-digit', hour12: false }) }}
        </div>
    </div>
</template>