<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import './assets/main.css';
import './assets/qweather-icons.css';

const router = useRouter();

// 打开设置页面
const openSettings = () => {
    router.push('/settings');
};

// 监听来自主进程的打开设置请求
onMounted(() => {
    window.electronAPI.app.onOpenSettings(() => {
        openSettings();
    });
});
</script>

<template>
    <div class="app-container">
        <router-view />
    </div>
</template>

<style scoped>
.app-container {
    width: 100%;
    height: 100%;
}
</style>
