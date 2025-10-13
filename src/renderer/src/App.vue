<script setup>
import { onMounted, ref, computed } from 'vue'
import './assets/main.css'

const headerVisible = ref(false)
const todayClasses = ref([])
const currentDate = ref(new Date())

const todaySchedule = computed(() => {
    if (!todayClasses.value.length) return "今日无课程"

    return todayClasses.value.map(cls => {
        return cls.subject.slice(0, 1)
    }).join(' ')
})

const fetchTodayClasses = () => {
    const dayIndex = currentDate.value.getDay() || 7
    const weekNum = getWeekNumber(currentDate.value)
    const weekType = weekNum % 2 === 0 ? 'even' : 'odd'
    const mockSchedule = {
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

    todayClasses.value = mockSchedule.schedules
        .filter(s => s.enable_day === dayIndex && (s.weeks === 'all' || s.weeks === weekType))
        .flatMap(s => s.classes)
}

const getWeekNumber = (date) => {
    const janFirst = new Date(date.getFullYear(), 0, 1)
    return Math.ceil(((date - janFirst) / 86400000 + janFirst.getDay() + 1) / 7)
}

onMounted(async () => {
    setTimeout(() => {
        headerVisible.value = true
    }, 100)

    fetchTodayClasses()

    setInterval(() => {
        currentDate.value = new Date()
    }, 1000)
})

</script>

<template>
    <div class="header-bars" :class="{ visible: headerVisible }">
        <div class="weather">天气</div>
        <div class="schedule">{{ todaySchedule }}</div>
        <div class="time">
            周{{ ['日', '一', '二', '三', '四', '五', '六'][currentDate.getDay()] }} | {{ currentDate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) }}
        </div>
    </div>
</template>