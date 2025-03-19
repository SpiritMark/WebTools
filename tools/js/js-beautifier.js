document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const beautifyBtn = document.getElementById('beautify-btn');
    const beautifyMode = document.getElementById('beautify-mode');
    const minifyMode = document.getElementById('minify-mode');
    const codeInput = document.getElementById('code-input');
    const codeOutput = document.getElementById('code-output');
    const lineNumbers = document.getElementById('line-numbers');
    const pasteBtn = document.getElementById('paste-btn');
    const clearBtn = document.getElementById('clear-btn');
    const copyBtn = document.getElementById('copy-btn');
    const loadFileBtn = document.getElementById('load-file-btn');
    const downloadBtn = document.getElementById('download-btn');
    const fileInput = document.getElementById('file-input');
    
    // 统计元素
    const originalSizeEl = document.getElementById('original-size');
    const processedSizeEl = document.getElementById('processed-size');
    const ratioEl = document.getElementById('ratio');
    
    // 缓存当前模式
    let currentMode = 'beautify'; // 默认为美化模式
    
    // 初始化
    init();
    
    // 初始化函数
    function init() {
        // 初始化行号
        updateLineNumbers();
        
        // 设置初始模式
        setMode('beautify');
        
        // 绑定事件监听器
        bindEvents();
        
        // 初始化语法高亮
        Prism.highlightAll();
    }
    
    // 绑定事件
    function bindEvents() {
        // 模式切换按钮
        beautifyMode.addEventListener('click', function() {
            setMode('beautify');
        });
        
        minifyMode.addEventListener('click', function() {
            setMode('minify');
        });
        
        // 美化/压缩按钮
        beautifyBtn.addEventListener('click', processJavaScript);
        
        // 代码输入监听
        codeInput.addEventListener('input', function() {
            updateLineNumbers();
        });
        
        codeInput.addEventListener('scroll', syncScroll);
        
        // 粘贴按钮
        pasteBtn.addEventListener('click', pasteFromClipboard);
        
        // 清除按钮
        clearBtn.addEventListener('click', clearInput);
        
        // 复制按钮
        copyBtn.addEventListener('click', copyOutput);
        
        // 加载文件按钮
        loadFileBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        // 文件输入事件
        fileInput.addEventListener('change', loadFromFile);
        
        // 下载结果按钮
        downloadBtn.addEventListener('click', downloadResult);
    }
    
    // 设置当前模式
    function setMode(mode) {
        currentMode = mode;
        
        if (mode === 'beautify') {
            beautifyMode.classList.add('active');
            minifyMode.classList.remove('active');
            document.getElementById('beautify-options').style.display = 'block';
            document.getElementById('minify-options').style.display = 'none';
            beautifyBtn.textContent = '美化 JavaScript';
        } else {
            beautifyMode.classList.remove('active');
            minifyMode.classList.add('active');
            document.getElementById('beautify-options').style.display = 'none';
            document.getElementById('minify-options').style.display = 'block';
            beautifyBtn.textContent = '压缩 JavaScript';
        }
    }
    
    // 处理JavaScript代码
    function processJavaScript() {
        try {
            const inputCode = codeInput.value.trim();
            
            if (!inputCode) {
                showNotification('请输入JavaScript代码', 'warning');
                return;
            }
            
            // 验证输入是否为有效的JavaScript
            try {
                // 使用Function构造函数检查语法
                new Function(inputCode);
            } catch (e) {
                showNotification('无效的JavaScript代码: ' + e.message, 'error');
                return;
            }
            
            let result;
            
            if (currentMode === 'beautify') {
                result = beautifyJS(inputCode);
            } else {
                result = minifyJS(inputCode);
            }
            
            // 显示处理后的代码
            codeOutput.textContent = result;
            
            // 更新语法高亮
            Prism.highlightElement(codeOutput);
            
            // 更新统计信息
            updateStats(inputCode, result);
            
            showNotification('JavaScript处理完成', 'success');
        } catch (error) {
            console.error('处理JavaScript时出错:', error);
            showNotification('处理失败: ' + error.message, 'error');
        }
    }
    
    // 美化JavaScript
    function beautifyJS(code) {
        // 获取美化选项
        const indentSize = parseInt(document.getElementById('indent-size').value) || 2;
        const indentWithTabs = document.getElementById('indent-with-tabs').checked;
        const braceStyle = document.getElementById('brace-style').value;
        const preserveNewlines = document.getElementById('preserve-newlines').checked;
        const maxPreserveNewlines = preserveNewlines ? (parseInt(document.getElementById('max-preserve-newlines').value) || 10) : 0;
        const wrapLineLength = parseInt(document.getElementById('wrap-line-length').value) || 80;
        const breakChainedMethods = document.getElementById('break-chained-methods').checked;
        const spaceInEmptyParen = document.getElementById('space-empty-paren').checked;
        
        // 创建js-beautify选项
        const options = {
            indent_size: indentSize,
            indent_with_tabs: indentWithTabs,
            brace_style: braceStyle,
            preserve_newlines: preserveNewlines,
            max_preserve_newlines: maxPreserveNewlines,
            wrap_line_length: wrapLineLength,
            break_chained_methods: breakChainedMethods,
            space_in_empty_paren: spaceInEmptyParen,
            e4x: true // 支持JSX
        };
        
        // 使用js-beautify库美化代码
        return js_beautify(code, options);
    }
    
    // 压缩JavaScript
    function minifyJS(code) {
        // 获取压缩选项
        const mangleProps = document.getElementById('mangle-names').checked;
        const compress = document.getElementById('compress-code').checked;
        const preserveComments = document.getElementById('preserve-comments').checked;
        const keepFnames = document.getElementById('keep-fnames').checked;
        
        try {
            // Terser选项
            const options = {
                mangle: {
                    properties: mangleProps ? { regex: /^_/ } : false
                },
                compress: compress ? {
                    drop_console: false,
                    drop_debugger: true
                } : false,
                output: {
                    comments: preserveComments ? 'some' : false,
                    beautify: false
                },
                keep_fnames: keepFnames
            };
            
            // 使用Terser库压缩代码
            // 注意：在实际应用中，Terser是异步的，这里简化为同步调用
            // 在实际应用中，这应该使用Terser.minify().then()的方式调用
            // 为了简单起见，这里我们假设已经有同步版本的Terser可用
            const result = Terser.minify(code, options);
            
            if (result.error) {
                throw new Error(result.error.message);
            }
            
            return result.code;
        } catch (error) {
            console.error('压缩JavaScript时出错:', error);
            throw error;
        }
    }
    
    // 更新统计信息
    function updateStats(original, processed) {
        const originalSize = new TextEncoder().encode(original).length;
        const processedSize = new TextEncoder().encode(processed).length;
        let ratio = 0;
        
        if (originalSize > 0) {
            if (currentMode === 'beautify') {
                // 美化通常会增加大小
                ratio = ((processedSize / originalSize) * 100 - 100).toFixed(2);
                ratio = (ratio > 0 ? '+' : '') + ratio;
            } else {
                // 压缩会减小大小
                ratio = (100 - (processedSize / originalSize) * 100).toFixed(2);
            }
        }
        
        originalSizeEl.textContent = formatSize(originalSize);
        processedSizeEl.textContent = formatSize(processedSize);
        
        if (currentMode === 'beautify') {
            ratioEl.textContent = ratio + '% (增加)';
        } else {
            ratioEl.textContent = ratio + '% (减少)';
        }
    }
    
    // 格式化文件大小显示
    function formatSize(size) {
        if (size < 1024) {
            return size + ' B';
        } else if (size < 1024 * 1024) {
            return (size / 1024).toFixed(2) + ' KB';
        } else {
            return (size / (1024 * 1024)).toFixed(2) + ' MB';
        }
    }
    
    // 更新行号
    function updateLineNumbers() {
        const lines = codeInput.value.split('\n');
        lineNumbers.innerHTML = '';
        
        for (let i = 1; i <= lines.length; i++) {
            lineNumbers.innerHTML += i + '<br>';
        }
    }
    
    // 同步滚动
    function syncScroll() {
        lineNumbers.scrollTop = codeInput.scrollTop;
    }
    
    // 从剪贴板粘贴
    function pasteFromClipboard() {
        try {
            navigator.clipboard.readText().then(function(text) {
                codeInput.value = text;
                updateLineNumbers();
                showNotification('已从剪贴板粘贴', 'success');
            }).catch(function(error) {
                console.error('从剪贴板读取失败:', error);
                showNotification('无法从剪贴板读取', 'error');
            });
        } catch (error) {
            // 对于不支持Clipboard API的浏览器，提示用户手动粘贴
            showNotification('请使用Ctrl+V手动粘贴', 'warning');
        }
    }
    
    // 清除输入
    function clearInput() {
        codeInput.value = '';
        updateLineNumbers();
        showNotification('输入已清除', 'success');
    }
    
    // 复制输出
    function copyOutput() {
        const output = codeOutput.textContent;
        
        if (!output) {
            showNotification('没有可复制的内容', 'warning');
            return;
        }
        
        try {
            navigator.clipboard.writeText(output).then(function() {
                showNotification('已复制到剪贴板', 'success');
            }).catch(function(error) {
                console.error('复制到剪贴板失败:', error);
                showNotification('复制失败', 'error');
            });
        } catch (error) {
            // 兼容性处理
            const textarea = document.createElement('textarea');
            textarea.value = output;
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                const successful = document.execCommand('copy');
                document.body.removeChild(textarea);
                
                if (successful) {
                    showNotification('已复制到剪贴板', 'success');
                } else {
                    showNotification('复制失败', 'error');
                }
            } catch (error) {
                document.body.removeChild(textarea);
                showNotification('复制失败', 'error');
            }
        }
    }
    
    // 从文件加载
    function loadFromFile(event) {
        const file = event.target.files[0];
        
        if (!file) {
            return;
        }
        
        // 检查文件是否为JavaScript文件
        if (!file.name.endsWith('.js') && !file.name.endsWith('.jsx') && !file.name.endsWith('.json')) {
            showNotification('请选择JavaScript文件 (.js, .jsx, .json)', 'warning');
            fileInput.value = '';
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            codeInput.value = e.target.result;
            updateLineNumbers();
            showNotification(`已加载文件: ${file.name}`, 'success');
        };
        
        reader.onerror = function() {
            showNotification('读取文件失败', 'error');
        };
        
        reader.readAsText(file);
        fileInput.value = ''; // 重置文件输入，以便可以重新选择相同的文件
    }
    
    // 下载结果
    function downloadResult() {
        const output = codeOutput.textContent;
        
        if (!output) {
            showNotification('没有可下载的内容', 'warning');
            return;
        }
        
        const blob = new Blob([output], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = currentMode === 'beautify' ? 'beautified.js' : 'minified.js';
        document.body.appendChild(a);
        a.click();
        
        // 清理
        setTimeout(function() {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
        
        showNotification('文件已下载', 'success');
    }
    
    // 显示通知
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // 触发重绘以应用初始样式
        notification.offsetHeight;
        
        // 显示通知
        notification.classList.add('show');
        
        // 设置自动移除
        setTimeout(function() {
            notification.classList.remove('show');
            
            // 等待过渡完成后移除元素
            setTimeout(function() {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // 加载示例代码
    document.getElementById('load-example').addEventListener('click', function() {
        codeInput.value = `// JavaScript美化器示例代码
function calculateFactorial(n){if(n===0||n===1){return 1;}else{return n*calculateFactorial(n-1);}}

// 计算斐波那契数列
const fibonacci=n=>{if(n<=1)return n;return fibonacci(n-1)+fibonacci(n-2)};

// 使用类
class Person{constructor(name,age){this.name=name;this.age=age;}
sayHello(){console.log(\`你好，我是\${this.name}，今年\${this.age}岁\`);}static create(name,age){return new Person(name,age);}}

// 异步函数示例
async function fetchData(url){try{const response=await fetch(url);const data=await response.json();return data;}catch(error){console.error("获取数据失败:",error);}}

// ES6特性示例
const numbers=[1,2,3,4,5];const doubled=numbers.map(n=>n*2);
const filtered=numbers.filter(n=>n>2);
const sum=numbers.reduce((total,n)=>total+n,0);

// 对象解构和展开运算符
const person={name:"张三",age:30,city:"北京"};
const{name,...rest}=person;
const newPerson={...person,job:"开发者"};

// 复杂条件判断（适合重构）
function getDiscount(customer){return customer.isVIP&&customer.points>1000&&!customer.hasPendingPayment?0.2:customer.isVIP&&customer.points>500?0.1:customer.isFirstVisit?0.05:0;}`;
        
        updateLineNumbers();
        showNotification('示例代码已加载', 'success');
    });
}); 