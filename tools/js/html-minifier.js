document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const minifyModeBtn = document.getElementById('minify-mode');
    const beautifyModeBtn = document.getElementById('beautify-mode');
    const processBtn = document.getElementById('process-btn');
    const processBtnText = document.getElementById('process-btn-text');
    const htmlInput = document.getElementById('html-input');
    const htmlOutput = document.getElementById('html-output');
    const lineNumbers = document.getElementById('line-numbers');
    const pasteBtn = document.getElementById('paste-btn');
    const clearInputBtn = document.getElementById('clear-input-btn');
    const copyOutputBtn = document.getElementById('copy-output-btn');
    const loadFileBtn = document.getElementById('load-file-btn');
    const fileInput = document.getElementById('file-input');
    const downloadBtn = document.getElementById('download-btn');
    
    // 压缩选项
    const removeCommentsCheckbox = document.getElementById('remove-comments');
    const removeTagWhitespaceCheckbox = document.getElementById('remove-tag-whitespace');
    const collapseWhitespaceCheckbox = document.getElementById('collapse-whitespace');
    const collapseBooleanAttributesCheckbox = document.getElementById('collapse-boolean-attributes');
    const removeRedundantAttributesCheckbox = document.getElementById('remove-redundant-attributes');
    const removeEmptyAttributesCheckbox = document.getElementById('remove-empty-attributes');
    const removeOptionalTagsCheckbox = document.getElementById('remove-optional-tags');
    const minifyCssCheckbox = document.getElementById('minify-css');
    const minifyJsCheckbox = document.getElementById('minify-js');
    
    // 美化选项
    const indentSizeSelect = document.getElementById('indent-size');
    const useTabsCheckbox = document.getElementById('use-tabs');
    const maxLineLengthSelect = document.getElementById('max-line-length');
    const wrapAttributesCheckbox = document.getElementById('wrap-attributes');
    const preserveNewlinesCheckbox = document.getElementById('preserve-newlines');
    
    // 统计显示
    const originalSizeElem = document.getElementById('original-size');
    const resultSizeElem = document.getElementById('result-size');
    const compressionRatioElem = document.getElementById('compression-ratio');
    
    // 美化选项面板
    const beautifyOptionsPanel = document.querySelector('.beautify-options');
    
    // 当前模式
    let currentMode = 'minify'; // 'minify' 或 'beautify'
    
    // 初始化行号
    updateLineNumbers();
    
    // 事件监听器
    minifyModeBtn.addEventListener('click', () => switchMode('minify'));
    beautifyModeBtn.addEventListener('click', () => switchMode('beautify'));
    processBtn.addEventListener('click', processHtml);
    pasteBtn.addEventListener('click', pasteFromClipboard);
    clearInputBtn.addEventListener('click', clearInput);
    copyOutputBtn.addEventListener('click', copyOutput);
    loadFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', loadFromFile);
    downloadBtn.addEventListener('click', downloadResult);
    
    // 监听输入变化以更新行号
    htmlInput.addEventListener('input', updateLineNumbers);
    htmlInput.addEventListener('scroll', syncScroll);
    
    // Tab键处理
    htmlInput.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // 获取光标位置
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // 插入制表符或空格
            const indentSize = parseInt(indentSizeSelect.value);
            const indent = useTabsCheckbox.checked ? '\t' : ' '.repeat(indentSize);
            
            // 插入缩进
            this.value = this.value.substring(0, start) + indent + this.value.substring(end);
            
            // 重新设置光标位置
            this.selectionStart = this.selectionEnd = start + indent.length;
            
            // 更新行号
            updateLineNumbers();
        }
    });
    
    /**
     * 切换模式（压缩/美化）
     */
    function switchMode(mode) {
        currentMode = mode;
        
        // 更新按钮状态
        if (mode === 'minify') {
            minifyModeBtn.classList.add('active');
            beautifyModeBtn.classList.remove('active');
            processBtnText.textContent = '压缩HTML';
            beautifyOptionsPanel.style.display = 'none';
        } else {
            minifyModeBtn.classList.remove('active');
            beautifyModeBtn.classList.add('active');
            processBtnText.textContent = '美化HTML';
            beautifyOptionsPanel.style.display = 'block';
        }
    }
    
    /**
     * 处理HTML（压缩或美化）
     */
    function processHtml() {
        const html = htmlInput.value.trim();
        
        if (!html) {
            showNotification('请输入HTML代码', 'warning');
            return;
        }
        
        try {
            let result;
            
            if (currentMode === 'minify') {
                result = minifyHtml(html);
            } else {
                result = beautifyHtml(html);
            }
            
            // 显示结果
            htmlOutput.textContent = result;
            highlightOutput();
            
            // 更新统计
            updateStats(html, result);
            
            showNotification(
                currentMode === 'minify' ? 'HTML压缩成功' : 'HTML美化成功', 
                'success'
            );
        } catch (error) {
            console.error('处理HTML时出错:', error);
            showNotification('处理HTML时出错: ' + error.message, 'error');
        }
    }
    
    /**
     * 压缩HTML
     */
    function minifyHtml(html) {
        if (typeof HTMLMinifier === 'undefined') {
            throw new Error('HTML压缩库未加载');
        }
        
        // 构建压缩选项
        const options = {
            removeComments: removeCommentsCheckbox.checked,
            collapseWhitespace: collapseWhitespaceCheckbox.checked,
            conservativeCollapse: false,
            collapseInlineTagWhitespace: removeTagWhitespaceCheckbox.checked,
            collapseBooleanAttributes: collapseBooleanAttributesCheckbox.checked,
            removeRedundantAttributes: removeRedundantAttributesCheckbox.checked,
            removeEmptyAttributes: removeEmptyAttributesCheckbox.checked,
            removeOptionalTags: removeOptionalTagsCheckbox.checked,
            minifyCSS: minifyCssCheckbox.checked,
            minifyJS: minifyJsCheckbox.checked,
            removeAttributeQuotes: false,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            sortAttributes: true,
            sortClassName: true,
            useShortDoctype: true,
            keepClosingSlash: false,
            caseSensitive: false
        };
        
        return HTMLMinifier.minify(html, options);
    }
    
    /**
     * 美化HTML
     */
    function beautifyHtml(html) {
        if (typeof html_beautify === 'undefined') {
            throw new Error('HTML美化库未加载');
        }
        
        // 构建美化选项
        const options = {
            indent_size: parseInt(indentSizeSelect.value),
            indent_with_tabs: useTabsCheckbox.checked,
            wrap_line_length: parseInt(maxLineLengthSelect.value),
            wrap_attributes: wrapAttributesCheckbox.checked ? 'force-aligned' : 'auto',
            preserve_newlines: preserveNewlinesCheckbox.checked,
            max_preserve_newlines: preserveNewlinesCheckbox.checked ? 2 : 0,
            end_with_newline: true,
            indent_inner_html: true,
            indent_scripts: 'keep',
            unformatted: ['pre', 'code'],
            content_unformatted: ['pre', 'code', 'textarea'],
            extra_liners: ['head', 'body', '/html']
        };
        
        return html_beautify(html, options);
    }
    
    /**
     * 更新统计信息
     */
    function updateStats(originalHtml, resultHtml) {
        // 计算原始大小
        const originalSize = new Blob([originalHtml]).size;
        const resultSize = new Blob([resultHtml]).size;
        
        // 计算压缩比率
        const ratio = originalSize > 0 
            ? Math.round((1 - resultSize / originalSize) * 100) 
            : 0;
        
        // 更新显示
        originalSizeElem.textContent = formatSize(originalSize);
        resultSizeElem.textContent = formatSize(resultSize);
        
        // 更新压缩率，根据模式调整显示文本
        let ratioText;
        if (currentMode === 'minify') {
            ratioText = ratio > 0 ? `减小了 ${ratio}%` : `增加了 ${Math.abs(ratio)}%`;
        } else {
            ratioText = ratio < 0 ? `增加了 ${Math.abs(ratio)}%` : `减小了 ${ratio}%`;
        }
        compressionRatioElem.textContent = ratioText;
    }
    
    /**
     * 格式化大小显示
     */
    function formatSize(bytes) {
        if (bytes < 1024) {
            return bytes + ' 字节';
        } else if (bytes < 1024 * 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        } else {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
    
    /**
     * 更新行号
     */
    function updateLineNumbers() {
        const lines = htmlInput.value.split('\n');
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
        lineNumbers.scrollTop = htmlInput.scrollTop;
    }
    
    /**
     * 高亮显示输出
     */
    function highlightOutput() {
        if (typeof hljs !== 'undefined') {
            hljs.highlightElement(htmlOutput);
        }
    }
    
    /**
     * 从剪贴板粘贴
     */
    async function pasteFromClipboard() {
        try {
            const text = await navigator.clipboard.readText();
            htmlInput.value = text;
            updateLineNumbers();
            showNotification('已从剪贴板粘贴代码', 'success');
        } catch (err) {
            showNotification('无法访问剪贴板，请手动粘贴', 'error');
        }
    }
    
    /**
     * 清空输入
     */
    function clearInput() {
        htmlInput.value = '';
        htmlOutput.textContent = '';
        updateLineNumbers();
        
        // 重置统计
        originalSizeElem.textContent = '0 字节';
        resultSizeElem.textContent = '0 字节';
        compressionRatioElem.textContent = '0%';
        
        showNotification('已清空输入区域', 'info');
    }
    
    /**
     * 复制输出
     */
    async function copyOutput() {
        const output = htmlOutput.textContent;
        
        if (!output) {
            showNotification('没有可复制的内容', 'warning');
            return;
        }
        
        try {
            await navigator.clipboard.writeText(output);
            showNotification('已复制到剪贴板', 'success');
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
        
        if (!file.type.match('text/html') && !file.name.match(/\.(html|htm)$/i)) {
            showNotification('请选择HTML文件', 'warning');
            fileInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            htmlInput.value = e.target.result;
            updateLineNumbers();
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
     * 下载结果
     */
    function downloadResult() {
        const output = htmlOutput.textContent;
        
        if (!output) {
            showNotification('没有可下载的内容', 'warning');
            return;
        }
        
        // 创建Blob对象
        const blob = new Blob([output], { type: 'text/html' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentMode === 'minify' ? 'minified.html' : 'beautified.html';
        
        // 添加到文档并触发点击
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        showNotification('文件下载已开始', 'success');
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