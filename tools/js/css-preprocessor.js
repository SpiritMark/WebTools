document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const scssMode = document.getElementById('scss-mode');
    const lessMode = document.getElementById('less-mode');
    const inputLabel = document.getElementById('input-label');
    const preprocessorInput = document.getElementById('preprocessor-input');
    const cssOutput = document.getElementById('css-output');
    const lineNumbers = document.getElementById('line-numbers');
    const convertBtn = document.getElementById('convert-btn');
    const autoConvertCheckbox = document.getElementById('auto-convert-checkbox');
    const pasteBtn = document.getElementById('paste-btn');
    const clearInputBtn = document.getElementById('clear-input-btn');
    const beautifyCssBtn = document.getElementById('beautify-css-btn');
    const copyBtn = document.getElementById('copy-css-btn');
    const loadFileBtn = document.getElementById('load-file-btn');
    const fileInput = document.getElementById('file-input');
    const downloadBtn = document.getElementById('download-btn');
    const scssTemplateBtn = document.getElementById('scss-template-btn');
    const lessTemplateBtn = document.getElementById('less-template-btn');
    
    // 输出选项
    const outputStyle = document.getElementById('output-style');
    const sourceMap = document.getElementById('source-map');
    const includePath = document.getElementById('include-path');
    
    // 预览相关
    const previewFrame = document.getElementById('preview-frame');
    const previewHtml = document.getElementById('preview-html');
    const togglePreviewBtn = document.getElementById('toggle-preview-btn');
    
    // 标签切换
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // 当前模式
    let currentMode = 'scss'; // 'scss' 或 'less'
    let autoConvertEnabled = true;
    let processingTimer = null;
    
    // 初始化Sass.js
    if (typeof Sass !== 'undefined') {
        Sass.setWorkerUrl('https://cdn.jsdelivr.net/npm/sass.js@0.11.1/dist/sass.sync.min.js');
        const sass = new Sass();
        
        // 设置编译选项
        sass.options({
            style: Sass.style.expanded,
            indentedSyntax: false,
            indent: '  ',
            linefeed: '\n'
        });
    }
    
    // 初始化
    updateLineNumbers();
    initializePreview();
    
    // 事件监听器
    scssMode.addEventListener('click', () => switchMode('scss'));
    lessMode.addEventListener('click', () => switchMode('less'));
    convertBtn.addEventListener('click', convertToCSS);
    autoConvertCheckbox.addEventListener('change', toggleAutoConvert);
    pasteBtn.addEventListener('click', pasteFromClipboard);
    clearInputBtn.addEventListener('click', clearInput);
    beautifyCssBtn.addEventListener('click', beautifyCSS);
    copyBtn.addEventListener('click', copyCSS);
    loadFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', loadFromFile);
    downloadBtn.addEventListener('click', downloadCSS);
    scssTemplateBtn.addEventListener('click', loadScssTemplate);
    lessTemplateBtn.addEventListener('click', loadLessTemplate);
    togglePreviewBtn.addEventListener('click', togglePreview);
    
    // 监听输入变化以更新行号
    preprocessorInput.addEventListener('input', function() {
        updateLineNumbers();
        
        // 如果启用了自动转换，设置延迟转换
        if (autoConvertEnabled) {
            clearTimeout(processingTimer);
            processingTimer = setTimeout(convertToCSS, 800);
        }
    });
    
    preprocessorInput.addEventListener('scroll', syncScroll);
    
    // 监听HTML预览输入变化
    previewHtml.addEventListener('input', updatePreview);
    
    // Tab键处理
    preprocessorInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // 获取光标位置
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // 插入2个空格
            this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
            
            // 重新设置光标位置
            this.selectionStart = this.selectionEnd = start + 2;
            
            // 更新行号
            updateLineNumbers();
            
            // 自动转换
            if (autoConvertEnabled) {
                clearTimeout(processingTimer);
                processingTimer = setTimeout(convertToCSS, 800);
            }
        }
    });
    
    // 标签切换事件
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 更新标签激活状态
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 更新面板显示
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === targetTab + '-guide') {
                    pane.classList.add('active');
                }
            });
        });
    });
    
    /**
     * 切换模式（SCSS/LESS）
     */
    function switchMode(mode) {
        currentMode = mode;
        
        // 更新按钮状态
        if (mode === 'scss') {
            scssMode.classList.add('active');
            lessMode.classList.remove('active');
            inputLabel.textContent = 'SCSS代码';
            preprocessorInput.placeholder = '在此输入SCSS代码...';
            
            // 显示/隐藏特定选项
            document.querySelectorAll('.scss-option').forEach(el => el.style.display = 'block');
            document.querySelectorAll('.less-option').forEach(el => el.style.display = 'none');
        } else {
            scssMode.classList.remove('active');
            lessMode.classList.add('active');
            inputLabel.textContent = 'LESS代码';
            preprocessorInput.placeholder = '在此输入LESS代码...';
            
            // 显示/隐藏特定选项
            document.querySelectorAll('.scss-option').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.less-option').forEach(el => el.style.display = 'block');
        }
        
        // 如果有内容，自动转换
        if (preprocessorInput.value.trim() && autoConvertEnabled) {
            convertToCSS();
        }
    }
    
    /**
     * 将预处理器代码转换为CSS
     */
    function convertToCSS() {
        const inputCode = preprocessorInput.value.trim();
        
        if (!inputCode) {
            cssOutput.textContent = '';
            updatePreview('');
            return;
        }
        
        // 根据当前模式选择编译方法
        if (currentMode === 'scss') {
            compileScss(inputCode);
        } else {
            compileLess(inputCode);
        }
    }
    
    /**
     * 编译SCSS代码
     */
    function compileScss(code) {
        if (typeof Sass === 'undefined') {
            showNotification('SCSS编译器未加载', 'error');
            return;
        }
        
        // 创建Sass实例
        const sass = new Sass();
        
        // 设置编译选项
        const options = {
            style: outputStyle.value === 'compressed' ? Sass.style.compressed : Sass.style.expanded,
            indentedSyntax: false,
            indent: '  ',
            linefeed: '\n',
            sourceMapEmbed: sourceMap.checked,
            sourceMapContents: sourceMap.checked,
            includePaths: includePath.checked ? [''] : []
        };
        
        sass.options(options);
        
        // 编译SCSS
        sass.compile(code, result => {
            if (result.status === 0) {
                // 成功
                cssOutput.textContent = result.text;
                highlightCSS();
                updatePreview(result.text);
            } else {
                // 错误
                cssOutput.textContent = `编译错误: ${result.message}`;
                showNotification('SCSS编译错误: ' + result.message, 'error');
            }
        });
    }
    
    /**
     * 编译LESS代码
     */
    function compileLess(code) {
        if (typeof less === 'undefined') {
            showNotification('LESS编译器未加载', 'error');
            return;
        }
        
        // 设置LESS选项
        const options = {
            filename: 'input.less',
            compress: outputStyle.value === 'compressed',
            sourceMap: sourceMap.checked ? {} : false
        };
        
        // 编译LESS
        less.render(code, options)
            .then(result => {
                cssOutput.textContent = result.css;
                highlightCSS();
                updatePreview(result.css);
            })
            .catch(error => {
                cssOutput.textContent = `编译错误: ${error.message}`;
                showNotification('LESS编译错误: ' + error.message, 'error');
            });
    }
    
    /**
     * 美化CSS输出
     */
    function beautifyCSS() {
        const css = cssOutput.textContent;
        
        if (!css || css.includes('编译错误')) {
            showNotification('没有有效的CSS可美化', 'warning');
            return;
        }
        
        if (typeof css_beautify === 'undefined') {
            showNotification('CSS美化器未加载', 'error');
            return;
        }
        
        try {
            const beautified = css_beautify(css, {
                indent_size: 2,
                indent_char: ' ',
                max_preserve_newlines: 2,
                preserve_newlines: true,
                end_with_newline: true
            });
            
            cssOutput.textContent = beautified;
            highlightCSS();
            showNotification('CSS已美化', 'success');
        } catch (error) {
            showNotification('美化CSS时出错: ' + error.message, 'error');
        }
    }
    
    /**
     * 切换自动转换
     */
    function toggleAutoConvert() {
        autoConvertEnabled = autoConvertCheckbox.checked;
        
        if (autoConvertEnabled && preprocessorInput.value.trim()) {
            convertToCSS();
        }
    }
    
    /**
     * 更新行号
     */
    function updateLineNumbers() {
        const lines = preprocessorInput.value.split('\n');
        const lineCount = lines.length;
        
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `${i}<br>`;
        }
        
        lineNumbers.innerHTML = lineNumbersHTML;
    }
    
    /**
     * 同步滚动
     */
    function syncScroll() {
        lineNumbers.scrollTop = preprocessorInput.scrollTop;
    }
    
    /**
     * 高亮CSS输出
     */
    function highlightCSS() {
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(cssOutput);
        }
    }
    
    /**
     * 从剪贴板粘贴
     */
    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            preprocessorInput.value = text;
            updateLineNumbers();
            
            if (autoConvertEnabled) {
                convertToCSS();
            }
            
            showNotification('已从剪贴板粘贴代码', 'success');
        } catch (err) {
            showNotification('无法访问剪贴板，请手动粘贴', 'error');
        }
    }
    
    /**
     * 清空输入
     */
    function clearInput() {
        preprocessorInput.value = '';
        cssOutput.textContent = '';
        updateLineNumbers();
        updatePreview('');
        showNotification('已清空输入区域', 'info');
    }
    
    /**
     * 复制CSS
     */
    async function copyCSS() {
        const output = cssOutput.textContent;
        
        if (!output || output.includes('编译错误')) {
            showNotification('没有有效的CSS可复制', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(output);
            showNotification('CSS已复制到剪贴板', 'success');
        } catch (err) {
            showNotification('复制失败: ' + err.message, 'error');
        }
    }
    
    /**
     * 从文件加载
     */
    function loadFromFile(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        // 检查文件类型
        const validExtensions = {
            scss: ['.scss'],
            less: ['.less'],
            css: ['.css']
        };
        
        let fileType = '';
        let validFile = false;
        
        for (const type in validExtensions) {
            if (validExtensions[type].some(ext => file.name.toLowerCase().endsWith(ext))) {
                fileType = type;
                validFile = true;
                break;
            }
        }
        
        if (!validFile) {
            showNotification('请选择有效的 SCSS/LESS/CSS 文件', 'warning');
            fileInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preprocessorInput.value = e.target.result;
            updateLineNumbers();
            
            // 如果加载的是特定类型的文件，切换到对应模式
            if (fileType === 'scss') {
                switchMode('scss');
            } else if (fileType === 'less') {
                switchMode('less');
            }
            
            if (autoConvertEnabled) {
                convertToCSS();
            }
            
            showNotification(`已加载文件: ${file.name}`, 'success');
        };
        
        reader.onerror = function() {
            showNotification('读取文件时发生错误', 'error');
        };
        
        reader.readAsText(file);
        
        // 重置文件输入框，允许重复选择同一文件
        fileInput.value = '';
    }
    
    /**
     * 下载CSS
     */
    function downloadCSS() {
        const output = cssOutput.textContent;
        
        if (!output || output.includes('编译错误')) {
            showNotification('没有有效的CSS可下载', 'warning');
            return;
        }
        
        // 创建Blob对象
        const blob = new Blob([output], { type: 'text/css' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'style.css';
        
        // 添加到文档并触发点击
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        showNotification('CSS文件下载已开始', 'success');
    }
    
    /**
     * 加载SCSS示例
     */
    function loadScssTemplate() {
        const scssTemplate = `// 变量定义
$primary-color: #3498db;
$secondary-color: #2ecc71;
$text-color: #333;
$padding: 15px;
$border-radius: 4px;

// 混合器
@mixin box-shadow($x, $y, $blur, $color) {
  -webkit-box-shadow: $x $y $blur $color;
  -moz-box-shadow: $x $y $blur $color;
  box-shadow: $x $y $blur $color;
}

@mixin transition($property) {
  -webkit-transition: $property 0.3s ease;
  -moz-transition: $property 0.3s ease;
  transition: $property 0.3s ease;
}

// 基础样式
body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: $text-color;
  background-color: #f9f9f9;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: $padding;
}

// 嵌套规则
h1 {
  color: $primary-color;
  text-align: center;
  margin-bottom: 30px;
  
  &:hover {
    color: darken($primary-color, 10%);
  }
}

// 按钮样式
.button {
  display: inline-block;
  background-color: $primary-color;
  color: white;
  padding: $padding;
  border-radius: $border-radius;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
  @include box-shadow(0, 2px, 5px, rgba(0, 0, 0, 0.1));
  @include transition(all);
  
  &:hover {
    background-color: darken($primary-color, 10%);
    @include box-shadow(0, 3px, 7px, rgba(0, 0, 0, 0.2));
    transform: translateY(-2px);
  }
  
  // 扩展按钮变体
  &.secondary {
    background-color: $secondary-color;
    
    &:hover {
      background-color: darken($secondary-color, 10%);
    }
  }
}

// 段落样式
p {
  margin-bottom: 20px;
  font-size: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// 媒体查询
@media (max-width: 768px) {
  .container {
    padding: $padding / 2;
  }
  
  .button {
    display: block;
    width: 100%;
  }
}`;

        preprocessorInput.value = scssTemplate;
        updateLineNumbers();
        
        if (currentMode !== 'scss') {
            switchMode('scss');
        } else if (autoConvertEnabled) {
            convertToCSS();
        }
    }
    
    /**
     * 加载LESS示例
     */
    function loadLessTemplate() {
        const lessTemplate = `// 变量定义
@primary-color: #3498db;
@secondary-color: #2ecc71;
@text-color: #333;
@padding: 15px;
@border-radius: 4px;

// 混合器
.box-shadow(@x, @y, @blur, @color) {
  -webkit-box-shadow: @x @y @blur @color;
  -moz-box-shadow: @x @y @blur @color;
  box-shadow: @x @y @blur @color;
}

.transition(@property) {
  -webkit-transition: @property 0.3s ease;
  -moz-transition: @property 0.3s ease;
  transition: @property 0.3s ease;
}

// 基础样式
body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: @text-color;
  background-color: #f9f9f9;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: @padding;
}

// 嵌套规则
h1 {
  color: @primary-color;
  text-align: center;
  margin-bottom: 30px;
  
  &:hover {
    color: darken(@primary-color, 10%);
  }
}

// 按钮样式
.button {
  display: inline-block;
  background-color: @primary-color;
  color: white;
  padding: @padding;
  border-radius: @border-radius;
  text-align: center;
  text-decoration: none;
  font-weight: bold;
  .box-shadow(0, 2px, 5px, rgba(0, 0, 0, 0.1));
  .transition(all);
  
  &:hover {
    background-color: darken(@primary-color, 10%);
    .box-shadow(0, 3px, 7px, rgba(0, 0, 0, 0.2));
    transform: translateY(-2px);
  }
  
  // 扩展按钮变体
  &.secondary {
    background-color: @secondary-color;
    
    &:hover {
      background-color: darken(@secondary-color, 10%);
    }
  }
}

// 段落样式
p {
  margin-bottom: 20px;
  font-size: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// 媒体查询
@media (max-width: 768px) {
  .container {
    padding: @padding / 2;
  }
  
  .button {
    display: block;
    width: 100%;
  }
}`;

        preprocessorInput.value = lessTemplate;
        updateLineNumbers();
        
        if (currentMode !== 'less') {
            switchMode('less');
        } else if (autoConvertEnabled) {
            convertToCSS();
        }
    }
    
    /**
     * 初始化预览框架
     */
    function initializePreview() {
        if (!previewFrame) return;
        
        const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        frameDoc.open();
        frameDoc.write(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS预览</title>
    <style id="preview-style"></style>
</head>
<body>
    <div id="preview-content"></div>
</body>
</html>
        `);
        frameDoc.close();
        
        // 初始更新
        updatePreview('');
    }
    
    /**
     * 更新预览
     */
    function updatePreview(css = null) {
        if (!previewFrame) return;
        
        const frameDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        const styleEl = frameDoc.getElementById('preview-style');
        const contentEl = frameDoc.getElementById('preview-content');
        
        // 如果提供了CSS，更新样式
        if (css !== null) {
            styleEl.textContent = css || '';
        }
        
        // 更新HTML内容
        contentEl.innerHTML = previewHtml.value || '';
    }
    
    /**
     * 切换预览显示/隐藏
     */
    function togglePreview() {
        const previewContainer = document.querySelector('.preview-container');
        
        if (previewContainer.style.display === 'none') {
            previewContainer.style.display = 'flex';
            togglePreviewBtn.innerHTML = '<i class="ri-eye-off-line"></i> 隐藏';
        } else {
            previewContainer.style.display = 'none';
            togglePreviewBtn.innerHTML = '<i class="ri-eye-line"></i> 显示';
        }
    }
    
    /**
     * 显示通知
     */
    function showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // 创建新通知
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到文档
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动隐藏
        setTimeout(() => {
            notification.classList.remove('show');
            
            // 移除元素
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
}); 