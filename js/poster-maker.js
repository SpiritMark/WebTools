// 海报生成器 - 主要脚本文件

// 确保全局变量在任何情况下都存在
if (typeof window.nextElementId === 'undefined') {
    window.nextElementId = 1;
}

// 全局变量，用于存储应用状态
var nextElementId = window.nextElementId;
var canvas, emptyMessage, selectedElement, isDragging = false, isResizing = false;
var startX, startY, startWidth, startHeight, startLeft, startTop;
var resizeHandle = '';
var sizePreset, customSizeInputs, widthInput, heightInput;
var bgColorPanel, bgGradientPanel, bgImagePanel, bgColorInput;
var gradientColor1, gradientColor2, gradientDirection;
var bgImageUpload, bgImageFit;
var currentTemplate = 'social-media';
var currentBgType = 'color';

// 确保关键函数在全局范围内可用
window.deselectAllElements = function() {
    console.log('执行取消选择所有元素');
    if (!canvas) {
        console.error('画布元素未初始化');
        canvas = document.getElementById('canvas');
        if (!canvas) return;
    }
    
    const selectedElements = canvas.querySelectorAll('.selected');
    selectedElements.forEach(element => {
        element.classList.remove('selected');
        
        // 移除调整大小的手柄
        const handles = element.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
    });
    
    selectedElement = null;
};

window.addTextElement = function(type) {
    console.log(`添加文本元素: ${type}`);
    if (!canvas) {
        console.error('画布元素未初始化');
        canvas = document.getElementById('canvas');
        if (!canvas) return;
    }
    
    // 隐藏空画布消息
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
    
    // 创建文本元素
    const element = document.createElement('div');
    element.className = 'canvas-element text-element';
    element.id = `element-${nextElementId++}`;
    element.setAttribute('contenteditable', 'true');
    
    // 根据类型设置不同的样式和内容
    if (type === 'heading') {
        element.textContent = '标题文本';
        element.style.fontSize = '32px';
        element.style.fontWeight = 'bold';
    } else if (type === 'subheading') {
        element.textContent = '副标题文本';
        element.style.fontSize = '24px';
    } else {
        element.textContent = '正文文本';
        element.style.fontSize = '16px';
    }
    
    // 设置元素的默认位置和样式
    element.style.position = 'absolute';
    element.style.left = '50px';
    element.style.top = '50px';
    element.style.color = '#000000';
    element.style.fontFamily = 'Arial, sans-serif';
    
    // 添加到画布中
    canvas.appendChild(element);
    console.log(`已添加文本元素: ${element.id}`);
    
    // 选择新添加的元素
    window.selectElement(element);
    
    return element;
};

