<script setup>
import { NLayout, NLayoutHeader } from 'naive-ui';
</script>

<template>
    <NLayout class="settings-layout">
        <NLayoutHeader class="settings-header" bordered>
            <h2>设置</h2>
        </NLayoutHeader>
    </NLayout>
</template>

<style scoped>
.settings-layout {
    height: 100%;
    padding: 16px;
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
}
</style>
