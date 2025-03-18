/**
 * 工具箱Pro主脚本
 * 包含主题切换、导航栏和其他UI交互功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化主题设置
    initTheme();
    
    // 初始化移动菜单
    initMobileMenu();
    
    // 初始化导航高亮
    initNavHighlight();
    
    // 初始化平滑滚动
    initSmoothScroll();
    
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化卡片交互效果
    initCardInteractions();
    
    // 滚动时添加阴影效果到头部
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 10) {
                header.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
            } else {
                header.style.boxShadow = 'none';
            }
        });
    }
    
    // 监听语言变更事件
    document.addEventListener('languageChanged', function(e) {
        const lang = e.detail.language;
        console.log('语言已切换至:', lang);
        
        // 当语言变更时，对于一些需要特殊处理的元素进行更新
        updateDynamicElements(lang);
    });

    // 导航栏滚动效果
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // 移动端菜单切换
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.getElementById('navList');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
            
            // 切换菜单图标
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navList.classList.contains('active')) {
                    icon.classList.remove('ri-menu-line');
                    icon.classList.add('ri-close-line');
                } else {
                    icon.classList.remove('ri-close-line');
                    icon.classList.add('ri-menu-line');
                }
            }
        });
        
        // 点击导航链接后关闭移动菜单
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navList.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('ri-close-line');
                        icon.classList.add('ri-menu-line');
                    }
                }
            });
        });
    }
    
    // 点击文档其他地方关闭移动菜单
    document.addEventListener('click', function(event) {
        if (navList && navList.classList.contains('active')) {
            if (!navList.contains(event.target) && !menuToggle.contains(event.target)) {
                navList.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('ri-close-line');
                    icon.classList.add('ri-menu-line');
                }
            }
        }
    });
    
    // 导航项活动状态控制
    const setActiveNavItem = () => {
        const navLinks = document.querySelectorAll('.nav-list a');
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        // 简化路径比较 - 提取最后的文件名
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // 先移除所有活动状态
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // 对于主页的特殊处理 - 放在前面确保优先级
        if (currentPage === '' || currentPage === 'index.html' || currentPage === '/') {
            const homeLink = document.querySelector('.nav-list a[href="index.html"]');
            if (homeLink) {
                homeLink.classList.add('active');
                return; // 已经处理了首页，不需要继续执行
            }
        }
        
        // 处理其他页面和锚点链接
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            
            // 提取链接的文件名部分
            let linkPage = '';
            if (linkHref.startsWith('#')) {
                linkPage = 'index.html' + linkHref; // 主页上的锚点链接
            } else {
                linkPage = linkHref.split('/').pop() || 'index.html';
            }
            
            // 设置活动状态的条件
            const isCurrentPage = currentPage === linkPage;
            const isIndexWithHash = currentPage === 'index.html' && linkHref === currentHash;
            
            // 如果是当前页面或特殊情况，添加活动状态
            if (isCurrentPage || isIndexWithHash) {
                link.classList.add('active');
            }
        });
    };
    
    // 初始设置活动状态
    setActiveNavItem();
    
    // 哈希改变时更新活动状态
    window.addEventListener('hashchange', setActiveNavItem);
});

/**
 * 主题切换功能
 */
function initTheme() {
    // 获取主题选择器元素
    const simpleThemeBtn = document.getElementById('simpleTheme');
    const neomorphicThemeBtn = document.getElementById('neomorphicTheme');
    
    if (!simpleThemeBtn || !neomorphicThemeBtn) return;
    
    // 从localStorage中获取保存的主题设置
    const savedTheme = localStorage.getItem('theme');
    
    // 应用保存的主题设置或默认主题
    if (savedTheme === 'simple') {
        applySimpleTheme();
    } else {
        applyNeomorphicTheme();
    }
    
    // 极简主题按钮点击事件
    simpleThemeBtn.addEventListener('click', function() {
        applySimpleTheme();
        localStorage.setItem('theme', 'simple');
    });
    
    // 拟态主题按钮点击事件
    neomorphicThemeBtn.addEventListener('click', function() {
        applyNeomorphicTheme();
        localStorage.setItem('theme', 'neomorphic');
    });
}

// 应用极简主题
function applySimpleTheme() {
    document.documentElement.classList.add('theme-simple');
    const simpleThemeBtn = document.getElementById('simpleTheme');
    const neomorphicThemeBtn = document.getElementById('neomorphicTheme');
    if (simpleThemeBtn) simpleThemeBtn.classList.add('active');
    if (neomorphicThemeBtn) neomorphicThemeBtn.classList.remove('active');
}

// 应用拟态主题
function applyNeomorphicTheme() {
    document.documentElement.classList.remove('theme-simple');
    const simpleThemeBtn = document.getElementById('simpleTheme');
    const neomorphicThemeBtn = document.getElementById('neomorphicTheme');
    if (simpleThemeBtn) simpleThemeBtn.classList.remove('active');
    if (neomorphicThemeBtn) neomorphicThemeBtn.classList.add('active');
}

/**
 * 移动端菜单功能
 */
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.getElementById('navList');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            navList.classList.toggle('show');
            menuToggle.classList.toggle('active');
        });
    }
}

/**
 * 导航栏高亮功能
 */
