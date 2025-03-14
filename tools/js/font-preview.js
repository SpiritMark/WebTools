document.addEventListener('DOMContentLoaded', function() {
    // 字体列表数据 - 包含通用字体和Google字体
    const fonts = [
        // 无衬线字体
        { name: 'Arial', family: 'Arial, sans-serif', type: 'sans' },
        { name: 'Helvetica', family: 'Helvetica, sans-serif', type: 'sans' },
        { name: '微软雅黑', family: "'Microsoft YaHei', sans-serif", type: 'sans' },
        { name: '苹方', family: "'PingFang SC', sans-serif", type: 'sans' },
        { name: 'Roboto', family: "'Roboto', sans-serif", type: 'sans' },
        { name: 'Open Sans', family: "'Open Sans', sans-serif", type: 'sans' },
        { name: 'Lato', family: "'Lato', sans-serif", type: 'sans' },
        { name: 'Montserrat', family: "'Montserrat', sans-serif", type: 'sans' },
        { name: 'Noto Sans SC', family: "'Noto Sans SC', sans-serif", type: 'sans' },
        
        // 衬线字体
        { name: 'Times New Roman', family: "'Times New Roman', serif", type: 'serif' },
        { name: 'Georgia', family: 'Georgia, serif', type: 'serif' },
        { name: '宋体', family: "'SimSun', serif", type: 'serif' },
        { name: '楷体', family: "'KaiTi', serif", type: 'serif' },
        { name: 'Noto Serif SC', family: "'Noto Serif SC', serif", type: 'serif' },
        
        // 等宽字体
        { name: 'Courier New', family: "'Courier New', monospace", type: 'mono' },
        { name: 'Consolas', family: 'Consolas, monospace', type: 'mono' },
        { name: 'Monaco', family: 'Monaco, monospace', type: 'mono' },
        
        // 显示字体
        { name: 'Impact', family: 'Impact, sans-serif', type: 'display' },
        { name: 'Comic Sans MS', family: "'Comic Sans MS', cursive", type: 'display' },
        { name: 'Brush Script MT', family: "'Brush Script MT', cursive", type: 'display' }
    ];
    
    // DOM元素
    const previewText = document.getElementById('preview-text');
    const fontSizeInput = document.getElementById('font-size');
    const fontSizeValue = document.getElementById('font-size-value');
    const fontWeightSelect = document.getElementById('font-weight');
    const textColorInput = document.getElementById('text-color');
    const colorHex = document.getElementById('color-hex');
    const bgColorInput = document.getElementById('bg-color');
    const bgHex = document.getElementById('bg-hex');
    const letterSpacingInput = document.getElementById('letter-spacing');
    const letterSpacingValue = document.getElementById('letter-spacing-value');
    const lineHeightInput = document.getElementById('line-height');
    const lineHeightValue = document.getElementById('line-height-value');
    const alignButtons = document.querySelectorAll('.align-btn');
    const textTransformSelect = document.getElementById('text-transform');
    const fontSearch = document.getElementById('font-search');
    const showSansCheckbox = document.getElementById('show-sans');
    const showSerifCheckbox = document.getElementById('show-serif');
    const showMonoCheckbox = document.getElementById('show-mono');
    const showDisplayCheckbox = document.getElementById('show-display');
    const fontsList = document.getElementById('fonts-list');
    const fontPreviewsContainer = document.getElementById('font-previews-container');
    const clearPreviewsBtn = document.getElementById('clear-previews');
    const compareBtn = document.getElementById('compare-fonts');
    const fontComparison = document.getElementById('font-comparison');
    const resetTextBtn = document.getElementById('reset-text');
    const quickTextBtns = document.querySelectorAll('.quick-text-btn');
    const toggleAdvanced = document.querySelector('.toggle-advanced');
    const advancedOptionsPanel = document.querySelector('.advanced-options-panel');
    
    // 默认文本
    const defaultText = "输入文字，查看不同字体下的显示效果";
    
    // 当前预览的字体
    let previewedFonts = [];
    
    // 初始化字体列表
    initFontsList();
    
    // 初始化预览选项事件监听
    initPreviewOptions();
    
    // 初始化高级选项面板
    initAdvancedOptions();
    
    // 初始化快速文本选择
    initQuickTextButtons();
    
    // 初始化字体搜索和过滤
    initFontSearch();
    
    // 初始化清除和对比功能
    initActionButtons();
    
    // 初始化字体列表
    function initFontsList() {
        fonts.forEach(font => {
            const fontItem = document.createElement('div');
            fontItem.className = 'font-item';
            fontItem.dataset.font = font.family;
            fontItem.dataset.type = font.type;
            fontItem.dataset.name = font.name;
            
            fontItem.innerHTML = `
                <div>
                    <div class="font-name">${font.name}</div>
                    <div class="font-sample" style="font-family: ${font.family}">字体预览 Aa Bb 123</div>
                </div>
                <button class="add-font-btn" data-font="${font.family}" data-name="${font.name}">
                    <i class="ri-add-line"></i>
                </button>
            `;
            
            fontsList.appendChild(fontItem);
            
            // 添加字体到预览
            fontItem.querySelector('.add-font-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                const fontFamily = this.dataset.font;
                const fontName = this.dataset.name;
                addFontPreview(fontFamily, fontName);
            });
            
            // 点击字体项也可以添加
            fontItem.addEventListener('click', function() {
                const fontFamily = this.dataset.font;
                const fontName = this.dataset.name;
                addFontPreview(fontFamily, fontName);
            });
        });
    }
    
    // 初始化预览选项事件监听
    function initPreviewOptions() {
        // 字体大小
        fontSizeInput.addEventListener('input', function() {
            fontSizeValue.textContent = this.value + 'px';
            updatePreviewStyles();
        });
        
        // 字体粗细
        fontWeightSelect.addEventListener('change', updatePreviewStyles);
        
        // 文字颜色
        textColorInput.addEventListener('input', function() {
            colorHex.textContent = this.value.toUpperCase();
            updatePreviewStyles();
        });
        
        // 背景颜色
        bgColorInput.addEventListener('input', function() {
            bgHex.textContent = this.value.toUpperCase();
            updatePreviewStyles();
        });
    }
    
    // 初始化高级选项面板
    function initAdvancedOptions() {
        // 切换显示高级选项
        toggleAdvanced.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (advancedOptionsPanel.style.display === 'none') {
                advancedOptionsPanel.style.display = 'block';
                icon.className = 'ri-arrow-up-s-line';
            } else {
                advancedOptionsPanel.style.display = 'none';
                icon.className = 'ri-arrow-down-s-line';
            }
        });
        
        // 字间距
        letterSpacingInput.addEventListener('input', function() {
            letterSpacingValue.textContent = this.value + 'px';
            updatePreviewStyles();
        });
        
        // 行高
        lineHeightInput.addEventListener('input', function() {
            lineHeightValue.textContent = this.value;
            updatePreviewStyles();
        });
        
        // 文本对齐
        alignButtons.forEach(button => {
            button.addEventListener('click', function() {
                alignButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                updatePreviewStyles();
            });
        });
        
        // 文本转换
        textTransformSelect.addEventListener('change', updatePreviewStyles);
    }
    
    // 初始化快速文本选择
    function initQuickTextButtons() {
        // 恢复默认文本
        resetTextBtn.addEventListener('click', function() {
            previewText.value = defaultText;
            updatePreviewContents();
        });
        
        // 快速文本选择
        quickTextBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                previewText.value = this.dataset.text;
                updatePreviewContents();
            });
        });
        
        // 文本输入更新
        previewText.addEventListener('input', updatePreviewContents);
    }
    
    // 初始化字体搜索和过滤
    function initFontSearch() {
        // 搜索过滤
        fontSearch.addEventListener('input', filterFonts);
        
        // 字体类型过滤
        showSansCheckbox.addEventListener('change', filterFonts);
        showSerifCheckbox.addEventListener('change', filterFonts);
        showMonoCheckbox.addEventListener('change', filterFonts);
        showDisplayCheckbox.addEventListener('change', filterFonts);
    }
    
    // 初始化清除和对比功能
    function initActionButtons() {
        // 清除所有预览
        clearPreviewsBtn.addEventListener('click', clearPreviews);
        
        // 对比选中字体
        compareBtn.addEventListener('click', compareFonts);
    }
    
    // 过滤字体列表
    function filterFonts() {
        const searchText = fontSearch.value.toLowerCase();
        const showSans = showSansCheckbox.checked;
        const showSerif = showSerifCheckbox.checked;
        const showMono = showMonoCheckbox.checked;
        const showDisplay = showDisplayCheckbox.checked;
        
        const fontItems = fontsList.querySelectorAll('.font-item');
        
        fontItems.forEach(item => {
            const fontName = item.dataset.name.toLowerCase();
            const fontType = item.dataset.type;
            
            // 检查搜索条件
            const matchesSearch = searchText === '' || fontName.includes(searchText);
            
            // 检查类型过滤
            let matchesType = false;
            if (fontType === 'sans' && showSans) matchesType = true;
            if (fontType === 'serif' && showSerif) matchesType = true;
            if (fontType === 'mono' && showMono) matchesType = true;
            if (fontType === 'display' && showDisplay) matchesType = true;
            
            // 显示或隐藏字体
            if (matchesSearch && matchesType) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // 添加字体到预览列表
    function addFontPreview(fontFamily, fontName) {
        // 检查是否已经添加过
        if (previewedFonts.some(font => font.family === fontFamily)) {
            showToast(`"${fontName}" 已经在预览列表中`);
            return;
        }
        
        // 添加到预览数组
        previewedFonts.push({ family: fontFamily, name: fontName });
        
        // 更新预览界面
        updateFontPreviews();
        
        // 显示提示
        showToast(`已添加 "${fontName}" 到预览列表`);
    }
    
    // 更新预览界面
    function updateFontPreviews() {
        // 清空预览容器
        fontPreviewsContainer.innerHTML = '';
        
        // 如果没有预览项，显示空状态
        if (previewedFonts.length === 0) {
            fontPreviewsContainer.innerHTML = `
                <div class="empty-preview-msg">
                    <i class="ri-font-size-2"></i>
                    <p>从左侧选择字体添加到预览区</p>
                </div>
            `;
            return;
        }
        
        // 添加所有预览项
        previewedFonts.forEach((font, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.dataset.index = index;
            
            previewItem.innerHTML = `
                <div class="preview-header">
                    <div class="font-info">${font.name}</div>
                    <div class="preview-controls">
                        <button class="preview-control-btn remove-font" title="移除">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>
                <div class="preview-content" style="font-family: ${font.family};">
                    ${previewText.value || defaultText}
                </div>
            `;
            
            fontPreviewsContainer.appendChild(previewItem);
            
            // 移除按钮事件
            previewItem.querySelector('.remove-font').addEventListener('click', function() {
                removeFontPreview(index);
            });
        });
        
        // 应用当前样式
        updatePreviewStyles();
    }
    
    // 从预览列表中移除字体
    function removeFontPreview(index) {
        const fontName = previewedFonts[index].name;
        previewedFonts.splice(index, 1);
        updateFontPreviews();
        showToast(`已从预览列表中移除 "${fontName}"`);
    }
    
    // 清空所有预览
    function clearPreviews() {
        if (previewedFonts.length === 0) return;
        
        previewedFonts = [];
        updateFontPreviews();
        showToast('已清空所有预览');
    }
    
    // 更新预览内容
    function updatePreviewContents() {
        const text = previewText.value || defaultText;
        const previewContents = document.querySelectorAll('.preview-content');
        
        previewContents.forEach(content => {
            content.textContent = text;
        });
    }
    
    // 更新预览样式
    function updatePreviewStyles() {
        const fontSize = fontSizeInput.value + 'px';
        const fontWeight = fontWeightSelect.value;
        const textColor = textColorInput.value;
        const bgColor = bgColorInput.value;
        const letterSpacing = letterSpacingInput.value + 'px';
        const lineHeight = lineHeightInput.value;
        const textAlign = document.querySelector('.align-btn.active')?.dataset.align || 'left';
        const textTransform = textTransformSelect.value;
        
        const previewContents = document.querySelectorAll('.preview-content');
        
        previewContents.forEach(content => {
            content.style.fontSize = fontSize;
            content.style.fontWeight = fontWeight;
            content.style.color = textColor;
            content.style.backgroundColor = bgColor;
            content.style.letterSpacing = letterSpacing;
            content.style.lineHeight = lineHeight;
            content.style.textAlign = textAlign;
            content.style.textTransform = textTransform;
        });
    }
    
    // 字体对比
    function compareFonts() {
        if (previewedFonts.length < 2) {
            showToast('至少需要两种字体才能进行对比');
            return;
        }
        
        // 清空对比区域
        fontComparison.innerHTML = '';
        
        // 创建对比区域
        const text = previewText.value || defaultText;
        const fontSize = fontSizeInput.value + 'px';
        const fontWeight = fontWeightSelect.value;
        const textColor = textColorInput.value;
        const bgColor = bgColorInput.value;
        const letterSpacing = letterSpacingInput.value + 'px';
        const lineHeight = lineHeightInput.value;
        const textAlign = document.querySelector('.align-btn.active')?.dataset.align || 'left';
        const textTransform = textTransformSelect.value;
        
        // 添加对比类型
        const comparisonTypes = [
            { title: '常规文本', text: text },
            { title: '标题文本', text: 'ABCDEFabcdef 统一标题展示'},
            { title: '数字展示', text: '0123456789 (1984)'},
            { title: '符号与标点', text: ',.;:!?#@&%$+-*/=()<>[]{}' }
        ];
        
        comparisonTypes.forEach(type => {
            const comparisonRow = document.createElement('div');
            comparisonRow.className = 'comparison-row';
            
            comparisonRow.innerHTML = `
                <div class="comparison-title">${type.title}</div>
                <div class="comparison-fonts"></div>
            `;
            
            const comparisonFonts = comparisonRow.querySelector('.comparison-fonts');
            
            previewedFonts.forEach(font => {
                const fontItem = document.createElement('div');
                fontItem.className = 'comparison-font-item';
                
                fontItem.innerHTML = `
                    <div class="comparison-font-name">${font.name}</div>
                    <div style="
                        font-family: ${font.family};
                        font-size: ${fontSize};
                        font-weight: ${fontWeight};
                        color: ${textColor};
                        background-color: ${bgColor};
                        letter-spacing: ${letterSpacing};
                        line-height: ${lineHeight};
                        text-align: ${textAlign};
                        text-transform: ${textTransform};
                    ">${type.text}</div>
                `;
                
                comparisonFonts.appendChild(fontItem);
            });
            
            fontComparison.appendChild(comparisonRow);
        });
        
        // 滚动到对比区域
        fontComparison.scrollIntoView({ behavior: 'smooth' });
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
            toast.style.backgroundColor = 'rgba(74, 108, 247, 0.9)';
            toast.style.color = 'white';
            toast.style.padding = '10px 20px';
            toast.style.borderRadius = '5px';
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