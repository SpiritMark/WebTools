document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const logoNameInput = document.getElementById('logo-name');
    const logoSloganInput = document.getElementById('logo-slogan');
    const industrySelect = document.getElementById('logo-industry');
    const styleSelect = document.getElementById('logo-style');
    const primaryColorInput = document.getElementById('primary-color');
    const secondaryColorInput = document.getElementById('secondary-color');
    const generateButton = document.getElementById('generate-logos');
    const refreshButton = document.getElementById('refresh-logos');
    const logosContainer = document.getElementById('logos-container');
    const emptyState = document.getElementById('empty-state');
    const nameCounter = document.getElementById('name-counter');
    const sloganCounter = document.getElementById('slogan-counter');
    
    // 模态框元素
    const modal = document.getElementById('logo-detail-modal');
    const closeModal = document.querySelector('.close-modal');
    const logoDetailView = document.getElementById('logo-detail-view');
    const downloadPngBtn = document.getElementById('download-png');
    const downloadSvgBtn = document.getElementById('download-svg');
    
    // 颜色方案按钮
    const colorSchemeButtons = document.querySelectorAll('.color-scheme');
    
    // 当前活动的logo数据
    let activeLogo = null;
    
    // 计数器更新
    logoNameInput.addEventListener('input', function() {
        nameCounter.textContent = this.value.length;
    });
    
    logoSloganInput.addEventListener('input', function() {
        sloganCounter.textContent = this.value.length;
    });
    
    // 颜色方案选择
    colorSchemeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const primary = this.getAttribute('data-primary');
            const secondary = this.getAttribute('data-secondary');
            
            primaryColorInput.value = primary;
            secondaryColorInput.value = secondary;
            
            // 更新活动状态
            colorSchemeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 生成Logo
    generateButton.addEventListener('click', createSimpleLogos);
    refreshButton.addEventListener('click', createSimpleLogos);
    
    // 简单Logo生成函数
    function createSimpleLogos() {
        const name = logoNameInput.value.trim();
        
        if (!name) {
            showToast('请输入Logo名称');
            return;
        }
        
        const slogan = logoSloganInput.value.trim();
        const industry = industrySelect.value;
        const style = styleSelect.value;
        const primaryColor = primaryColorInput.value;
        const secondaryColor = secondaryColorInput.value;
        
        // 清空容器
        logosContainer.innerHTML = '';
        emptyState.style.display = 'none';
        
        // 生成6种不同风格的logo
        const logoTypes = ['text', 'icon', 'combined', 'emblem', 'abstract', 'lettermark'];
        
        for (let i = 0; i < 6; i++) {
            const logoCard = document.createElement('div');
            logoCard.className = 'logo-card';
            
            const logoPreview = document.createElement('div');
            logoPreview.className = 'logo-preview';
            
            const logoInfo = document.createElement('div');
            logoInfo.className = 'logo-info';
            
            // 根据索引生成不同类型的logo
            const logoType = logoTypes[i];
            const logoSvg = createSimpleSvg(name, slogan, primaryColor, secondaryColor, logoType);
            
            logoPreview.innerHTML = logoSvg;
            
            logoInfo.innerHTML = `
                <h4>${name}</h4>
                <p>${getLogoStyleName(logoType)}</p>
            `;
            
            logoCard.appendChild(logoPreview);
            logoCard.appendChild(logoInfo);
            
            // 保存logo数据到元素
            const logoData = {
                name,
                slogan,
                svg: logoSvg,
                type: logoType,
                primaryColor,
                secondaryColor
            };
            
            logoCard.dataset.logo = JSON.stringify(logoData);
            
            // 点击查看详情
            logoCard.addEventListener('click', function() {
                activeLogo = JSON.parse(this.dataset.logo);
                openLogoDetail(activeLogo);
            });
            
            logosContainer.appendChild(logoCard);
        }
    }
    
    // 获取风格名称
    function getLogoStyleName(type) {
        const names = {
            'text': '文字Logo',
            'icon': '图标Logo',
            'combined': '组合Logo',
            'emblem': '徽章Logo',
            'abstract': '抽象Logo',
            'lettermark': '首字母Logo'
        };
        
        return names[type] || '自定义Logo';
    }
    
    // 简化版Logo SVG生成函数
    function createSimpleSvg(name, slogan, primaryColor, secondaryColor, type) {
        const svgWidth = 300;
        const svgHeight = 200;
        const firstLetter = name.charAt(0).toUpperCase();
        
        // 创建随机ID，确保每次生成的渐变ID都不同
        const randomId = Date.now() + Math.floor(Math.random() * 10000);
        const gradientId = `gradient-${randomId}`;
        const gradientId2 = `gradient-${randomId + 1}`;
        const radialGradientId = `radial-${randomId + 2}`;
        const textureId = `texture-${randomId + 3}`;
        const filterId = `filter-${randomId + 4}`;
        
        // 预先处理颜色变化，避免在模板字符串中处理
        const lightPrimary = lightenColor(primaryColor, 20);
        const darkPrimary = darkenColor(primaryColor, 20);
        const lightSecondary = lightenColor(secondaryColor, 20);
        const darkSecondary = darkenColor(secondaryColor, 20);
        const mixedColor = mixColors(primaryColor, secondaryColor);
        
        // 随机渐变方向
        const gradientAngle = Math.floor(Math.random() * 360);
        const x2 = 50 + 50 * Math.cos(gradientAngle * Math.PI / 180);
        const y2 = 50 + 50 * Math.sin(gradientAngle * Math.PI / 180);
        
        // 随机径向渐变焦点
        const focalX = 30 + Math.floor(Math.random() * 40);
        const focalY = 30 + Math.floor(Math.random() * 40);
        
        // 基本SVG模板，添加渐变定义
        let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <!-- 线性渐变 -->
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">
                    <stop offset="0%" stop-color="${primaryColor}" />
                    <stop offset="100%" stop-color="${lightPrimary}" />
                </linearGradient>
                
                <!-- 辅助线性渐变 -->
                <linearGradient id="${gradientId2}" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="${secondaryColor}" />
                    <stop offset="50%" stop-color="${mixedColor}" />
                    <stop offset="100%" stop-color="${darkSecondary}" />
                </linearGradient>
                
                <!-- 径向渐变 -->
                <radialGradient id="${radialGradientId}" cx="50%" cy="50%" r="70%" fx="${focalX}%" fy="${focalY}%">
                    <stop offset="0%" stop-color="${lightPrimary}" />
                    <stop offset="80%" stop-color="${primaryColor}" />
                    <stop offset="100%" stop-color="${darkPrimary}" />
                </radialGradient>
                
                <!-- 阴影效果 -->
                <filter id="${filterId}">
                    <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="${darkPrimary}" flood-opacity="0.3"/>
                </filter>
            </defs>`;
        
        svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="white"/>`;
        
        // 根据Logo类型选择不同的设计方案
        switch(type) {
            case 'text':
                // 文字Logo
                svg += `
                    <rect x="50" y="85" width="200" height="40" fill="${lightPrimary}" opacity="0.1"/>
                    <line x1="75" y1="130" x2="225" y2="130" stroke="${secondaryColor}" stroke-width="2" stroke-linecap="round"/>
                    <text x="150" y="105" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="url(#${gradientId})" text-anchor="middle" filter="url(#${filterId})">${name}</text>
                `;
                if (slogan) {
                    svg += `<text x="150" y="145" font-family="Arial, sans-serif" font-size="16" fill="url(#${gradientId2})" text-anchor="middle">${slogan}</text>`;
                }
                break;
                
            case 'icon':
                // 图标Logo
                svg += `
                    <rect x="105" y="45" width="90" height="90" rx="15" fill="url(#${radialGradientId})" filter="url(#${filterId})"/>
                    <circle cx="150" cy="90" r="35" fill="${lightPrimary}" opacity="0.3"/>
                    <path d="M110,45 L190,45 M110,135 L190,135" stroke="white" stroke-width="1" opacity="0.4" stroke-dasharray="2,2"/>
                    <text x="150" y="100" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
                    <path d="M115,155 C130,160 170,160 185,155" stroke="${secondaryColor}" stroke-width="1.5" fill="none"/>
                    <text x="150" y="170" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="url(#${gradientId2})" text-anchor="middle">${name}</text>
                `;
                break;
                
            case 'combined':
                // 组合Logo
                svg += `
                    <circle cx="85" cy="100" r="45" fill="url(#${radialGradientId})" filter="url(#${filterId})"/>
                    <circle cx="85" cy="100" r="25" fill="${lightPrimary}" opacity="0.2"/>
                    <text x="85" y="112" font-family="Arial, sans-serif" font-size="35" font-weight="bold" fill="white" text-anchor="middle">${firstLetter}</text>
                    <path d="M130,100 L140,100" stroke="${secondaryColor}" stroke-width="2" />
                    <text x="190" y="105" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="url(#${gradientId2})" text-anchor="middle">${name}</text>
                `;
                break;
                
            case 'emblem':
                // 徽章Logo
                svg += `
                    <circle cx="150" cy="100" r="70" fill="url(#${radialGradientId})" filter="url(#${filterId})"/>
                    <circle cx="150" cy="100" r="55" fill="white"/>
                    <circle cx="150" cy="100" r="63" fill="none" stroke="${lightPrimary}" stroke-width="1" opacity="0.6"/>
                    <circle cx="150" cy="100" r="52" fill="none" stroke="${lightPrimary}" stroke-width="1" stroke-dasharray="3,2"/>
                    <path d="M120,70 A30,30 0 0,1 180,70" fill="none" stroke="${secondaryColor}" stroke-width="1.5" opacity="0.6"/>
                    <path d="M120,130 A30,30 0 0,0 180,130" fill="none" stroke="${secondaryColor}" stroke-width="1.5" opacity="0.6"/>
                    <text x="150" y="85" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="url(#${gradientId2})" text-anchor="middle">${firstLetter}</text>
                    <text x="150" y="110" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="url(#${gradientId})" text-anchor="middle">${name}</text>
                `;
                if (slogan) {
                    svg += `<text x="150" y="130" font-family="Arial, sans-serif" font-size="10" fill="${secondaryColor}" text-anchor="middle">${slogan}</text>`;
                } else {
                    svg += `<text x="150" y="130" font-family="Arial, sans-serif" font-size="10" fill="${secondaryColor}" text-anchor="middle">ESTABLISHED 2023</text>`;
                }
                break;
                
            case 'abstract':
                // 抽象Logo
                const shapeType = Math.floor(Math.random() * 3);
                if (shapeType === 0) {
                    // 多边形
                    svg += `
                        <polygon points="150,30 195,100 150,170 105,100" fill="url(#${radialGradientId})" filter="url(#${filterId})"/>
                        <polygon points="150,50 180,100 150,150 120,100" fill="${lightPrimary}" opacity="0.3"/>
                        <circle cx="150" cy="100" r="20" fill="white" opacity="0.6"/>
                        <path d="M105,100 L150,100 L195,100" stroke="white" stroke-width="1" opacity="0.5"/>
                        <path d="M150,30 L150,170" stroke="white" stroke-width="1" opacity="0.5"/>
                    `;
                } else if (shapeType === 1) {
                    // 波浪
                    svg += `
                        <path d="M80,100 C100,70 130,130 150,100 C170,70 200,130 220,100" fill="url(#${gradientId})" filter="url(#${filterId})"/>
                        <path d="M90,100 C110,80 130,120 150,100 C170,80 190,120 210,100" fill="none" stroke="white" stroke-width="2" opacity="0.5"/>
                        <circle cx="150" cy="100" r="15" fill="${secondaryColor}" opacity="0.8"/>
                    `;
                } else {
                    // 重叠圆形
                    svg += `
                        <circle cx="130" cy="100" r="40" fill="url(#${gradientId})" opacity="0.8"/>
                        <circle cx="170" cy="100" r="40" fill="url(#${gradientId2})" opacity="0.8"/>
                        <circle cx="150" cy="80" r="30" fill="${lightPrimary}" opacity="0.6"/>
                    `;
                }
                svg += `<text x="150" y="170" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="url(#${gradientId2})" text-anchor="middle">${name}</text>`;
                break;
                
            case 'lettermark':
                // 首字母Logo
                const randomAngle = Math.floor(Math.random() * 35);
                svg += `
                    <rect x="90" y="45" width="120" height="120" rx="15" fill="${lightPrimary}" opacity="0.1" transform="rotate(${randomAngle}, 150, 100)"/>
                    <rect x="95" y="50" width="110" height="110" rx="12" fill="white" stroke="url(#${gradientId})" stroke-width="2" transform="rotate(${randomAngle}, 150, 100)"/>
                    <line x1="105" y1="60" x2="195" y2="60" stroke="${secondaryColor}" stroke-width="1" opacity="0.4" transform="rotate(${randomAngle}, 150, 100)"/>
                    <text x="150" y="115" font-family="Arial, sans-serif" font-size="90" font-weight="bold" fill="url(#${radialGradientId})" text-anchor="middle">${firstLetter}</text>
                    <text x="150" y="170" font-family="Arial, sans-serif" font-size="18" fill="url(#${gradientId2})" text-anchor="middle">${name}</text>
                `;
                break;
        }
        
        svg += `</svg>`;
        return svg;
    }
    
    // 打开Logo详情
    function openLogoDetail(logoData) {
        logoDetailView.innerHTML = logoData.svg;
        modal.style.display = 'block';
    }
    
    // 关闭模态框
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 下载PNG
    downloadPngBtn.addEventListener('click', function() {
        if (!activeLogo) return;
        
        const svg = logoDetailView.querySelector('svg');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布大小
        canvas.width = 600;
        canvas.height = 400;
        
        // 创建图片用于绘制
        const img = new Image();
        img.onload = function() {
            // 绘制白色背景
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制SVG图像
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `${activeLogo.name}-logo.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        
        // 将SVG转换为数据URL
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        img.src = svgUrl;
    });
    
    // 下载SVG
    downloadSvgBtn.addEventListener('click', function() {
        if (!activeLogo) return;
        
        // 创建SVG Blob
        const svgData = new XMLSerializer().serializeToString(logoDetailView.querySelector('svg'));
        const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
        const svgUrl = URL.createObjectURL(svgBlob);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${activeLogo.name}-logo.svg`;
        link.href = svgUrl;
        link.click();
        
        // 清理
        setTimeout(() => {
            URL.revokeObjectURL(svgUrl);
        }, 100);
    });
    
    // 颜色处理函数
    function lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        
        return '#' + (
            0x1000000 + 
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
    
    function darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        
        return '#' + (
            0x1000000 + 
            (R > 0 ? R : 0) * 0x10000 + 
            (G > 0 ? G : 0) * 0x100 + 
            (B > 0 ? B : 0)
        ).toString(16).slice(1);
    }
    
    function mixColors(color1, color2, ratio = 0.5) {
        const c1 = parseInt(color1.replace('#', ''), 16);
        const c2 = parseInt(color2.replace('#', ''), 16);
        
        const r1 = (c1 >> 16) & 0xFF;
        const g1 = (c1 >> 8) & 0xFF;
        const b1 = c1 & 0xFF;
        
        const r2 = (c2 >> 16) & 0xFF;
        const g2 = (c2 >> 8) & 0xFF;
        const b2 = c2 & 0xFF;
        
        const r = Math.floor(r1 * (1 - ratio) + r2 * ratio);
        const g = Math.floor(g1 * (1 - ratio) + g2 * ratio);
        const b = Math.floor(b1 * (1 - ratio) + b2 * ratio);
        
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    // 显示提示消息
    function showToast(message) {
        let toast = document.getElementById('toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '4px';
            toast.style.zIndex = '1000';
            toast.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }
}); 