document.addEventListener('DOMContentLoaded', function() {
    // 初始化编辑器
    initRichTextEditor();
    
    // 加载保存的文档列表
    loadSavedDocuments();
    
    // 设置事件监听
    setupEventListeners();
    
    // 默认内容
    setDefaultContent();
});

// 初始化富文本编辑器
function initRichTextEditor() {
    // 编辑器元素
    const editor = document.getElementById('editor');
    const sourceView = document.getElementById('source-view');
    
    // 为编辑器内容添加粘贴事件处理
    editor.addEventListener('paste', function(e) {
        // 阻止默认粘贴行为
        e.preventDefault();
        
        // 获取纯文本
        let text = '';
        if (e.clipboardData || e.originalEvent.clipboardData) {
            text = (e.originalEvent || e).clipboardData.getData('text/html') || 
                   (e.originalEvent || e).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        
        // 如果是HTML，先清理
        if (text.indexOf('<') !== -1 && text.indexOf('>') !== -1) {
            // 创建临时元素来清理HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = text;
            
            // 移除所有script标签
            const scripts = tempDiv.querySelectorAll('script');
            scripts.forEach(script => script.remove());
            
            // 插入清理后的HTML
            document.execCommand('insertHTML', false, tempDiv.innerHTML);
        } else {
            // 插入纯文本
            document.execCommand('insertText', false, text);
        }
        
        // 更新字数统计
        updateWordCount();
    });
    
    // 监听内容变化
    editor.addEventListener('input', updateWordCount);
    editor.addEventListener('keyup', updateWordCount);
    
    // 初始更新字数统计
    updateWordCount();
}

// 设置事件监听
function setupEventListeners() {
    // 获取DOM元素
    const editor = document.getElementById('editor');
    const sourceView = document.getElementById('source-view');
    const formatBlock = document.getElementById('format-block');
    const fontName = document.getElementById('font-name');
    const fontSize = document.getElementById('font-size');
    const textColorPicker = document.getElementById('text-color-picker');
    const bgColorPicker = document.getElementById('bg-color-picker');
    const clearFormat = document.getElementById('clear-format');
    const sourceCode = document.getElementById('source-code');
    const newDocument = document.getElementById('new-document');
    const saveDocument = document.getElementById('save-document');
    const exportBtn = document.getElementById('export-btn');
    const exportHTML = document.getElementById('export-html');
    const exportText = document.getElementById('export-text');
    const exportPDF = document.getElementById('export-pdf');
    const clearDocuments = document.getElementById('clear-documents');
    
    // 工具栏按钮事件
    document.querySelectorAll('.tool-btn[data-command]').forEach(button => {
        button.addEventListener('click', function() {
            const command = this.getAttribute('data-command');
            document.execCommand(command, false, null);
            editor.focus();
        });
    });
    
    // 格式选择器事件
    formatBlock.addEventListener('change', function() {
        if (this.value) {
            document.execCommand('formatBlock', false, `<${this.value}>`);
            editor.focus();
            this.selectedIndex = 0;
        }
    });
    
    // 字体选择器事件
    fontName.addEventListener('change', function() {
        if (this.value) {
            document.execCommand('fontName', false, this.value);
            editor.focus();
            this.selectedIndex = 0;
        }
    });
    
    // 字号选择器事件
    fontSize.addEventListener('change', function() {
        if (this.value) {
            document.execCommand('fontSize', false, this.value);
            editor.focus();
            this.selectedIndex = 0;
        }
    });
    
    // 文字颜色事件
    textColorPicker.addEventListener('input', function() {
        document.execCommand('foreColor', false, this.value);
        editor.focus();
    });
    
    // 背景颜色事件
    bgColorPicker.addEventListener('change', function() {
        document.execCommand('hiliteColor', false, this.value);
        editor.focus();
    });
    
    // 清除格式
    clearFormat.addEventListener('click', function() {
        document.execCommand('removeFormat', false, null);
        editor.focus();
    });
    
    // 源代码切换
    sourceCode.addEventListener('click', function() {
        if (sourceView.style.display === 'none') {
            // 切换到源代码视图
            sourceView.value = editor.innerHTML;
            editor.style.display = 'none';
            sourceView.style.display = 'block';
            this.classList.add('active');
        } else {
            // 切换回编辑视图
            editor.innerHTML = sourceView.value;
            sourceView.style.display = 'none';
            editor.style.display = 'block';
            this.classList.remove('active');
            updateWordCount();
        }
    });
    
    // 添加链接
    const insertLink = document.getElementById('insert-link');
    const linkDialog = document.getElementById('link-dialog');
    const linkText = document.getElementById('link-text');
    const linkUrl = document.getElementById('link-url');
    const linkNewTab = document.getElementById('link-new-tab');
    const linkCancel = document.getElementById('link-cancel');
    const linkInsert = document.getElementById('link-insert');
    
    insertLink.addEventListener('click', function() {
        // 获取选中的文本
        const selection = window.getSelection();
        const selectedText = selection.toString();
        
        // 填充链接文本
        linkText.value = selectedText;
        linkUrl.value = 'https://';
        
        // 显示对话框
        linkDialog.classList.add('open');
    });
    
    linkCancel.addEventListener('click', function() {
        linkDialog.classList.remove('open');
    });
    
    linkInsert.addEventListener('click', function() {
        const text = linkText.value.trim();
        const url = linkUrl.value.trim();
        const target = linkNewTab.checked ? '_blank' : '';
        
        if (url) {
            // 创建链接HTML
            const linkHtml = `<a href="${url}" target="${target}">${text || url}</a>`;
            
            // 插入链接
            document.execCommand('insertHTML', false, linkHtml);
            
            // 关闭对话框
            linkDialog.classList.remove('open');
            
            // 更新字数统计
            updateWordCount();
        }
    });
    
    // 添加图片
    const insertImage = document.getElementById('insert-image');
    const imageDialog = document.getElementById('image-dialog');
    const imageUrl = document.getElementById('image-url');
    const imageFile = document.getElementById('image-file');
    const imageAlt = document.getElementById('image-alt');
    const imageWidth = document.getElementById('image-width');
    const imageHeight = document.getElementById('image-height');
    const imagePreview = document.getElementById('image-preview');
    const imageCancel = document.getElementById('image-cancel');
    const imageInsert = document.getElementById('image-insert');
    
    // 图片对话框标签页
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 切换标签页选中状态
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // 切换内容区域
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // 显示图片对话框
    insertImage.addEventListener('click', function() {
        // 重置表单
        imageUrl.value = '';
        imageFile.value = '';
        imageAlt.value = '';
        imageWidth.value = '';
        imageHeight.value = '';
        imagePreview.innerHTML = '';
        
        // 显示对话框
        imageDialog.classList.add('open');
    });
    
    // 图片文件选择预览
    imageFile.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="预览">`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // 取消插入图片
    imageCancel.addEventListener('click', function() {
        imageDialog.classList.remove('open');
    });
    
    // 插入图片
    imageInsert.addEventListener('click', function() {
        let imgSrc = '';
        const alt = imageAlt.value.trim();
        const width = imageWidth.value ? parseInt(imageWidth.value) : '';
        const height = imageHeight.value ? parseInt(imageHeight.value) : '';
        
        // 判断图片来源（URL或文件）
        if (document.querySelector('.tab.active').getAttribute('data-tab') === 'url-tab') {
            imgSrc = imageUrl.value.trim();
            if (!imgSrc) {
                alert('请输入图片URL');
                return;
            }
        } else {
            if (!imageFile.files[0]) {
                alert('请选择图片文件');
                return;
            }
            
            // 使用FileReader读取图片为DataURL
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgSrc = e.target.result;
                insertImageToEditor(imgSrc, alt, width, height);
            };
            reader.readAsDataURL(imageFile.files[0]);
            imageDialog.classList.remove('open');
            return;
        }
        
        insertImageToEditor(imgSrc, alt, width, height);
        imageDialog.classList.remove('open');
    });
    
    // 插入图片到编辑器
    function insertImageToEditor(src, alt, width, height) {
        const imgHtml = `<img src="${src}" alt="${alt}"${width ? ` width="${width}"` : ''}${height ? ` height="${height}"` : ''} style="max-width: 100%;">`;
        document.execCommand('insertHTML', false, imgHtml);
        updateWordCount();
    }
    
    // 添加表格
    const insertTable = document.getElementById('insert-table');
    const tableDialog = document.getElementById('table-dialog');
    const tableRows = document.getElementById('table-rows');
    const tableCols = document.getElementById('table-cols');
    const tableWidth = document.getElementById('table-width');
    const tableHeader = document.getElementById('table-header');
    const tableBorder = document.getElementById('table-border');
    const tableCancel = document.getElementById('table-cancel');
    const tableInsert = document.getElementById('table-insert');
    
    // 显示表格对话框
    insertTable.addEventListener('click', function() {
        // 重置表单
        tableRows.value = '3';
        tableCols.value = '3';
        tableWidth.value = '100%';
        tableHeader.checked = true;
        tableBorder.checked = true;
        
        // 显示对话框
        tableDialog.classList.add('open');
    });
    
    // 取消插入表格
    tableCancel.addEventListener('click', function() {
        tableDialog.classList.remove('open');
    });
    
    // 插入表格
    tableInsert.addEventListener('click', function() {
        const rows = parseInt(tableRows.value);
        const cols = parseInt(tableCols.value);
        const width = tableWidth.value;
        const hasHeader = tableHeader.checked;
        const hasBorder = tableBorder.checked;
        
        if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) {
            alert('请输入有效的行数和列数');
            return;
        }
        
        // 创建表格HTML
        let tableHtml = `<table style="width: ${width}; ${hasBorder ? 'border-collapse: collapse;' : ''} margin: 10px 0;">`;
        
        // 添加表头
        if (hasHeader) {
            tableHtml += '<thead><tr>';
            for (let j = 0; j < cols; j++) {
                tableHtml += `<th style="${hasBorder ? 'border: 1px solid #ddd;' : ''} padding: 8px; text-align: left;">标题 ${j + 1}</th>`;
            }
            tableHtml += '</tr></thead>';
        }
        
        // 添加表格主体
        tableHtml += '<tbody>';
        for (let i = 0; i < (hasHeader ? rows - 1 : rows); i++) {
            tableHtml += '<tr>';
            for (let j = 0; j < cols; j++) {
                tableHtml += `<td style="${hasBorder ? 'border: 1px solid #ddd;' : ''} padding: 8px;">单元格 ${i + 1}-${j + 1}</td>`;
            }
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table>';
        
        // 插入表格
        document.execCommand('insertHTML', false, tableHtml);
        
        // 关闭对话框
        tableDialog.classList.remove('open');
        
        // 更新字数统计
        updateWordCount();
    });
    
    // 新建文档
    newDocument.addEventListener('click', function() {
        if (confirm('确定要新建文档吗？当前内容将会丢失。')) {
            setDefaultContent();
            updateWordCount();
        }
    });
    
    // 保存文档
    saveDocument.addEventListener('click', function() {
        // 获取编辑器内容
        let content;
        if (sourceView.style.display === 'none') {
            content = editor.innerHTML;
        } else {
            content = sourceView.value;
        }
        
        // 获取文档标题
        let title = prompt('请输入文档标题', '未命名文档');
        if (!title) return;
        
        // 保存文档
        saveDocumentToStorage(title, content);
        
        // 更新文档列表
        loadSavedDocuments();
        
        // 显示提示
        showToast('文档已保存');
    });
    
    // 导出下拉菜单
    exportBtn.addEventListener('click', function() {
        const dropdown = this.nextElementSibling;
        dropdown.classList.toggle('show');
    });
    
    // 点击其他地方关闭下拉菜单
    document.addEventListener('click', function(event) {
        if (!event.target.matches('.dropdown-toggle') && !event.target.closest('.dropdown-menu')) {
            const dropdowns = document.querySelectorAll('.dropdown-menu');
            dropdowns.forEach(dropdown => dropdown.classList.remove('show'));
        }
    });
    
    // 导出HTML
    exportHTML.addEventListener('click', function() {
        let content;
        if (sourceView.style.display === 'none') {
            content = editor.innerHTML;
        } else {
            content = sourceView.value;
        }
        
        // 创建完整的HTML文档
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导出文档</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        img {
            max-width: 100%;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        th, td {
            padding: 8px;
            text-align: left;
        }
    </style>
</head>
<body>
${content}
</body>
</html>`;
        
        // 下载HTML文件
        downloadFile(html, '导出文档.html', 'text/html');
    });
    
    // 导出纯文本
    exportText.addEventListener('click', function() {
        let content;
        if (sourceView.style.display === 'none') {
            // 创建临时元素来提取纯文本
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = editor.innerHTML;
            content = tempDiv.textContent || tempDiv.innerText || '';
        } else {
            // 从HTML源码中提取纯文本
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = sourceView.value;
            content = tempDiv.textContent || tempDiv.innerText || '';
        }
        
        // 下载文本文件
        downloadFile(content, '导出文档.txt', 'text/plain');
    });
    
    // 导出PDF
    exportPDF.addEventListener('click', function() {
        // 获取编辑器内容
        let content = editor.innerHTML;
        
        // 创建临时容器
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = content;
        tempContainer.style.width = '210mm';
        tempContainer.style.padding = '15mm';
        tempContainer.style.backgroundColor = 'white';
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.fontFamily = 'Arial, sans-serif';
        tempContainer.style.fontSize = '12pt';
        tempContainer.style.lineHeight = '1.5';
        
        // 添加到文档
        document.body.appendChild(tempContainer);
        
        // 提示用户PDF生成中
        showToast('正在生成PDF，请稍候...');
        
        // 使用html2pdf库生成PDF
        html2pdf().from(tempContainer).save('导出文档.pdf').then(() => {
            // 移除临时容器
            document.body.removeChild(tempContainer);
            showToast('PDF导出成功');
        }).catch(error => {
            console.error('PDF导出失败', error);
            document.body.removeChild(tempContainer);
            showToast('PDF导出失败');
        });
    });
    
    // 清空所有文档
    clearDocuments.addEventListener('click', function() {
        if (confirm('确定要删除所有保存的文档吗？此操作不可恢复。')) {
            localStorage.removeItem('rich_text_documents');
            loadSavedDocuments();
            showToast('所有文档已清空');
        }
    });
}

