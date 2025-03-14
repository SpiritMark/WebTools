document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const languageSelect = document.getElementById('language-select');
    const indentSize = document.getElementById('indent-size');
    const useTabs = document.getElementById('use-tabs');
    const lineWrap = document.getElementById('line-wrap');
    const preserveNewlines = document.getElementById('preserve-newlines');
    const braceStyle = document.getElementById('brace-style');
    
    const formatBtn = document.getElementById('format-btn');
    const clearInputBtn = document.getElementById('clear-input');
    const copyOutputBtn = document.getElementById('copy-output');
    const loadFileBtn = document.getElementById('load-file');
    const fileInput = document.getElementById('file-input');
    const downloadBtn = document.getElementById('download-btn');
    
    const codeInput = document.getElementById('code-input');
    const codeOutput = document.getElementById('code-output');
    
    // 初始显示/隐藏特定语言的选项
    updateLanguageSpecificOptions();
    
    // 设置事件监听
    languageSelect.addEventListener('change', updateLanguageSpecificOptions);
    formatBtn.addEventListener('click', formatCode);
    clearInputBtn.addEventListener('click', clearInput);
    copyOutputBtn.addEventListener('click', copyOutput);
    loadFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', loadFile);
    downloadBtn.addEventListener('click', downloadCode);
    
    // 添加行号功能
    function updateLineNumbers() {
        const codeInput = document.getElementById('code-input');
        const lineNumbers = document.getElementById('line-numbers');
        
        if (!codeInput || !lineNumbers) return;
        
        // 获取行数
        const lines = codeInput.value.split('\n');
        const lineCount = lines.length;
        
        // 生成行号HTML
        let lineNumbersHTML = '';
        for (let i = 1; i <= lineCount; i++) {
            lineNumbersHTML += `${i}<br>`;
        }
        
        // 更新行号
        lineNumbers.innerHTML = lineNumbersHTML;
        
        // 同步滚动
        lineNumbers.scrollTop = codeInput.scrollTop;
    }
    
    // 同步输入框和行号的滚动
    codeInput.addEventListener('scroll', function() {
        const lineNumbers = document.getElementById('line-numbers');
        if (lineNumbers) {
            lineNumbers.scrollTop = this.scrollTop;
        }
    });
    
    // 监听输入事件，更新行号
    codeInput.addEventListener('input', updateLineNumbers);
    codeInput.addEventListener('keydown', function(e) {
        // Tab键处理
        if (e.key === 'Tab') {
            e.preventDefault();
            
            // 获取光标位置
            const start = this.selectionStart;
            const end = this.selectionEnd;
            
            // 插入4个空格
            this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
            
            // 重新设置光标位置
            this.selectionStart = this.selectionEnd = start + 4;
            
            // 更新行号
            updateLineNumbers();
        }
    });
    
    // 添加粘贴按钮功能
    document.getElementById('paste-btn').addEventListener('click', async function() {
        try {
            const text = await navigator.clipboard.readText();
            codeInput.value = text;
            updateLineNumbers();
            showToast('已从剪贴板粘贴代码');
        } catch (err) {
            showToast('无法访问剪贴板，请手动粘贴');
        }
    });
    
    // 初始化行号
    updateLineNumbers();
    
    // 添加语言指示器到输出区域
    function updateLanguageIndicator() {
        const language = languageSelect.value;
        let languageIndicator = document.querySelector('.language-indicator');
        
        if (!languageIndicator) {
            languageIndicator = document.createElement('div');
            languageIndicator.className = 'language-indicator';
            document.querySelector('.code-output-container').appendChild(languageIndicator);
        }
        
        // 显示当前选中的语言
        const langNames = {
            javascript: 'JavaScript',
            html: 'HTML',
            css: 'CSS',
            json: 'JSON',
            xml: 'XML',
            sql: 'SQL',
            java: 'Java',
            python: 'Python',
            csharp: 'C#',
            cpp: 'C++',
            php: 'PHP',
            typescript: 'TypeScript'
        };
        
        languageIndicator.textContent = langNames[language] || language;
    }
    
    // 语言选择变化时更新指示器
    languageSelect.addEventListener('change', updateLanguageIndicator);
    
    // 初始化语言指示器
    updateLanguageIndicator();
    
    // 显示/隐藏特定语言的选项
    function updateLanguageSpecificOptions() {
        const language = languageSelect.value;
        
        // 显示或隐藏JavaScript特定选项
        document.querySelectorAll('.js-option').forEach(option => {
            option.style.display = ['javascript', 'typescript', 'json'].includes(language) ? 'block' : 'none';
        });
        
        // 显示或隐藏HTML特定选项
        document.querySelectorAll('.html-option').forEach(option => {
            option.style.display = ['html', 'xml'].includes(language) ? 'block' : 'none';
        });
        
        // 显示或隐藏CSS特定选项
        document.querySelectorAll('.css-option').forEach(option => {
            option.style.display = language === 'css' ? 'block' : 'none';
        });
    }
    
    // 格式化代码
    function formatCode() {
        const language = languageSelect.value;
        const code = codeInput.value;
        
        if (!code.trim()) {
            showToast('请输入需要格式化的代码');
            return;
        }
        
        try {
            // 格式化选项
            const options = {
                indent_size: parseInt(indentSize.value),
                indent_with_tabs: useTabs.checked,
                max_preserve_newlines: preserveNewlines.checked ? 2 : 0,
                preserve_newlines: preserveNewlines.checked,
                wrap_line_length: parseInt(lineWrap.value),
                end_with_newline: true
            };
            
            // JavaScript特定选项
            if (['javascript', 'typescript', 'json'].includes(language)) {
                options.brace_style = braceStyle.value;
                options.space_in_paren = true;
                options.space_in_empty_paren = false;
                options.jslint_happy = false;
                options.space_after_anon_function = true;
                options.keep_array_indentation = false;
                options.space_before_conditional = true;
                options.unescape_strings = false;
                options.e4x = false;
            }
            
            // HTML特定选项
            if (['html', 'xml'].includes(language)) {
                options.indent_inner_html = true;
                options.indent_handlebars = false;
                options.indent_scripts = 'keep';
                options.wrap_attributes = 'auto';
                options.wrap_attributes_indent_size = parseInt(indentSize.value);
                options.unformatted = ['code', 'pre'];
                options.content_unformatted = ['pre', 'code', 'textarea'];
                options.extra_liners = ['head', 'body', '/html'];
            }
            
            // 根据语言选择格式化器并设置特定选项
            let formatted = '';
            
            // JavaScript/JSON
            if (language === 'javascript' || language === 'typescript') {
                formatted = js_beautify(code, options);
            } 
            // JSON特殊处理
            else if (language === 'json') {
                try {
                    // 尝试解析并格式化JSON
                    const jsonObj = JSON.parse(code);
                    formatted = JSON.stringify(jsonObj, null, options.indent_with_tabs ? '\t' : options.indent_size);
                } catch (e) {
                    // 如果解析失败，使用普通JS格式化
                    formatted = js_beautify(code, options);
                }
            } 
            // HTML/XML
            else if (language === 'html' || language === 'xml') {
                formatted = html_beautify(code, options);
            } 
            // CSS
            else if (language === 'css') {
                formatted = css_beautify(code, options);
            } 
            // 其他语言的基本格式化
            else {
                formatted = js_beautify(code, options);
            }
            
            // 显示格式化后的代码
            codeOutput.textContent = formatted;
            
            // 代码高亮
            highlightCode();
            
            showToast('代码格式化完成');
        } catch (error) {
            console.error('格式化错误:', error);
            showToast('格式化代码时出错：' + error.message);
        }
    }
    
    // 优化代码高亮功能
    function highlightCode() {
        if (typeof hljs !== 'undefined') {
            const language = languageSelect.value;
            const codeBlock = document.getElementById('code-output');
            
            if (codeBlock) {
                // 先清除之前的高亮类
                codeBlock.className = 'code-output';
                
                // 应用新的语言类
                if (language) {
                    codeBlock.classList.add(`language-${language}`);
                }
                
                // 刷新高亮
                hljs.highlightElement(codeBlock);
                
                // 更新语言指示器
                updateLanguageIndicator();
            }
        }
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
    
    // 清空输入
    function clearInput() {
        codeInput.value = '';
        codeOutput.textContent = '';
        showToast('输入已清空');
    }
    
    // 复制格式化结果
    function copyOutput() {
        const outputText = codeOutput.textContent;
        if (!outputText) {
            showToast('没有可复制的内容');
            return;
        }
        
        navigator.clipboard.writeText(outputText)
            .then(() => showToast('已复制到剪贴板'))
            .catch(err => showToast('复制失败: ' + err.message));
    }
    
    // 从文件加载代码
    function loadFile(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 根据文件类型自动选择语言
        const fileExt = file.name.split('.').pop().toLowerCase();
        const extToLanguage = {
            js: 'javascript',
            ts: 'typescript',
            html: 'html',
            css: 'css',
            json: 'json',
            xml: 'xml',
            java: 'java',
            py: 'python',
            cs: 'csharp',
            cpp: 'cpp',
            php: 'php'
        };
        
        if (extToLanguage[fileExt]) {
            languageSelect.value = extToLanguage[fileExt];
            updateLanguageSpecificOptions();
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            codeInput.value = e.target.result;
            showToast(`文件 "${file.name}" 已加载`);
        };
        reader.onerror = function() {
            showToast('读取文件失败');
        };
        reader.readAsText(file);
    }
    
    // 下载格式化后的代码
    function downloadCode() {
        const code = codeOutput.textContent;
        if (!code) {
            showToast('没有可下载的内容');
            return;
        }
        
        const language = languageSelect.value;
        const extensions = {
            javascript: 'js',
            typescript: 'ts',
            html: 'html',
            css: 'css',
            json: 'json',
            xml: 'xml',
            java: 'java',
            python: 'py',
            csharp: 'cs',
            cpp: 'cpp',
            php: 'php'
        };
        
        const extension = extensions[language] || 'txt';
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `formatted_code.${extension}`;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
        
        showToast('文件已下载');
    }
    
    // 添加简单美化功能
    document.getElementById('prettify-btn').addEventListener('click', function() {
        const code = codeInput.value;
        if (!code.trim()) {
            showToast('请输入需要美化的代码');
            return;
        }
        
        try {
            // 根据语言选择美化方式
            const language = languageSelect.value;
            let prettified = '';
            
            if (['html', 'xml'].includes(language)) {
                // HTML简单美化 - 添加适当的缩进和换行
                prettified = prettifyHTML(code);
            } else if (language === 'json') {
                // JSON简单美化
                try {
                    const jsonObj = JSON.parse(code);
                    prettified = JSON.stringify(jsonObj, null, 2);
                } catch (e) {
                    throw new Error('JSON解析失败，请检查格式');
                }
            } else {
                // 其他语言简单美化 - 修复缩进和空格
                prettified = basicPrettify(code);
            }
            
            // 更新输入框内容
            codeInput.value = prettified;
            updateLineNumbers();
            showToast('代码已简单美化，可以继续格式化获得更好效果');
        } catch (error) {
            showToast('美化代码时出错：' + error.message);
        }
    });
    
    // HTML简单美化函数
    function prettifyHTML(html) {
        // 替换多余的空白
        let pretty = html.replace(/\s+</g, '<');
        pretty = pretty.replace(/>\s+</g, '>\n<');
        pretty = pretty.replace(/>\s+/g, '> ');
        
        // 添加基本缩进
        const lines = pretty.split('\n');
        let indent = 0;
        const indentSize = parseInt(document.getElementById('indent-size').value);
        const indentChar = document.getElementById('use-tabs').checked ? '\t' : ' '.repeat(indentSize);
        
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/<\/[^>]+>/) && !lines[i].match(/<[^/][^>]*>.*<\/[^>]+>/)) {
                // 关闭标签，减少缩进
                indent = Math.max(0, indent - 1);
            }
            
            if (indent > 0) {
                lines[i] = indentChar.repeat(indent) + lines[i];
            }
            
            if (lines[i].match(/<[^/][^>]*[^/]>/) && !lines[i].match(/<[^/][^>]*>.*<\/[^>]+>/) && !lines[i].match(/<(img|br|hr|input|link|meta|area|base|col|embed|keygen|param|source)/)) {
                // 开启标签，增加缩进
                indent++;
            }
        }
        
        return lines.join('\n');
    }
    
    // 基本代码美化
    function basicPrettify(code) {
        // 规范化空格和缩进
        return code
            .replace(/\r\n/g, '\n')
            .replace(/\t+/g, '\t')
            .replace(/  +/g, ' ')
            .replace(/\n\s+\n/g, '\n\n');
    }
}); 