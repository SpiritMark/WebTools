console.log('调试脚本加载中...');
console.log('当前页面路径:', window.location.pathname);

// 确保这些全局变量在整个应用程序中可用
window.nextElementId = window.nextElementId || 1;
window.selectedElement = null;
window.isResizing = false;
window.startX = 0;
window.startY = 0;
window.startWidth = 0;
window.startHeight = 0;
window.startLeft = 0;
window.startTop = 0;

// 定义全局函数
window.deselectAllElements = function() {
    console.log('执行取消选择所有元素函数');
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('找不到画布元素!');
        return;
    }
    
    // 移除所有已选择的元素
    const selectedElements = canvas.querySelectorAll('.selected');
    console.log(`找到 ${selectedElements.length} 个已选择的元素`);
    
    selectedElements.forEach(element => {
        element.classList.remove('selected');
        
        // 移除调整大小的手柄
        const handles = element.querySelectorAll('.resize-handle');
        handles.forEach(handle => handle.remove());
    });
    
    window.selectedElement = null;
};

// 添加文本元素函数
window.addTextElement = function(type) {
    console.log(`尝试添加文本元素，类型: ${type}`);
    const canvas = document.getElementById('canvas');
    if (!canvas) {
        console.error('找不到画布元素!');
        return;
    }
    
    // 清除"空画布"消息
    const emptyMessage = document.getElementById('empty-canvas-message');
    if (emptyMessage) {
        emptyMessage.style.display = 'none';
    }
    
    // 创建新的文本元素
    const element = document.createElement('div');
    element.className = 'canvas-element text-element';
    element.id = `element-${window.nextElementId++}`;
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

// 选择元素函数
window.selectElement = function(element) {
    console.log(`选择元素: ${element.id}`);
    
    // 取消选择其他元素
    window.deselectAllElements();
    
    // 选择当前元素
    element.classList.add('selected');
    window.selectedElement = element;
    
    // 添加调整大小的手柄
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    handles.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `resize-handle resize-${position}`;
        handle.dataset.position = position;
        element.appendChild(handle);
    });
};

// 监听DOM加载完成事件
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM已加载完成');
    
    // 检查关键DOM元素
    checkDomElements();
    
    // 检查脚本路径
    checkScriptPaths();
    
    // 设置按钮调试
    setupButtonDebug();
    
    // 添加测试按钮
    addTestButton();
    
    console.log('调试脚本初始化完成');
});

// 检查DOM元素是否存在
function checkDomElements() {
    console.log('检查关键DOM元素...');
    
    const canvas = document.getElementById('canvas');
    console.log('画布元素:', canvas ? '存在' : '不存在');
    
    const addHeadingBtn = document.querySelector('.add-text-btn[data-type="heading"]');
    console.log('添加标题按钮:', addHeadingBtn ? '存在' : '不存在');
    
    const addSubheadingBtn = document.querySelector('.add-text-btn[data-type="subheading"]');
    console.log('添加副标题按钮:', addSubheadingBtn ? '存在' : '不存在');
    
    const emptyMessage = document.getElementById('empty-canvas-message');
    console.log('空画布消息:', emptyMessage ? '存在' : '不存在');
}

// 检查脚本路径
function checkScriptPaths() {
    console.log('检查脚本路径...');
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach((script, index) => {
        console.log(`脚本 ${index+1}:`, script.src || '内联脚本');
    });
}

// 设置按钮调试
function setupButtonDebug() {
    console.log('设置按钮调试...');
    
    // 为添加标题按钮添加点击事件监听器
    const addHeadingBtn = document.querySelector('.add-text-btn[data-type="heading"]');
    if (addHeadingBtn) {
        addHeadingBtn.addEventListener('click', function() {
            console.log('点击了添加标题按钮');
            try {
                window.addTextElement('heading');
            } catch(e) {
                console.error('添加标题失败:', e);
            }
        });
    }
    
    // 为添加副标题按钮添加点击事件监听器
    const addSubheadingBtn = document.querySelector('.add-text-btn[data-type="subheading"]');
    if (addSubheadingBtn) {
        addSubheadingBtn.addEventListener('click', function() {
            console.log('点击了添加副标题按钮');
            try {
                window.addTextElement('subheading');
            } catch(e) {
                console.error('添加副标题失败:', e);
            }
        });
    }
}

// 添加测试按钮
function addTestButton() {
    console.log('添加测试按钮...');
    
    const testBtn = document.createElement('button');
    testBtn.id = 'test-add-text';
    testBtn.textContent = '测试添加文本';
    testBtn.style.position = 'fixed';
    testBtn.style.top = '10px';
    testBtn.style.right = '10px';
    testBtn.style.zIndex = '9999';
    testBtn.style.padding = '10px';
    testBtn.style.backgroundColor = 'red';
    testBtn.style.color = 'white';
    testBtn.style.border = 'none';
    testBtn.style.borderRadius = '5px';
    testBtn.style.cursor = 'pointer';
    
    testBtn.addEventListener('click', function() {
        console.log('点击了测试按钮');
        try {
            window.addTextElement('heading');
        } catch(e) {
            console.error('测试添加文本失败:', e);
        }
    });
    
    document.body.appendChild(testBtn);
}

// 添加路径测试函数
window.testPath = function(path) {
    console.log(`测试路径: ${path}`);
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = path;
        
        script.onload = function() {
            console.log(`路径 ${path} 加载成功!`);
            resolve(true);
        };
        
        script.onerror = function() {
            console.error(`路径 ${path} 加载失败!`);
            resolve(false);
        };
        
        document.head.appendChild(script);
        setTimeout(() => {
            document.head.removeChild(script);
        }, 500);
    });
};

console.log('调试脚本加载完成'); 