// 更新字数统计
function updateWordCount() {
    const editor = document.getElementById('editor');
    const charCountEl = document.getElementById('char-count');
    const wordCountEl = document.getElementById('word-count');
    const lineCountEl = document.getElementById('line-count');
    
    if (!editor || !charCountEl || !wordCountEl || !lineCountEl) return;
    
    // 获取编辑器内容的纯文本
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editor.innerHTML;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    // 统计字符数
    const charCount = text.length;
    
    // 统计单词数（按空格、标点等分隔）
    const wordCount = text.trim() ? text.trim().split(/\s+|[，。！？、；：""''（）《》【】]/g).filter(Boolean).length : 0;
    
    // 统计行数（按回车分隔）
    const lineCount = text.split(/\r\n|\r|\n/).length;
    
    // 更新显示
    charCountEl.textContent = charCount;
    wordCountEl.textContent = wordCount;
    lineCountEl.textContent = lineCount;
}

// 设置默认内容
function setDefaultContent() {
    const editor = document.getElementById('editor');
    const sourceView = document.getElementById('source-view');
    
    const defaultContent = `
<h1>欢迎使用富文本编辑器</h1>
<p>这是一个功能强大的在线编辑器，您可以：</p>
<ul>
    <li>编辑文本并设置<strong>格式</strong>、<em>样式</em>和<u>装饰</u></li>
    <li>插入链接、图片和表格</li>
    <li>保存、加载和导出文档</li>
</ul>
<p>开始编辑吧！</p>`;
    
    editor.innerHTML = defaultContent;
    sourceView.value = defaultContent;
}

