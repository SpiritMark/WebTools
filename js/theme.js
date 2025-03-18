/**
 * 工具箱Pro主题管理脚本
 * 用于实现全站通用的主题切换功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题设置
    initTheme();
    
    // 设置主题选择器的点击事件
    setupThemeSelector();
});

/**
 * 初始化主题
 * 从localStorage读取主题设置并应用
 */
function initTheme() {
    // 从localStorage中获取保存的主题设置
    const savedTheme = localStorage.getItem('theme') || 'neomorphic';
    
    // 应用保存的主题设置
    applyTheme(savedTheme);
}

/**
 * 应用指定的主题
 * @param {string} theme - 主题名称
 */
function applyTheme(theme) {
    // 移除所有主题类
    document.documentElement.classList.remove(
        'theme-simple', 
        'theme-dark',
        'theme-eye-care',
        'theme-ocean',
        'theme-vscode'
    );
    
    // 应用选择的主题
    if (theme !== 'neomorphic') {
        document.documentElement.classList.add(`theme-${theme}`);
    }
    
    // 保存主题设置到localStorage
    localStorage.setItem('theme', theme);
    
    // 更新主题选择器的活动状态
    updateThemeSelectorState(theme);
}

/**
 * 设置主题选择器的点击事件
 */
function setupThemeSelector() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeDropdown = document.getElementById('themeDropdown');
    
    if (!themeToggleBtn || !themeDropdown) return;
    
    // 切换主题下拉菜单的显示/隐藏
    themeToggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        themeDropdown.style.display = themeDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // 点击文档其他地方时关闭下拉菜单
    document.addEventListener('click', function(e) {
        if (!themeDropdown.contains(e.target) && e.target !== themeToggleBtn) {
            themeDropdown.style.display = 'none';
        }
    });
    
    // 绑定每个主题选项的点击事件
    const simpleThemeBtn = document.getElementById('simpleTheme');
    const neomorphicThemeBtn = document.getElementById('neomorphicTheme');
    const darkThemeBtn = document.getElementById('darkTheme');
    const eyeCareThemeBtn = document.getElementById('eyeCareTheme');
    const oceanThemeBtn = document.getElementById('oceanTheme');
    const vscodeThemeBtn = document.getElementById('vscodeTheme');
    
    if (simpleThemeBtn) {
        simpleThemeBtn.addEventListener('click', function() {
            applyTheme('simple');
            themeDropdown.style.display = 'none';
        });
    }
    
    if (neomorphicThemeBtn) {
        neomorphicThemeBtn.addEventListener('click', function() {
            applyTheme('neomorphic');
            themeDropdown.style.display = 'none';
        });
    }
    
    if (darkThemeBtn) {
        darkThemeBtn.addEventListener('click', function() {
            applyTheme('dark');
            themeDropdown.style.display = 'none';
        });
    }
    
    if (eyeCareThemeBtn) {
        eyeCareThemeBtn.addEventListener('click', function() {
            applyTheme('eye-care');
            themeDropdown.style.display = 'none';
        });
    }
    
    if (oceanThemeBtn) {
        oceanThemeBtn.addEventListener('click', function() {
            applyTheme('ocean');
            themeDropdown.style.display = 'none';
        });
    }
    
    if (vscodeThemeBtn) {
        vscodeThemeBtn.addEventListener('click', function() {
            applyTheme('vscode');
            themeDropdown.style.display = 'none';
        });
    }
    
    // 更新主题选择器的活动状态
    updateThemeSelectorState();
}

/**
 * 更新主题选择器的活动状态
 */
function updateThemeSelectorState(theme) {
    const currentTheme = theme || localStorage.getItem('theme') || 'neomorphic';
    
    // 获取所有主题选项
    const themeItems = document.querySelectorAll('.theme-item');
    if (!themeItems.length) return;
    
    // 移除所有主题选项的活动状态
    themeItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 为当前主题添加活动状态
    const activeThemeItem = document.getElementById(`${currentTheme}Theme`);
    if (activeThemeItem) {
        activeThemeItem.classList.add('active');
    }
    
    // 更新主题切换按钮的图标
    updateThemeToggleIcon(currentTheme);
}

/**
 * 更新主题切换按钮的图标
 * @param {string} theme - 当前主题
 */
function updateThemeToggleIcon(theme) {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (!themeToggleBtn) return;
    
    const iconElement = themeToggleBtn.querySelector('i');
    if (!iconElement) return;
    
    // 移除所有图标类
    iconElement.className = '';
    
    // 根据当前主题设置图标
    switch (theme) {
        case 'simple':
            iconElement.className = 'ri-contrast-2-line';
            break;
        case 'dark':
            iconElement.className = 'ri-moon-line';
            break;
        case 'eye-care':
            iconElement.className = 'ri-eye-line';
            break;
        case 'ocean':
            iconElement.className = 'ri-water-flash-line';
            break;
        case 'vscode':
            iconElement.className = 'ri-code-box-line';
            break;
        default:
            iconElement.className = 'ri-palette-line';
    }
} 