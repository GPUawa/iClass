import { ref, computed } from 'vue'

// 课表相关状态
const todayClasses = ref([])
const loading = ref(false)
const error = ref(null)
const currentDate = ref(new Date())

// 计算今日课表显示文本
const todaySchedule = computed(() => {
    if (loading.value) return "加载中..."
    if (error.value) return "加载失败"
    if (!todayClasses.value.length) return "今日无课程"

    return todayClasses.value.map(cls => {
        return cls.subject.slice(0, 1)
    }).join(' ')
})

// 获取今日课表
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

// 检查日期变化，如果日期改变则重新加载课表
const checkDateChange = () => {
    const oldDate = new Date(currentDate.value)
    currentDate.value = new Date()
    if (oldDate.getDate() !== currentDate.value.getDate()) {
        fetchTodayClasses()
    }
}

export function useSchedule() {
    return {
        todayClasses,
        loading,
        error,
        currentDate,
        todaySchedule,
        fetchTodayClasses,
        checkDateChange
    }
}
