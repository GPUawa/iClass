// 切换选项卡
const tabs = document.querySelectorAll('.sidebar li');
const tabContents = document.querySelectorAll('.tab-content');
const settingsPath = "../../../data/config/settings.json";

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // 移除所有选项卡的激活状态
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 隐藏所有内容区域
        tabContents.forEach(content => content.classList.remove('active'));

        // 显示当前选项卡对应的内容区域
        const targetTab = tab.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');
    });
});

// 保存时间偏移
document.getElementById('saveOffset').addEventListener('click', () => {
    const timeOffset = document.getElementById('timeOffset').value;
    if (timeOffset) {
        localStorage.setItem('timeOffset', timeOffset);
        alert('时间偏移已保存！');
    } else {
        alert('请输入有效的时间偏移值！');
    }
});

// 加载保存的时间偏移
window.addEventListener('load', () => {
    const savedOffset = localStorage.getItem('timeOffset');
    if (savedOffset) {
        document.getElementById('timeOffset').value = savedOffset;
    }
});

// 切换主题
const themeSelector = document.getElementById('themeSelector');
themeSelector.addEventListener('change', () => {
    const selectedTheme = themeSelector.value;
    document.body.className = `${selectedTheme}-theme`;
    localStorage.setItem('theme', selectedTheme);
});

// 加载保存的主题
window.addEventListener('load', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = `${savedTheme}-theme`;
    themeSelector.value = savedTheme;
});

// 加载保存的设置
window.addEventListener('load', () => {
    loadSettings();
});

// 保存设置
function saveSettings(settings) {
    ipcRenderer.send('save-settings', { path: settingsPath, settings });
}

// 加载设置
function loadSettings() {
    ipcRenderer.send('load-settings', settingsPath);
    ipcRenderer.on('load-settings-reply', (event, settings) => {
        if (settings.timeOffset) {
            document.getElementById('timeOffset').value = settings.timeOffset;
        }
        if (settings.theme) {
            document.body.className = `${settings.theme}-theme`;
            themeSelector.value = settings.theme;
        }
    });
}