// 保存文档到本地存储
function saveDocumentToStorage(title, content) {
    // 获取现有文档
    const documents = JSON.parse(localStorage.getItem('rich_text_documents') || '[]');
    
    // 创建新文档对象
    const newDocument = {
        id: Date.now().toString(),
        title: title,
        content: content,
        date: new Date().toISOString()
    };
    
    // 添加到文档列表
    documents.push(newDocument);
    
    // 保存回本地存储
    localStorage.setItem('rich_text_documents', JSON.stringify(documents));
}

// 加载已保存的文档列表
function loadSavedDocuments() {
    const documentList = document.getElementById('document-list');
    if (!documentList) return;
    
    // 清空列表
    documentList.innerHTML = '';
    
    // 获取文档列表
    const documents = JSON.parse(localStorage.getItem('rich_text_documents') || '[]');
    
    if (documents.length === 0) {
        documentList.innerHTML = '<p class="empty-message">没有保存的文档</p>';
        return;
    }
    
    // 按日期降序排序
    documents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 添加文档卡片
    documents.forEach(doc => {
        const card = document.createElement('div');
        card.className = 'document-card';
        
        // 格式化日期
        const date = new Date(doc.date);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        card.innerHTML = `
            <div class="document-title">${doc.title}</div>
            <div class="document-time">${formattedDate}</div>
            <div class="document-actions">
                <button class="tool-btn" data-id="${doc.id}" data-action="load">
                    <i class="ri-file-text-line"></i>
                </button>
                <button class="tool-btn" data-id="${doc.id}" data-action="delete">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;
        
        documentList.appendChild(card);
    });
    
    // 添加加载和删除文档事件
    document.querySelectorAll('.document-actions button').forEach(button => {
        button.addEventListener('click', function() {
            const docId = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            
            if (action === 'load') {
                loadDocument(docId);
            } else if (action === 'delete') {
                deleteDocument(docId);
            }
        });
    });
}

// 加载文档
function loadDocument(id) {
    const documents = JSON.parse(localStorage.getItem('rich_text_documents') || '[]');
    const doc = documents.find(d => d.id === id);
    
    if (doc) {
        if (confirm(`是否加载文档"${doc.title}"？当前内容将会丢失。`)) {
            const editor = document.getElementById('editor');
            const sourceView = document.getElementById('source-view');
            
            editor.innerHTML = doc.content;
            sourceView.value = doc.content;
            
            // 切换到编辑视图
            editor.style.display = 'block';
            sourceView.style.display = 'none';
            document.getElementById('source-code').classList.remove('active');
            
            // 更新字数统计
            updateWordCount();
            
            showToast(`文档"${doc.title}"已加载`);
        }
    }
}

// 删除文档
function deleteDocument(id) {
    const documents = JSON.parse(localStorage.getItem('rich_text_documents') || '[]');
    const docIndex = documents.findIndex(d => d.id === id);
    
    if (docIndex !== -1) {
        const doc = documents[docIndex];
        if (confirm(`确定要删除文档"${doc.title}"吗？`)) {
            documents.splice(docIndex, 1);
            localStorage.setItem('rich_text_documents', JSON.stringify(documents));
            loadSavedDocuments();
            showToast(`文档"${doc.title}"已删除`);
        }
    }
}

// 下载文件
function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
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