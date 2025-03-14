// 预先定义全局变量和函数，确保它们在页面加载之前就存在
console.log('调试脚本加载中...');

// 确保全局变量存在
window.nextElementId = 1;

// 定义关键函数
window.deselectAllElements = function() {
    console.log('调试: 执行deselectAllElements');
    const canvas = document.getElementById('poster-canvas');
    if (!canvas) {
        console.warn('画布尚未加载');
        return;
    }
    
    const elements = canvas.querySelectorAll('.poster-element');
    elements.forEach(element => {
        element.classList.remove('selected');
        const handles = element.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
    });
    
    window.selectedElement = null;
};

// 在页面加载时添加更多调试信息
document.addEventListener('DOMContentLoaded', function() {
    console.log('调试: DOM已加载');
    
    // 检查主要元素是否存在
    checkDomElements();
    
    // 检查添加文本按钮
    setupTextButtonDebug();
    
    // 添加一个辅助按钮用于测试
    addTestButton();
});

// 检查关键DOM元素
function checkDomElements() {
    const canvas = document.getElementById('poster-canvas');
    console.log('画布元素:', canvas);
    
    const addHeadingBtn = document.getElementById('add-heading');
    console.log('添加标题按钮:', addHeadingBtn);
    
    const addSubheadingBtn = document.getElementById('add-subheading');
    console.log('添加副标题按钮:', addSubheadingBtn);
    
    const posterContainer = document.querySelector('.poster-tool-container');
    console.log('海报容器:', posterContainer);
}

// 为文本按钮添加调试事件监听
function setupTextButtonDebug() {
    const addHeadingBtn = document.getElementById('add-heading');
    if (addHeadingBtn) {
        addHeadingBtn.addEventListener('click', function() {
            console.log('调试: 添加标题按钮被点击');
            console.log('nextElementId 值:', window.nextElementId);
            console.log('deselectAllElements 函数:', typeof window.deselectAllElements);
        });
    }
}

// 添加测试按钮
function addTestButton() {
    const testBtn = document.createElement('button');
    testBtn.textContent = '测试添加文本';
    testBtn.style.position = 'fixed';
    testBtn.style.bottom = '20px';
    testBtn.style.right = '20px';
    testBtn.style.zIndex = '9999';
    testBtn.style.padding = '10px';
    testBtn.style.backgroundColor = '#f44336';
    testBtn.style.color = 'white';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '5px';
    testBtn.style.cursor = 'pointer';
    
    testBtn.onclick = function() {
        console.log('测试按钮被点击');
        try {
            // 手动创建文本元素
            const canvas = document.getElementById('poster-canvas');
            if (!canvas) {
                console.error('找不到画布元素');
                return;
            }
            
            const textElement = document.createElement('div');
            textElement.className = 'poster-element text-element heading-text';
            textElement.id = `element-${window.nextElementId++}`;
            textElement.textContent = '测试文本';
            textElement.contentEditable = true;
            
            // 设置样式
            textElement.style.position = 'absolute';
            textElement.style.left = '50%';
            textElement.style.top = '50%';
            textElement.style.transform = 'translate(-50%, -50%)';
            textElement.style.color = '#ff0000';
            textElement.style.fontSize = '32px';
            textElement.style.fontWeight = 'bold';
            
            // 添加到画布
            canvas.appendChild(textElement);
            console.log('测试文本已添加');
        } catch (error) {
            console.error('添加测试文本时出错:', error);
        }
    };
    
    document.body.appendChild(testBtn);
} 