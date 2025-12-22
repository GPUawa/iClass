<script setup>
import { ref, onMounted } from 'vue';
import { NLayout, NLayoutHeader, NButton, NIcon } from 'naive-ui';
import { RemoveOutline, SquareOutline, CloseOutline } from '@vicons/ionicons5';
import iconPath from '@renderer/../../../resources/images/icon.png';

// 窗口是否最大化
const isMaximized = ref(false);

// 窗口控制函数
const minimizeWindow = () => {
    window.electronAPI.settingsWindow.minimize();
};

const maximizeWindow = async () => {
    const result = await window.electronAPI.settingsWindow.maximize();
    if (result.success) {
        isMaximized.value = result.maximized;
    }
};

const closeWindow = () => {
    window.electronAPI.settingsWindow.close();
};

// 检查窗口是否已最大化
onMounted(async () => {
    // 这里可以添加检查窗口状态的逻辑
});
</script>

<template>
    <NLayout class="settings-layout">
        <div class="custom-titlebar">
            <div class="titlebar-left">
                <img :src="iconPath" alt="iClass" class="titlebar-icon" />
                <span class="titlebar-title">iClass 设置</span>
            </div>
            <div class="titlebar-right">
                <NButton circle size="small" quaternary @click="minimizeWindow">
                    <NIcon :size="20">
                        <RemoveOutline />
                    </NIcon>
                </NButton>
                <NButton circle size="small" quaternary @click="maximizeWindow">
                    <NIcon :size="16">
                        <SquareOutline />
                    </NIcon>
                </NButton>
                <NButton circle size="small" quaternary @click="closeWindow">
                    <NIcon :size="20">
                        <CloseOutline />
                    </NIcon>
                </NButton>
            </div>
        </div>

        <NLayoutHeader class="settings-header" bordered>
            <h2>设置</h2>
        </NLayoutHeader>
    </NLayout>
</template>

<style scoped>
.settings-layout {
    height: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
}

:deep(.n-button) {
    transition: background-color 0.2s;
}

:deep(.n-button:hover) {
    transition: background-color 0.2s;
}

:deep(.n-button:active) {
    transition: background-color 0.2s;
}

.custom-titlebar {
    height: 32px;
    background-color: var(--n-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 8px;
    -webkit-app-region: drag;
    user-select: none;
    border-bottom: 1px solid var(--n-border-color);
}

.titlebar-left {
    display: flex;
    align-items: center;
}

.titlebar-icon {
    height: 20px;
    width: 20px;
    margin-right: 8px;
}

.titlebar-title {
    font-size: 14px;
    font-weight: 500;
}

.titlebar-right {
    display: flex;
    align-items: center;
    -webkit-app-region: no-drag;
    margin-right: -5px;
}

.titlebar-right .n-button {
    margin-left: 5px;
    transition: background-color 0.2s;
}

.titlebar-right .n-button:hover {
    background-color: rgba(0, 0, 0, 0.2) !important;
}

.titlebar-right .n-button:active {
    background-color: rgba(0, 0, 0, 0.2) !important;
}

.titlebar-right .n-button:last-child:hover {
    background-color: rgba(232, 17, 35, 0.9) !important;
    color: white !important;
}

.titlebar-right .n-button:last-child:active {
    background-color: rgba(232, 17, 35, 1) !important;
}

:deep(.n-button:not(:hover):not(:active)) {
    background-color: transparent !important;
}

.settings-header {
    padding: 16px;
    margin-bottom: 16px;
}

.settings-header h2 {
    margin: 0;
}

.settings-content {
    padding: 0 16px;
    flex: 1;
    overflow-y: auto;
}
</style>