function initNavHighlight() {
    // 设置当前活动的导航项
    function setActiveNavItem() {
        const navLinks = document.querySelectorAll('.nav-list a');
        const currentPath = window.location.pathname;
        const currentHash = window.location.hash;
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            if (currentHash && link.getAttribute('href') === currentHash) {
                link.classList.add('active');
            } else if (!currentHash && link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }
    
    // 初始化时设置活动状态
    setActiveNavItem();
    
    // 哈希改变时更新活动状态
    window.addEventListener('hashchange', setActiveNavItem);
}

// 初始化平滑滚动
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // 考虑导航栏高度
                    behavior: 'smooth'
                });
                
                // 如果在移动端，点击导航链接后关闭菜单
                const navList = document.getElementById('navList');
                const menuToggle = document.getElementById('menuToggle');
                if (navList && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    
                    // 恢复菜单按钮图标
                    const icon = menuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.remove('ri-close-line');
                        icon.classList.add('ri-menu-line');
                    }
                }
            }
        });
    });
}

/**
 * 初始化滚动动画
 * 当元素出现在视口中时添加动画效果
 */
function initScrollAnimations() {
    // 给需要动画的元素添加 fade-in 类
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card, index) => {
        card.classList.add('fade-in');
        // 添加延迟，创建依次出现的效果
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // 监听滚动事件，激活动画
    const fadeElements = document.querySelectorAll('.fade-in');
    
    // 检查元素是否在视口中
    function checkFadeElements() {
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            // 元素的顶部进入视口底部，或者元素的底部还没有离开视口顶部
            if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                element.classList.add('active');
            }
        });
    }
    
    // 页面加载时先检查一次
    checkFadeElements();
    
    // 滚动时检查
    window.addEventListener('scroll', checkFadeElements);
}

/**
 * 初始化卡片交互效果
 * 添加视差效果和鼠标跟踪效果
 */
function initCardInteractions() {
    const cards = document.querySelectorAll('.category-card');
    
    cards.forEach(card => {
        // 鼠标移入移出效果
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.category-icon');
            if (icon) {
                icon.style.transform = 'translateY(-10px)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.category-icon');
            if (icon) {
                icon.style.transform = 'translateY(0)';
            }
        });
        
        // 视差效果
        card.addEventListener('mousemove', function(e) {
            const cardRect = this.getBoundingClientRect();
            const x = e.clientX - cardRect.left;
            const y = e.clientY - cardRect.top;
            
            const centerX = cardRect.width / 2;
            const centerY = cardRect.height / 2;
            
            const deltaX = (x - centerX) / 20;
            const deltaY = (y - centerY) / 20;
            
            this.style.transform = `translateY(-15px) scale(1.02) rotateX(${-deltaY}deg) rotateY(${deltaX}deg)`;
        });
        
        // 恢复原来的transform
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // 为工具列表项添加样式 - 修改这里使链接永远可见
    const toolItems = document.querySelectorAll('.tool-list li');
    toolItems.forEach((item, index) => {
        // 链接默认可见，但添加淡入效果
        item.style.opacity = '1';
        item.style.transform = 'translateX(0)';
        item.style.transition = 'all 0.3s ease';
    });
    
    // 修改卡片悬停时的链接交互效果
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const items = this.querySelectorAll('.tool-list li');
            items.forEach((item, index) => {
                // 悬停时链接有微小的动画效果，但不影响可见性
                item.style.transform = 'translateX(5px)';
                item.style.transitionDelay = `${index * 0.05}s`;
            });
        });
        
        card.addEventListener('mouseleave', function() {
            const items = this.querySelectorAll('.tool-list li');
            items.forEach((item) => {
                // 离开时恢复原位，但保持可见
                item.style.transform = 'translateX(0)';
                item.style.transitionDelay = '0s';
            });
        });
    });
}

/**
 * 更新动态元素的内容
 * 在语言切换时处理需要特殊处理的元素
 */
function updateDynamicElements(language) {
    // 更新页面标题
    const titleEl = document.querySelector('title');
    if (titleEl && titleEl.getAttribute('data-i18n')) {
        if (typeof getText === 'function') {
            document.title = getText(titleEl.getAttribute('data-i18n'), language);
        }
    }
    
    // 其他可能需要动态更新的元素
    // ...
}

/**
 * 获取当前页面的翻译类别
 * 根据页面URL判断当前页面类型
 */
function getCurrentPageCategory() {
    const path = window.location.pathname;
    
    if (path.includes('id-photo')) {
        return 'idPhoto';
    } else if (path.includes('image-editor')) {
        return 'imageEditor';
    } else if (path.includes('image-collage')) {
        return 'imageCollage';
    } else if (path.includes('image-effects')) {
        return 'imageEffects';
    } else if (path.includes('bg-remove')) {
        return 'bgRemove';
    } else if (path.includes('poster-maker')) {
        return 'posterMaker';
    } else if (path.endsWith('index.html') || path === '/' || path.endsWith('/')) {
        return 'index';
    }
    
    return 'common';
}

// 语言切换功能
function switchLanguage(lang) {
    if (typeof changeLanguage === 'function') {
        // 如果存在i18n.js中的changeLanguage函数，使用它
        changeLanguage(lang);
    } else {
        console.warn('changeLanguage function not found in i18n.js');
        // 设置语言Cookie作为备用方案
        document.cookie = `language=${lang};path=/;max-age=${60*60*24*30}`;
        // 刷新页面应用新语言
        window.location.reload();
    }
} 