window.selectElement = function(element) {
    console.log(`选择元素: ${element.id}`);
    
    // 取消选择其他元素
    window.deselectAllElements();
    
    // 选择当前元素
    element.classList.add('selected');
    selectedElement = element;
    
    // 添加调整大小的手柄
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${position}`;
        handle.dataset.position = position;
        element.appendChild(handle);
    });
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('海报生成器初始化中...');
    
    // 初始化UI元素引用
    canvas = document.getElementById('canvas');
    emptyMessage = document.getElementById('empty-canvas-message');
    
    // 初始化尺寸设置
    sizePreset = document.getElementById('size-preset');
    customSizeInputs = document.getElementById('custom-size-inputs');
    widthInput = document.getElementById('width-input');
    heightInput = document.getElementById('height-input');
    
    // 初始化背景设置面板
    bgColorPanel = document.getElementById('bg-color-panel');
    bgGradientPanel = document.getElementById('bg-gradient-panel');
    bgImagePanel = document.getElementById('bg-image-panel');
    bgColorInput = document.getElementById('bg-color-input');
    gradientColor1 = document.getElementById('gradient-color1');
    gradientColor2 = document.getElementById('gradient-color2');
    gradientDirection = document.getElementById('gradient-direction');
    bgImageUpload = document.getElementById('bg-image-upload');
    bgImageFit = document.getElementById('bg-image-fit');
    
    // 设置初始画布尺寸
    if (canvas) {
        canvas.style.width = '800px';
        canvas.style.height = '600px';
        console.log('画布初始化完成');
    } else {
        console.error('找不到画布元素!');
    }
    
    // 设置事件监听器
    setupEventListeners();
    
    console.log('海报生成器初始化完成');
});

// 设置事件监听器
function setupEventListeners() {
    console.log('设置事件监听器');
    
    // 添加文本按钮事件
    const addTextButtons = document.querySelectorAll('.add-text-btn');
    addTextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const textType = this.getAttribute('data-type');
            window.addTextElement(textType);
        });
    });
    
    // 下载海报按钮事件
    const downloadBtn = document.getElementById('download-poster');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadPoster);
    }
    
    // 模板选择事件
    const templateButtons = document.querySelectorAll('.template-btn');
    templateButtons.forEach(button => {
        button.addEventListener('click', function() {
            const template = this.getAttribute('data-template');
            applyTemplate(template);
        });
    });
    
    // 尺寸预设事件
    if (sizePreset) {
        sizePreset.addEventListener('change', function() {
            if (this.value === 'custom') {
                customSizeInputs.style.display = 'flex';
            } else {
                customSizeInputs.style.display = 'none';
                applyPresetSize(this.value);
            }
        });
    }
    
    // 背景类型选择事件
    const bgTypeInputs = document.querySelectorAll('input[name="bg-type"]');
    bgTypeInputs.forEach(input => {
        input.addEventListener('change', function() {
            switchBackgroundPanel(this.value);
        });
    });
    
    // 背景颜色变更事件
    if (bgColorInput) {
        bgColorInput.addEventListener('input', function() {
            applyBackgroundColor(this.value);
        });
    }
    
    // 画布点击事件 - 取消选择元素
    if (canvas) {
        canvas.addEventListener('click', function(e) {
            if (e.target === canvas) {
                window.deselectAllElements();
            }
        });
    }
    
    console.log('事件监听器设置完成');
}

// 应用模板
function applyTemplate(template) {
    console.log(`应用模板: ${template}`);
    currentTemplate = template;
    
    // 根据模板设置预定义的尺寸和样式
    switch(template) {
        case 'social-media':
            applyPresetSize('facebook-post');
            applyBackgroundColor('#f0f2f5');
            break;
        case 'ad':
            applyPresetSize('banner-ad');
            applyBackgroundColor('#ffffff');
            break;
        case 'event':
            applyPresetSize('a4');
            applyBackgroundColor('#f9f9f9');
            break;
        default:
            break;
    }
}

// 应用预设尺寸
function applyPresetSize(preset) {
    console.log(`应用预设尺寸: ${preset}`);
    if (!canvas) return;
    
    let width, height;
    
    switch(preset) {
        case 'facebook-post':
            width = 1200;
            height = 630;
            break;
        case 'instagram-post':
            width = 1080;
            height = 1080;
            break;
        case 'twitter-post':
            width = 1200;
            height = 675;
            break;
        case 'linkedin-post':
            width = 1200;
            height = 627;
            break;
        case 'banner-ad':
            width = 728;
            height = 90;
            break;
        case 'a4':
            width = 794;
            height = 1123;
            break;
        default:
            width = 800;
            height = 600;
    }
    
    // 更新画布尺寸
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    
    if (widthInput) widthInput.value = width;
    if (heightInput) heightInput.value = height;
}

// 切换背景面板
function switchBackgroundPanel(type) {
    console.log(`切换背景面板: ${type}`);
    currentBgType = type;
    
    // 隐藏所有面板
    bgColorPanel.style.display = 'none';
    bgGradientPanel.style.display = 'none';
    bgImagePanel.style.display = 'none';
    
    // 显示选中的面板
    switch(type) {
        case 'color':
            bgColorPanel.style.display = 'block';
            break;
        case 'gradient':
            bgGradientPanel.style.display = 'block';
            break;
        case 'image':
            bgImagePanel.style.display = 'block';
            break;
    }
}

// 应用背景颜色
function applyBackgroundColor(color) {
    console.log(`应用背景颜色: ${color}`);
    if (!canvas) return;
    
    canvas.style.background = color;
}

// 应用渐变背景
function applyGradient() {
    if (!canvas || !gradientColor1 || !gradientColor2 || !gradientDirection) return;
    
    const color1 = gradientColor1.value;
    const color2 = gradientColor2.value;
    const direction = gradientDirection.value;
    
    let gradient;
    switch(direction) {
        case 'to-right':
            gradient = `linear-gradient(to right, ${color1}, ${color2})`;
            break;
        case 'to-bottom':
            gradient = `linear-gradient(to bottom, ${color1}, ${color2})`;
            break;
        case 'to-bottom-right':
            gradient = `linear-gradient(to bottom right, ${color1}, ${color2})`;
            break;
        case 'to-bottom-left':
            gradient = `linear-gradient(to bottom left, ${color1}, ${color2})`;
            break;
        default:
            gradient = `linear-gradient(to right, ${color1}, ${color2})`;
    }
    
    canvas.style.background = gradient;
}

// 下载海报
function downloadPoster() {
    console.log('开始下载海报');
    if (!canvas) {
        console.error('找不到画布元素!');
        return;
    }
    
    // 暂时隐藏resize手柄
    const handles = canvas.querySelectorAll('.resize-handle');
    handles.forEach(handle => {
        handle.style.display = 'none';
    });
    
    // 取消选中状态
    const selectedElements = canvas.querySelectorAll('.selected');
    selectedElements.forEach(element => {
        element.classList.remove('selected');
    });
    
    // 使用html2canvas捕获画布
    html2canvas(canvas, {
        allowTaint: true,
        useCORS: true,
        scale: 2
    }).then(function(canvas) {
        // 恢复resize手柄显示
        handles.forEach(handle => {
            handle.style.display = 'block';
        });
        
        // 获取下载格式和质量
        const format = document.getElementById('download-format').value;
        const quality = parseFloat(document.getElementById('download-quality').value);
        
        // 将画布转换为图片数据URL
        let imageData;
        if (format === 'png') {
            imageData = canvas.toDataURL('image/png');
        } else {
            imageData = canvas.toDataURL('image/jpeg', quality);
        }
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `poster.${format}`;
        link.href = imageData;
        link.click();
        
        console.log('海报下载完成');
    }).catch(function(error) {
        console.error('下载海报时出错:', error);
        
        // 恢复resize手柄显示
        handles.forEach(handle => {
            handle.style.display = 'block';
        });
    });
} 