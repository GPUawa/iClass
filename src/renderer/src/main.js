/**
 * @author GPUawa
 * @since 2025/10/19
 * @license GPL-3.0
 * @description 前端主入口
 */

import './assets/main.css';

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

// 导入naive-ui
import {
    create,
    NButton,
    NCard,
    NLayout,
    NLayoutHeader,
    NLayoutContent,
    NSpace,
    NIcon,
} from 'naive-ui';

const naive = create({
    components: [NButton, NCard, NLayout, NLayoutHeader, NLayoutContent, NSpace, NIcon],
});

const app = createApp(App);

app.use(router);
app.use(naive);

app.mount('#app');
