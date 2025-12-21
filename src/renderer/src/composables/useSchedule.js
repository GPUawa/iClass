/**
 * @author GPUawa
 * @since 2025/10/24
 * @license GPL-3.0
 * @description 课表加载组件
 */

import { ref, computed } from 'vue';

// 课表状态设置
const todayClasses = ref([]);
const loading = ref(false);
const error = ref(null);
const currentDate = ref(new Date());

// 检查当前是否在上课以及当前课程
const currentClass = computed(() => {
    if (loading.value || error.value || !todayClasses.value.length) return null;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

    // 查找当前正在进行的课程
    return todayClasses.value.find(cls => {
        return currentTime >= cls.start_time && currentTime <= cls.end_time;
    });
});

// 课表显示文本
const todaySchedule = computed(() => {
    if (loading.value) return '加载中...';
    if (error.value) return '加载失败';
    if (!todayClasses.value.length) return '今日无课程';

    return todayClasses.value
        .map(cls => {
            // 如果是当前正在进行的课程，添加标记
            const isCurrentClass = currentClass.value && cls.subject === currentClass.value.subject;
            const subject = cls.subject.slice(0, 1);
            return isCurrentClass ? `<span class="current-class"> ${subject} </span>` : subject;
        })
        .join('&nbsp;&nbsp;');
});

// 获取今日课表
const fetchTodayClasses = async () => {
    try {
        loading.value = true;
        error.value = null;
        todayClasses.value = await window.electronAPI.schedule.getTodayClasses(
            currentDate.value.toISOString()
        );
    } catch (err) {
        console.error('获取课程失败:', err);
        error.value = err.message;
        todayClasses.value = [];
    } finally {
        loading.value = false;
    }
};

// 检查日期变化
const checkDateChange = () => {
    const oldDate = new Date(currentDate.value);
    currentDate.value = new Date();
    // 日期变化则重载课表
    if (oldDate.getDate() !== currentDate.value.getDate()) {
        fetchTodayClasses();
    }
};

export function useSchedule() {
    return {
        todayClasses,
        loading,
        error,
        currentDate,
        todaySchedule,
        currentClass,
        fetchTodayClasses,
        checkDateChange,
    };
}
