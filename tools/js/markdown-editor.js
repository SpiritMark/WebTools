document.addEventListener('DOMContentLoaded', function() {
    // DOM元素引用
    const markdownInput = document.getElementById('markdown-input');
    const markdownPreview = document.getElementById('markdown-preview');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');
    const autoSaveCheckbox = document.getElementById('auto-save');
    const newDocumentBtn = document.getElementById('new-document');
    const saveDocumentBtn = document.getElementById('save-document');
    const exportHtmlBtn = document.getElementById('export-html');
    const exportPdfBtn = document.getElementById('export-pdf');
    const exportMdBtn = document.getElementById('export-md');
    const documentList = document.getElementById('document-list');
    const clearStorageBtn = document.getElementById('clear-storage');
    const fullscreenEditBtn = document.getElementById('fullscreen-edit');
    const fullscreenPreviewBtn = document.getElementById('fullscreen-preview');
    
    // 格式工具栏按钮
    const formatButtons = document.querySelectorAll('.md-btn');
    
    // 确保Marked正确初始化
    if (typeof marked === 'undefined') {
        console.error('Marked库未正确加载，预览功能将不可用');
        showToast('预览功能加载失败，请刷新页面重试');
        return;
    }
    
    // Marked.js配置
    marked.setOptions({
        renderer: new marked.Renderer(),
        highlight: function(code, lang) {
            if (typeof hljs !== 'undefined') {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            }
            return code;
        },
        langPrefix: 'hljs language-', // highlight.js css类前缀
        pedantic: false,
        gfm: true,
        breaks: true, // 改为true，支持回车换行
        sanitize: false,
        smartLists: true,
        smartypants: false,
        xhtml: false
    });
    
    // 当前编辑的文档
    let currentDocument = {
        id: null,
        title: '未命名文档',
        content: '',
        lastModified: new Date()
    };
    
    // 默认MarkDown示例
    const defaultMarkdown = `# Markdown编辑器使用指南

## 基本语法

### 标题
使用 \`#\` 创建标题，例如：
# 一级标题
## 二级标题
### 三级标题

### 强调
*斜体文本* 或 _斜体文本_
**粗体文本** 或 __粗体文本__
~~删除线文本~~

### 列表
无序列表:
- 项目1
- 项目2
  - 子项目A
  - 子项目B

有序列表:
1. 第一项
2. 第二项
3. 第三项

### 链接和图片
[链接文本](https://www.example.com)
![图片替代文本](https://example.com/image.jpg)

### 代码
行内代码: \`var example = "hello";\`

代码块:
\`\`\`javascript
function helloWorld() {
  console.log("Hello, world!");
}
\`\`\`

### 表格
| 表头1 | 表头2 | 表头3 |
|-------|-------|-------|
| 单元格1 | 单元格2 | 单元格3 |
| 单元格4 | 单元格5 | 单元格6 |

### 引用
> 这是一段引用文本。
> 引用可以包含多行。

### 分隔线
---

### 任务列表
- [x] 已完成任务
- [ ] 未完成任务
`;
    
    // 初始化编辑器
    function initializeEditor() {
        // 检查DOM元素是否存在
        if (!markdownInput || !markdownPreview) {
            console.error('找不到必要的DOM元素，编辑器初始化失败');
            return;
        }
        
        // 加载上次编辑的文档或显示默认内容
        const lastEditedDocId = localStorage.getItem('last_edited_document');
        
        if (lastEditedDocId) {
            // 尝试加载上次编辑的文档
            const documents = getDocumentsFromStorage();
            const lastDoc = documents.find(doc => doc.id === lastEditedDocId);
            
            if (lastDoc) {
                currentDocument = lastDoc;
                markdownInput.value = lastDoc.content;
            } else {
                markdownInput.value = defaultMarkdown;
            }
        } else {
            markdownInput.value = defaultMarkdown;
        }
        
        // 初始更新预览和统计
        updatePreview();
        updateStats();
        
        // 加载保存的文档列表
        loadDocumentsList();
        
        // 设置自动保存状态
        const autoSaveEnabled = localStorage.getItem('auto_save') !== 'false';
        autoSaveCheckbox.checked = autoSaveEnabled;
        
        console.log('Markdown编辑器初始化完成');
    }
    
    // 更新Markdown预览 - 修复预览功能
    function updatePreview() {
        try {
            if (!markdownInput || !markdownPreview) {
                console.error('预览更新失败：找不到必要的DOM元素');
                return;
            }
            
            // 获取输入文本
            const mdText = markdownInput.value || '';
            
            // 使用marked解析markdown
            const rawHtml = marked.parse(mdText);
            
            // 使用DOMPurify清理HTML以防XSS (如果存在)
            let cleanHtml = rawHtml;
            if (typeof DOMPurify !== 'undefined') {
                cleanHtml = DOMPurify.sanitize(rawHtml);
            }
            
            // 更新预览
            markdownPreview.innerHTML = cleanHtml;
            
            // 为任务列表添加交互行为
            addTaskListBehavior();
            
            // 应用代码高亮 (如果hljs存在)
            if (typeof hljs !== 'undefined') {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightBlock(block);
                });
            }
        } catch (error) {
            console.error('预览更新失败:', error);
            markdownPreview.innerHTML = '<div class="error-message">预览加载失败，请检查Markdown语法或刷新页面重试</div>';
        }
    }
    
    // 为预览中的任务列表添加交互行为
    function addTaskListBehavior() {
        const items = markdownPreview.querySelectorAll('input[type="checkbox"]');
        items.forEach(item => {
            item.onclick = function(e) {
                e.preventDefault();
                
                // 找到对应的Markdown文本行并更新
                const checked = item.checked;
                const listItem = item.closest('li');
                const listItems = Array.from(markdownPreview.querySelectorAll('li'));
                const index = listItems.indexOf(listItem);
                
                // 匹配任务列表语法并更新
                const lines = markdownInput.value.split('\n');
                let taskIndex = -1;
                
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].match(/- \[[x ]\]/i)) {
                        taskIndex++;
                        if (taskIndex === index) {
                            // 更新复选框状态
                            if (checked) {
                                lines[i] = lines[i].replace(/- \[ \]/i, '- [x]');
                            } else {
                                lines[i] = lines[i].replace(/- \[x\]/i, '- [ ]');
                            }
                            break;
                        }
                    }
                }
                
                markdownInput.value = lines.join('\n');
                updatePreview();
                
                // 如果自动保存开启，则保存文档
                if (autoSaveCheckbox.checked) {
                    saveDocument();
                }
            };
        });
    }
    
    // 更新统计信息
    function updateStats() {
        const text = markdownInput.value;
        charCount.textContent = text.length;
        wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
        lineCount.textContent = text.split('\n').length;
    }
    
    // 添加格式标记
    function insertFormat(formatType) {
        const textarea = markdownInput;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let formattedText = '';
        
        switch (formatType) {
            case 'heading':
                formattedText = `## ${selectedText || '标题'}`;
                break;
            case 'bold':
                formattedText = `**${selectedText || '粗体文本'}**`;
                break;
            case 'italic':
                formattedText = `*${selectedText || '斜体文本'}*`;
                break;
            case 'strikethrough':
                formattedText = `~~${selectedText || '删除线文本'}~~`;
                break;
            case 'link':
                formattedText = selectedText ? `[${selectedText}](链接URL)` : '[链接文本](链接URL)';
                break;
            case 'image':
                formattedText = `![${selectedText || '图片描述'}](图片URL)`;
                break;
            case 'code':
                formattedText = `\`${selectedText || '代码'}\``;
                break;
            case 'codeblock':
                formattedText = `\`\`\`\n${selectedText || '代码块'}\n\`\`\``;
                break;
            case 'quote':
                formattedText = `> ${selectedText || '引用文本'}`;
                break;
            case 'ul':
                formattedText = `- ${selectedText || '列表项'}`;
                break;
            case 'ol':
                formattedText = `1. ${selectedText || '列表项'}`;
                break;
            case 'checklist':
                formattedText = `- [ ] ${selectedText || '任务项'}`;
                break;
            case 'table':
                formattedText = `| 表头1 | 表头2 | 表头3 |\n|-------|-------|-------|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |`;
                break;
            case 'hr':
                formattedText = `---`;
                break;
        }
        
        // 插入格式化文本
        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        
        // 更新光标位置
        const newCursorPos = start + formattedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        
        // 更新预览
        updatePreview();
        updateStats();
        textarea.focus();
        
        // 如果自动保存开启，则保存文档
        if (autoSaveCheckbox.checked) {
            currentDocument.content = textarea.value;
            currentDocument.lastModified = new Date();
            saveDocument();
        }
    }
    
    // 从本地存储获取文档列表
    function getDocumentsFromStorage() {
        const storageData = localStorage.getItem('markdown_documents');
        return storageData ? JSON.parse(storageData) : [];
    }
    
    // 加载文档列表
    function loadDocumentsList() {
        const documents = getDocumentsFromStorage();
        
        // 清空当前列表
        documentList.innerHTML = '';
        
        if (documents.length === 0) {
            // 显示空状态
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="ri-file-list-3-line"></i>
                <p>没有已保存的文档</p>
            `;
            documentList.appendChild(emptyState);
            return;
        }
        
        // 按修改日期排序（最新的在前）
        documents.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        
        // 创建文档项
        documents.forEach(doc => {
            const docItem = document.createElement('div');
            docItem.className = 'document-item';
            docItem.setAttribute('data-id', doc.id);
            
            const dateFormatted = new Date(doc.lastModified).toLocaleString();
            
            docItem.innerHTML = `
                <div class="document-title">
                    <span>${doc.title}</span>
                    <i class="ri-delete-bin-line delete-doc" title="删除文档"></i>
                </div>
                <div class="document-date">${dateFormatted}</div>
            `;
            
            documentList.appendChild(docItem);
        });
        
        // 添加事件监听
        document.querySelectorAll('.document-item').forEach(item => {
            item.addEventListener('click', function(e) {
                if (e.target.classList.contains('delete-doc')) {
                    // 删除文档
                    e.stopPropagation();
                    const docId = this.getAttribute('data-id');
                    deleteDocument(docId);
                } else {
                    // 加载文档
                    const docId = this.getAttribute('data-id');
                    loadDocument(docId);
                }
            });
        });
    }
    
    // 保存当前文档
    function saveDocument() {
        // 更新文档内容和时间戳
        currentDocument.content = markdownInput.value;
        currentDocument.lastModified = new Date();
        
        // 如果是首次保存，生成ID并请求标题
        if (!currentDocument.id) {
            currentDocument.id = 'doc_' + Date.now();
            const title = prompt('请输入文档标题:', '未命名文档');
            currentDocument.title = title || '未命名文档';
        }
        
        let documents = getDocumentsFromStorage();
        
        // 查找是否已存在该文档
        const existingIndex = documents.findIndex(doc => doc.id === currentDocument.id);
        
        if (existingIndex !== -1) {
            // 更新现有文档
            documents[existingIndex] = currentDocument;
        } else {
            // 添加新文档
            documents.push(currentDocument);
        }
        
        // 保存到本地存储
        localStorage.setItem('markdown_documents', JSON.stringify(documents));
        localStorage.setItem('last_edited_document', currentDocument.id);
        
        // 更新文档列表
        loadDocumentsList();
        
        // 显示保存成功提示
        showToast('文档已保存');
    }

    // 加载文档
    function loadDocument(id) {
        const documents = getDocumentsFromStorage();
        const doc = documents.find(doc => doc.id === id);
        
        if (doc) {
            currentDocument = doc;
            markdownInput.value = doc.content;
            updatePreview();
            updateStats();
            
            // 记住最后编辑的文档
            localStorage.setItem('last_edited_document', doc.id);
            
            showToast(`已加载: ${doc.title}`);
        }
    }
    
    // 删除文档
    function deleteDocument(id) {
        if (!confirm('确定要删除这个文档吗？')) return;
        
        let documents = getDocumentsFromStorage();
        documents = documents.filter(doc => doc.id !== id);
        localStorage.setItem('markdown_documents', JSON.stringify(documents));
        
        // 如果删除的是当前文档，清空编辑器
        if (currentDocument.id === id) {
            newDocument();
        }
        
        loadDocumentsList();
        showToast('文档已删除');
    }
    
    // 新建文档
    function newDocument() {
        if (markdownInput.value.trim() !== '' && 
            !confirm('创建新文档将丢失当前未保存的内容，确定继续吗？')) {
            return;
        }
        
        currentDocument = {
            id: null,
            title: '未命名文档',
            content: '',
            lastModified: new Date()
        };
        
        markdownInput.value = '';
        updatePreview();
        updateStats();
        
        // 清除最后编辑文档的记录
        localStorage.removeItem('last_edited_document');
    }
    
    // 导出HTML文件
    function exportHTML() {
        const content = markdownPreview.innerHTML;
        const blob = new Blob([`
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${currentDocument.title || '未命名文档'}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; color: #333; }
                    h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
                    h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
                    p { margin: 1em 0; }
                    pre { background-color: #f6f8fa; padding: 16px; overflow: auto; border-radius: 6px; }
                    code { background-color: rgba(27,31,35,0.05); padding: 0.2em 0.4em; border-radius: 3px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; }
                    blockquote { padding: 0 1em; color: #6a737d; border-left: 0.25em solid #dfe2e5; margin: 1em 0; }
                    img { max-width: 100%; }
                    table { border-collapse: collapse; width: 100%; margin: 1em 0; }
                    th, td { border: 1px solid #dfe2e5; padding: 8px 12px; }
                    th { background-color: #f6f8fa; }
                </style>
            </head>
            <body>
                ${content}
            </body>
            </html>
        `], { type: 'text/html;charset=utf-8' });
        saveAs(blob, `${currentDocument.title || 'markdown-export'}.html`);
    }
    
    // 导出PDF文件
    function exportPDF() {
        // 使用html2pdf库将HTML转换为PDF
        const content = markdownPreview.innerHTML;
        const container = document.createElement('div');
        container.innerHTML = content;
        container.style.width = '800px';
        container.style.padding = '20px';
        container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        
        showToast('正在生成PDF，请稍候...');
        
        html2pdf().from(container).save(`${currentDocument.title || 'markdown-export'}.pdf`);
    }
    
    // 导出Markdown文件
    function exportMarkdown() {
        const content = markdownInput.value;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        saveAs(blob, `${currentDocument.title || 'markdown-export'}.md`);
    }
    
    // 创建并触发下载
    function saveAs(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }
    
    // 创建提示消息函数
    function showToast(message) {
        let toast = document.getElementById('custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(74, 108, 247, 0.9)';
            toast.style.color = 'white';
            toast.style.padding = '12px 25px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = '1000';
            toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            toast.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }
    
    // 全屏编辑和预览
    function toggleFullscreen(element) {
        if (!document.fullscreenElement) {
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    // 设置事件监听器
    function setupEventListeners() {
        // Markdown输入事件 - 确保正常工作
        markdownInput.addEventListener('input', function() {
            console.log('输入内容已更新，更新预览...');
            updatePreview();
            updateStats();
            
            // 自动保存
            if (autoSaveCheckbox.checked) {
                // 更新文档
                currentDocument.content = this.value;
                currentDocument.lastModified = new Date();
                
                // 如果文档已有ID，则静默保存
                if (currentDocument.id) {
                    let documents = getDocumentsFromStorage();
                    const existingIndex = documents.findIndex(doc => doc.id === currentDocument.id);
                    
                    if (existingIndex !== -1) {
                        documents[existingIndex] = currentDocument;
                        localStorage.setItem('markdown_documents', JSON.stringify(documents));
                    }
                }
            }
        });
        
        // 自动保存开关
        if (autoSaveCheckbox) {
            autoSaveCheckbox.addEventListener('change', function() {
                localStorage.setItem('auto_save', this.checked);
                
                if (this.checked) {
                    showToast('自动保存已开启');
                    
                    // 如果当前有未保存的内容，立即保存
                    if (markdownInput.value.trim() !== '') {
                        saveDocument();
                    }
                } else {
                    showToast('自动保存已关闭');
                }
            });
        }
        
        // 格式工具栏
        formatButtons.forEach(button => {
            button.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                insertFormat(action);
            });
        });
        
        // 文件操作
        if (newDocumentBtn) newDocumentBtn.addEventListener('click', newDocument);
        if (saveDocumentBtn) saveDocumentBtn.addEventListener('click', saveDocument);
        if (exportHtmlBtn) exportHtmlBtn.addEventListener('click', exportHTML);
        if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportPDF);
        if (exportMdBtn) exportMdBtn.addEventListener('click', exportMarkdown);
        
        // 清空本地存储
        if (clearStorageBtn) {
            clearStorageBtn.addEventListener('click', function() {
                if (confirm('确定要删除所有保存的文档吗？此操作不可恢复。')) {
                    localStorage.removeItem('markdown_documents');
                    localStorage.removeItem('last_edited_document');
                    loadDocumentsList();
                    showToast('所有文档已清除');
                    
                    // 清空当前编辑器
                    newDocument();
                }
            });
        }
        
        // 全屏操作
        if (fullscreenEditBtn) {
            fullscreenEditBtn.addEventListener('click', function() {
                toggleFullscreen(markdownInput.parentElement);
            });
        }
        
        if (fullscreenPreviewBtn) {
            fullscreenPreviewBtn.addEventListener('click', function() {
                toggleFullscreen(markdownPreview.parentElement);
            });
        }
    }
    
    // 初始化编辑器
    initializeEditor();
    
    // 设置事件监听
    setupEventListeners();
    
    // 初始加载时立即更新预览
    console.log('初始化预览...');
    setTimeout(updatePreview, 100);
});
