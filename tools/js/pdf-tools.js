document.addEventListener('DOMContentLoaded', function() {
    // 设置PDF.js的workerSrc
    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.15.349/build/pdf.worker.min.js';
    }
    
    // 选项卡切换
    const tabs = document.querySelectorAll('.tool-tab');
    const tabContents = document.querySelectorAll('.tool-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 处理文件拖放
    setupDropArea('merge-drop-area', 'merge-file-input', handleMergeFiles, 'application/pdf');
    setupDropArea('split-drop-area', 'split-file-input', handleSplitFile, 'application/pdf');
    setupDropArea('convert-drop-area', 'convert-file-input', handleImageFiles, 'image/*');
    setupDropArea('compress-drop-area', 'compress-file-input', handleCompressFile, 'application/pdf');
    setupDropArea('extract-drop-area', 'extract-file-input', handleExtractFile, 'application/pdf');
    
    // 设置拖拽排序
    setupSortable('merge-file-list');
    setupSortable('image-list');
    
    // 各功能的按钮事件
    document.getElementById('merge-btn').addEventListener('click', mergePDFs);
    document.getElementById('clear-merge-list').addEventListener('click', clearMergeList);
    document.getElementById('split-btn').addEventListener('click', splitPDF);
    document.getElementById('clear-split').addEventListener('click', clearSplitPDF);
    document.getElementById('convert-btn').addEventListener('click', convertImagesToPDF);
    document.getElementById('clear-image-list').addEventListener('click', clearImageList);
    document.getElementById('compress-btn').addEventListener('click', compressPDF);
    document.getElementById('clear-compress').addEventListener('click', clearCompressPDF);
    document.getElementById('extract-btn').addEventListener('click', extractImages);
    document.getElementById('clear-extract').addEventListener('click', clearExtractPDF);
    
    // Split PDF 选项切换
    document.getElementById('split-type').addEventListener('change', function() {
        const rangeOptions = document.getElementById('range-options');
        const singlePageOptions = document.getElementById('single-page-options');
        
        if (this.value === 'range') {
            rangeOptions.style.display = 'block';
            singlePageOptions.style.display = 'none';
        } else if (this.value === 'single') {
            rangeOptions.style.display = 'none';
            singlePageOptions.style.display = 'block';
        } else {
            rangeOptions.style.display = 'none';
            singlePageOptions.style.display = 'none';
        }
    });
    
    // 提取图片格式变化
    document.getElementById('image-format').addEventListener('change', function() {
        const qualityOption = document.getElementById('quality-option');
        qualityOption.style.display = this.value === 'jpeg' ? 'block' : 'none';
    });
    
    // 提取所有页面选项
    document.getElementById('extract-all-pages').addEventListener('change', function() {
        const pageRangeOption = document.getElementById('page-range-option');
        pageRangeOption.style.display = this.checked ? 'none' : 'block';
    });
    
    // 初始化PDF预览控制
    initPDFPageControls();
});

// 设置拖放区域
function setupDropArea(dropAreaId, fileInputId, handleFunction, acceptType) {
    const dropArea = document.getElementById(dropAreaId);
    const fileInput = document.getElementById(fileInputId);
    
    if (!dropArea || !fileInput) return;
    
    dropArea.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleFunction(files);
        }
    });
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.add('drag-over');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, () => {
            dropArea.classList.remove('drag-over');
        });
    });
    
    dropArea.addEventListener('drop', function(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        // 检查文件类型
        let validFiles = [];
        for (let i = 0; i < files.length; i++) {
            if (acceptType === 'application/pdf' && files[i].type === 'application/pdf') {
                validFiles.push(files[i]);
            } else if (acceptType === 'image/*' && files[i].type.startsWith('image/')) {
                validFiles.push(files[i]);
            }
        }
        
        if (validFiles.length > 0) {
            handleFunction(validFiles);
        } else {
            showToast('请选择正确的文件类型');
        }
    });
}

// 设置排序功能
function setupSortable(listId) {
    const list = document.getElementById(listId);
    if (!list) return;
    
    Sortable.create(list, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function(evt) {
            // 排序完成后的回调
        }
    });
}

// 处理合并PDF的文件
function handleMergeFiles(files) {
    const fileList = document.getElementById('merge-file-list');
    const mergeBtn = document.getElementById('merge-btn');
    const clearMergeListBtn = document.getElementById('clear-merge-list');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type !== 'application/pdf') continue;
        
        const fileId = 'merge-file-' + Date.now() + '-' + i;
        const listItem = document.createElement('li');
        listItem.setAttribute('data-file-id', fileId);
        
        const fileSize = formatFileSize(file.size);
        
        listItem.innerHTML = `
            <i class="ri-file-pdf-line file-icon"></i>
            <div class="file-info">
                <div class="file-name">${file.name}</div>
                <div class="file-meta">${fileSize}</div>
            </div>
            <div class="file-actions">
                <button class="remove-file" data-file-id="${fileId}"><i class="ri-close-line"></i></button>
            </div>
        `;
        
        // 存储文件引用
        listItem.file = file;
        
        fileList.appendChild(listItem);
    }
    
    // 添加删除按钮事件
    document.querySelectorAll('.remove-file').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const fileId = this.getAttribute('data-file-id');
            document.querySelector(`li[data-file-id="${fileId}"]`).remove();
            
            updateMergeButtons();
        });
    });
    
    updateMergeButtons();
    
    function updateMergeButtons() {
        const hasFiles = fileList.children.length > 0;
        mergeBtn.disabled = !hasFiles;
        clearMergeListBtn.disabled = !hasFiles;
    }
}

// 清空合并列表
function clearMergeList() {
    if (!confirm('确定要清空列表吗？')) return;
    
    const fileList = document.getElementById('merge-file-list');
    fileList.innerHTML = '';
    
    document.getElementById('merge-btn').disabled = true;
    document.getElementById('clear-merge-list').disabled = true;
}

// 合并PDF文件
async function mergePDFs() {
    const fileList = document.getElementById('merge-file-list');
    if (fileList.children.length < 1) {
        showToast('请至少添加一个PDF文件');
        return;
    }
    
    showProcessing('合并PDF文件中...');
    
    try {
        // 创建一个新的PDF文档
        const mergedPdf = await PDFLib.PDFDocument.create();
        
        // 获取所有文件的ArrayBuffer
        for (let i = 0; i < fileList.children.length; i++) {
            const file = fileList.children[i].file;
            
            // 更新处理状态
            updateProcessingInfo(`处理文件 ${i + 1}/${fileList.children.length}: ${file.name}`);
            
            // 将文件内容读取为ArrayBuffer
            const arrayBuffer = await readFileAsArrayBuffer(file);
            
            // 加载PDF文档
            const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
            
            // 复制所有页面到新文档
            const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            
            // 添加所有页面到新文档
            for (const page of pages) {
                mergedPdf.addPage(page);
            }
        }
        
        // 保存合并后的PDF
        const mergedPdfBytes = await mergedPdf.save();
        
        // 下载合并后的PDF
        downloadFile(mergedPdfBytes, 'merged_document.pdf', 'application/pdf');
        
        hideProcessing();
        showToast('PDF合并完成');
    } catch (error) {
        console.error('合并PDF时出错:', error);
        hideProcessing();
        showToast('合并失败: ' + error.message);
    }
}

// 处理拆分PDF的文件
async function handleSplitFile(files) {
    if (files.length !== 1) {
        showToast('请选择一个PDF文件');
        return;
    }
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
        showToast('请选择PDF文件');
        return;
    }
    
    // 显示PDF信息区域
    const pdfInfo = document.getElementById('split-pdf-info');
    pdfInfo.style.display = 'flex';
    
    // 存储当前文件引用
    pdfInfo.file = file;
    
    // 加载PDF预览
    loadPDFPreview(file, 'pdf-preview-container', 'page-num', 'page-count');
}

// 加载PDF预览
async function loadPDFPreview(file, containerId, pageNumId, pageCountId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
        // 设置当前页和总页数
        const totalPages = pdf.numPages;
        let currentPage = 1;
        
        // 更新页码显示
        if (pageNumId && pageCountId) {
            document.getElementById(pageNumId).textContent = currentPage;
            document.getElementById(pageCountId).textContent = totalPages;
        }
        
        // 渲染当前页
        renderPage(currentPage);
        
        // 存储PDF引用以便翻页
        container.pdf = pdf;
        container.currentPage = currentPage;
        
        async function renderPage(pageNumber) {
            // 清除之前的内容
            container.innerHTML = '';
            
            // 获取页面
            const page = await pdf.getPage(pageNumber);
            
            // 设置缩放以适应容器
            const viewport = page.getViewport({scale: 1.0});
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            // 设置canvas尺寸
            const containerWidth = container.clientWidth;
            const scale = containerWidth / viewport.width;
            const scaledViewport = page.getViewport({scale: scale});
            
            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;
            
            // 渲染页面
            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport
            };
            
            await page.render(renderContext).promise;
            
            container.appendChild(canvas);
            
            // 更新页码显示
            if (pageNumId) {
                document.getElementById(pageNumId).textContent = pageNumber;
            }
        }
        
        // 存储渲染函数以便翻页
        container.renderPage = renderPage;
        
        // 设置单页模式字段的最大值
        const singlePageInput = document.getElementById('single-page');
        if (singlePageInput) {
            singlePageInput.max = totalPages;
        }
        
    } catch (error) {
        console.error('加载PDF预览失败:', error);
        container.innerHTML = `<div class="error-message">无法加载PDF预览</div>`;
    }
}

// 初始化PDF页面控制
function initPDFPageControls() {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (!prevPageBtn || !nextPageBtn) return;
    
    prevPageBtn.addEventListener('click', function() {
        const container = document.getElementById('pdf-preview-container');
        if (!container.pdf) return;
        
        if (container.currentPage > 1) {
            container.currentPage--;
            container.renderPage(container.currentPage);
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const container = document.getElementById('pdf-preview-container');
        if (!container.pdf) return;
        
        if (container.currentPage < container.pdf.numPages) {
            container.currentPage++;
            container.renderPage(container.currentPage);
        }
    });
}

// 拆分PDF
async function splitPDF() {
    const pdfInfo = document.getElementById('split-pdf-info');
    if (!pdfInfo.file) {
        showToast('请先选择PDF文件');
        return;
    }
    
    const splitType = document.getElementById('split-type').value;
    const file = pdfInfo.file;
    
    showProcessing('拆分PDF文件中...');
    
    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();
        
        let pageRanges = [];
        
        switch (splitType) {
            case 'range':
                const rangeInput = document.getElementById('page-ranges').value.trim();
                if (!rangeInput) {
                    hideProcessing();
                    showToast('请输入页码范围');
                    return;
                }
                
                // 解析页码范围
                pageRanges = parsePageRanges(rangeInput, totalPages);
                break;
                
            case 'single':
                const singlePage = parseInt(document.getElementById('single-page').value);
                if (isNaN(singlePage) || singlePage < 1 || singlePage > totalPages) {
                    hideProcessing();
                    showToast(`请输入有效的页码 (1-${totalPages})`);
                    return;
                }
                
                pageRanges = [[singlePage - 1, singlePage - 1]];
                break;
                
            case 'all':
                // 为每一页创建单独的PDF
                for (let i = 0; i < totalPages; i++) {
                    pageRanges.push([i, i]);
                }
                break;
        }
        
        // 如果没有有效的页码范围
        if (pageRanges.length === 0) {
            hideProcessing();
            showToast('没有有效的页码范围');
            return;
        }
        
        // 创建包含提取页面的ZIP文件
        const zip = new JSZip();
        
        // 为每个页码范围创建PDF
        for (let i = 0; i < pageRanges.length; i++) {
            updateProcessingInfo(`处理页面范围 ${i + 1}/${pageRanges.length}`);
            
            const [start, end] = pageRanges[i];
            
            // 创建新的PDF文档
            const newPdfDoc = await PDFLib.PDFDocument.create();
            
            // 复制指定范围的页面
            for (let j = start; j <= end; j++) {
                const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [j]);
                newPdfDoc.addPage(copiedPage);
            }
            
            // 保存新PDF
            const pdfBytes = await newPdfDoc.save();
            
            // 添加到ZIP
            const fileName = `extracted_${start + 1}${start !== end ? `-${end + 1}` : ''}.pdf`;
            zip.file(fileName, pdfBytes);
        }
        
        // 生成ZIP文件
        const zipContent = await zip.generateAsync({type: 'blob'});
        
        // 下载ZIP文件
        const fileName = file.name.replace('.pdf', '') + '_extracted_pages.zip';
        downloadFile(zipContent, fileName, 'application/zip');
        
        hideProcessing();
        showToast('PDF页面提取完成');
    } catch (error) {
        console.error('拆分PDF时出错:', error);
        hideProcessing();
        showToast('拆分失败: ' + error.message);
    }
}

// 解析页码范围
function parsePageRanges(input, totalPages) {
    const ranges = [];
    const parts = input.split(',');
    
    for (let part of parts) {
        part = part.trim();
        
        if (part.includes('-')) {
            // 范围，如 1-3
            const [start, end] = part.split('-').map(Number);
            
            if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
                ranges.push([start - 1, end - 1]); // 转换为0基索引
            }
        } else {
            // 单页，如 5
            const page = parseInt(part);
            
            if (!isNaN(page) && page >= 1 && page <= totalPages) {
                ranges.push([page - 1, page - 1]); // 转换为0基索引
            }
        }
    }
    
    return ranges;
}

// 处理图片文件
function handleImageFiles(files) {
    const imageList = document.getElementById('image-list');
    const convertBtn = document.getElementById('convert-btn');
    const clearImageListBtn = document.getElementById('clear-image-list');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // 检查是否为图片文件
        if (!file.type.startsWith('image/')) continue;
        
        const fileId = 'image-file-' + Date.now() + '-' + i;
        const listItem = document.createElement('li');
        listItem.setAttribute('data-file-id', fileId);
        
        const fileSize = formatFileSize(file.size);
        
        // 创建文件预览
        const reader = new FileReader();
        reader.onload = function(e) {
            listItem.innerHTML = `
                <div class="file-preview">
                    <img src="${e.target.result}" alt="${file.name}">
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-meta">${fileSize}</div>
                </div>
                <div class="file-actions">
                    <button class="remove-file" data-file-id="${fileId}"><i class="ri-close-line"></i></button>
                </div>
            `;
            
            // 添加删除按钮事件
            listItem.querySelector('.remove-file').addEventListener('click', function(e) {
                e.stopPropagation();
                listItem.remove();
                updateImageButtons();
            });
        };
        
        reader.readAsDataURL(file);
        
        // 存储文件引用
        listItem.file = file;
        
        imageList.appendChild(listItem);
    }
    
    updateImageButtons();
    
    function updateImageButtons() {
        const hasFiles = imageList.children.length > 0;
        convertBtn.disabled = !hasFiles;
        clearImageListBtn.disabled = !hasFiles;
    }
}

// 清空图片列表
function clearImageList() {
    if (!confirm('确定要清空列表吗？')) return;
    
    const imageList = document.getElementById('image-list');
    imageList.innerHTML = '';
    
    document.getElementById('convert-btn').disabled = true;
    document.getElementById('clear-image-list').disabled = true;
}

// 将图片转换为PDF
async function convertImagesToPDF() {
    const imageList = document.getElementById('image-list');
    if (imageList.children.length < 1) {
        showToast('请至少添加一张图片');
        return;
    }
    
        const pageSize = document.getElementById('page-size').value;
        const pageOrientation = document.getElementById('page-orientation').value;
        const imageFit = document.getElementById('image-fit').value;
    const marginSize = document.getElementById('margin-size').value;
        
    showProcessing('转换图片为PDF...');
    
    try {
        // 创建新的PDF文档
        const pdfDoc = await PDFLib.PDFDocument.create();
        
        // 设置页面尺寸
        let width, height;
        switch (pageSize) {
            case 'a4':
                width = 595;
                height = 842;
                break;
            case 'a5':
                width = 420;
                height = 595;
                break;
            case 'letter':
                width = 612;
                height = 792;
                break;
            case 'legal':
                width = 612;
                height = 1008;
                break;
        }
        
        // 应用页面方向
        if (pageOrientation === 'landscape') {
            [width, height] = [height, width];
        }
        
        // 设置边距
        let margin;
        switch (marginSize) {
            case 'small':
                margin = 20;
                break;
            case 'medium':
                margin = 40;
                break;
            case 'large':
                margin = 60;
                break;
            case 'none':
                margin = 0;
                break;
        }
        
        // 处理每张图片
        for (let i = 0; i < imageList.children.length; i++) {
            updateProcessingInfo(`处理图片 ${i + 1}/${imageList.children.length}`);
            
            const file = imageList.children[i].file;
            const arrayBuffer = await readFileAsArrayBuffer(file);
            
            // 根据图片类型选择嵌入方法
            let image;
                if (file.type === 'image/jpeg') {
                image = await pdfDoc.embedJpg(arrayBuffer);
                } else if (file.type === 'image/png') {
                image = await pdfDoc.embedPng(arrayBuffer);
                } else {
                // 对于其他类型的图片，先转换为PNG
                const img = new Image();
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 创建一个Promise来等待图片加载
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = URL.createObjectURL(file);
                });
                
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                
                const pngData = await new Promise(resolve => {
                    canvas.toBlob(blob => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.readAsArrayBuffer(blob);
                    }, 'image/png');
                });
                
                image = await pdfDoc.embedPng(pngData);
            }
            
            // 添加页面
            const page = pdfDoc.addPage([width, height]);
            
            // 计算图片尺寸
            const imgDims = calculateImageDimensions(
                    image.width, 
                    image.height, 
                width - 2 * margin,
                height - 2 * margin,
                    imageFit
                );
                
            // 计算图片位置
            const x = (width - imgDims.width) / 2;
            const y = (height - imgDims.height) / 2;
                
                // 绘制图片
                page.drawImage(image, {
                    x,
                    y,
                width: imgDims.width,
                height: imgDims.height
            });
        }
        
        // 保存PDF
        const pdfBytes = await pdfDoc.save();
        
        // 下载PDF
        downloadFile(pdfBytes, 'converted_images.pdf', 'application/pdf');
        
        hideProcessing();
        showToast('图片转换为PDF完成');
    } catch (error) {
        console.error('转换图片为PDF时出错:', error);
        hideProcessing();
        showToast('转换失败: ' + error.message);
    }
}

// 计算图片尺寸
function calculateImageDimensions(imgWidth, imgHeight, maxWidth, maxHeight, fit) {
    let width, height;
    
    switch (fit) {
        case 'contain':
            // 保持宽高比，确保图片完全显示
            const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
            width = imgWidth * scale;
            height = imgHeight * scale;
            break;
            
        case 'cover':
            // 保持宽高比，填满整个区域
            const scaleCover = Math.max(maxWidth / imgWidth, maxHeight / imgHeight);
            width = imgWidth * scaleCover;
            height = imgHeight * scaleCover;
            break;
            
        case 'stretch':
            // 拉伸以填满整个区域
            width = maxWidth;
            height = maxHeight;
            break;
            
        case 'original':
            // 原始尺寸，但不超过最大尺寸
            width = Math.min(imgWidth, maxWidth);
            height = Math.min(imgHeight, maxHeight);
            
            // 如果原始尺寸超过了最大尺寸，按照contain方式缩放
            if (width < imgWidth || height < imgHeight) {
                const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
                width = imgWidth * scale;
                height = imgHeight * scale;
            }
            break;
    }
    
    return { width, height };
}

// 处理压缩PDF文件
async function handleCompressFile(files) {
    if (files.length !== 1) {
        showToast('请选择一个PDF文件');
        return;
    }
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
        showToast('请选择PDF文件');
        return;
    }
    
    // 显示PDF信息区域
    const pdfInfo = document.getElementById('compress-pdf-info');
    pdfInfo.style.display = 'block';
    
    // 存储当前文件引用
    pdfInfo.file = file;
    
    // 显示文件信息
    document.getElementById('compress-filename').textContent = file.name;
    document.getElementById('compress-filesize').textContent = formatFileSize(file.size);
    
    try {
        // 读取PDF获取页数
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        document.getElementById('compress-page-count').textContent = pdf.numPages;
    } catch (error) {
        console.error('读取PDF信息失败:', error);
        document.getElementById('compress-page-count').textContent = '无法读取';
    }
}

// 压缩PDF
async function compressPDF() {
    const pdfInfo = document.getElementById('compress-pdf-info');
    if (!pdfInfo.file) {
        showToast('请先选择PDF文件');
        return;
    }
    
    const file = pdfInfo.file;
    const compressLevel = document.getElementById('compress-level').value;
    const compressImages = document.getElementById('compress-images').checked;
    const removeMetadata = document.getElementById('remove-metadata').checked;
    
    showProcessing('正在压缩PDF...');
    
    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        
        // 这里我们使用pdf-lib库进行简单处理
        // 注意：浏览器端的PDF压缩功能有限，真正的压缩通常需要服务器端实现
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        
        // 如果需要移除元数据
        if (removeMetadata) {
            // 清空文档信息字典
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setKeywords('');
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
        }
        
        // PDF压缩选项
        const options = {
            useObjectStreams: true
        };
        
        // 保存压缩后的PDF
        const pdfBytes = await pdfDoc.save(options);
        
        // 计算压缩率
        const compressionRatio = (file.size - pdfBytes.length) / file.size * 100;
        const compressionInfo = `
            原始大小: ${formatFileSize(file.size)}<br>
            压缩后: ${formatFileSize(pdfBytes.length)}<br>
            压缩率: ${compressionRatio.toFixed(2)}%
        `;
        
        // 下载压缩后的PDF
        const fileName = file.name.replace('.pdf', '') + '_compressed.pdf';
        downloadFile(pdfBytes, fileName, 'application/pdf');
        
        hideProcessing();
        showToast('PDF压缩完成');
        
        // 显示压缩信息
        alert(`压缩完成!\n原始大小: ${formatFileSize(file.size)}\n压缩后: ${formatFileSize(pdfBytes.length)}\n压缩率: ${compressionRatio.toFixed(2)}%`);
    } catch (error) {
        console.error('压缩PDF时出错:', error);
        hideProcessing();
        showToast('压缩失败: ' + error.message);
    }
}

// 处理提取图片的文件
async function handleExtractFile(files) {
    if (files.length !== 1) {
        showToast('请选择一个PDF文件');
        return;
    }
    
    const file = files[0];
    if (file.type !== 'application/pdf') {
        showToast('请选择PDF文件');
        return;
    }
    
    // 显示PDF信息区域
    const pdfInfo = document.getElementById('extract-pdf-info');
    pdfInfo.style.display = 'block';
    
    // 存储当前文件引用
    pdfInfo.file = file;
    
    // 显示文件处理中状态
    const container = document.getElementById('extract-preview-container');
    container.innerHTML = '<div class="loading">读取PDF中，请稍候...</div>';
    
    try {
        // 读取PDF并显示预览
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
        // 清空预览容器
        container.innerHTML = '';
        
        // 提取前20页的预览
        const maxPages = Math.min(pdf.numPages, 20);
        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({scale: 0.2});
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // 创建缩略图
            const thumbnail = document.createElement('div');
            thumbnail.className = 'extract-thumbnail';
            thumbnail.innerHTML = `
                <img src="${canvas.toDataURL('image/jpeg')}" alt="Page ${i}">
                <div class="page-number">第 ${i} 页</div>
            `;
            
            container.appendChild(thumbnail);
        }
        
        // 如果页数超过20页，显示提示
        if (pdf.numPages > 20) {
            const morePages = document.createElement('div');
            morePages.className = 'more-pages';
            morePages.textContent = `...以及更多 ${pdf.numPages - 20} 页`;
            container.appendChild(morePages);
        }
        
    } catch (error) {
        console.error('读取PDF预览失败:', error);
        container.innerHTML = '<div class="error-message">无法加载PDF预览</div>';
    }
}

// 提取PDF中的图片
async function extractImages() {
    const pdfInfo = document.getElementById('extract-pdf-info');
    if (!pdfInfo.file) {
        showToast('请先选择PDF文件');
        return;
    }
    
    const file = pdfInfo.file;
    const imageFormat = document.getElementById('image-format').value;
    const jpegQuality = document.getElementById('jpeg-quality').value / 100;
    const extractAllPages = document.getElementById('extract-all-pages').checked;
    const pageRanges = extractAllPages ? null : document.getElementById('extract-page-ranges').value.trim();
    
    showProcessing('提取PDF中的图片...');
    
    try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const pdf = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
        // 确定要处理的页面范围
        let pagesToProcess = [];
        if (extractAllPages) {
            for (let i = 1; i <= pdf.numPages; i++) {
                pagesToProcess.push(i);
            }
        } else {
            if (!pageRanges) {
                hideProcessing();
                showToast('请输入页码范围');
                return;
            }
            
            pagesToProcess = parseExtractPageRanges(pageRanges, pdf.numPages);
            
            if (pagesToProcess.length === 0) {
                hideProcessing();
                showToast('没有有效的页码范围');
                return;
            }
        }
        
        // 创建ZIP文件
        const zip = new JSZip();
        let imageCount = 0;
        
        // 处理每一页
        for (let i = 0; i < pagesToProcess.length; i++) {
            const pageNum = pagesToProcess[i];
            updateProcessingInfo(`处理第 ${pageNum} 页 (${i + 1}/${pagesToProcess.length})`);
            
            const page = await pdf.getPage(pageNum);
            const viewport = page.getViewport({scale: 2.0}); // 使用较高分辨率
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // 将Canvas转换为图片
            let imageData;
            if (imageFormat === 'jpeg') {
                imageData = canvas.toDataURL('image/jpeg', jpegQuality);
            } else {
                imageData = canvas.toDataURL('image/png');
            }
            
            // 从DataURL提取二进制数据
            const base64Data = imageData.split(',')[1];
            zip.file(`page_${pageNum}.${imageFormat}`, base64Data, {base64: true});
            imageCount++;
        }
        
        // 生成并下载ZIP文件
        if (imageCount > 0) {
            const zipContent = await zip.generateAsync({type: 'blob'});
            const fileName = file.name.replace('.pdf', '') + `_extracted_images.zip`;
            downloadFile(zipContent, fileName, 'application/zip');
            
            hideProcessing();
            showToast(`成功提取 ${imageCount} 张图片`);
        } else {
            hideProcessing();
            showToast('没有图片可以提取');
        }
    } catch (error) {
        console.error('提取图片时出错:', error);
        hideProcessing();
        showToast('提取失败: ' + error.message);
    }
}

// 解析提取图片的页码范围
function parseExtractPageRanges(input, totalPages) {
    const pages = [];
    const parts = input.split(',');
    
    for (let part of parts) {
        part = part.trim();
        
        if (part.includes('-')) {
            // 范围，如 1-3
            const [start, end] = part.split('-').map(Number);
            
            if (!isNaN(start) && !isNaN(end) && start >= 1 && end <= totalPages && start <= end) {
                for (let i = start; i <= end; i++) {
                    if (!pages.includes(i)) {
                        pages.push(i);
                    }
                }
            }
        } else {
            // 单页，如 5
            const page = parseInt(part);
            
            if (!isNaN(page) && page >= 1 && page <= totalPages && !pages.includes(page)) {
                pages.push(page);
            }
        }
    }
    
    return pages;
}

// 清除函数
function clearSplitPDF() {
    document.getElementById('split-pdf-info').style.display = 'none';
    document.getElementById('pdf-preview-container').innerHTML = '';
    document.getElementById('split-file-input').value = '';
    document.getElementById('page-ranges').value = '';
    document.getElementById('single-page').value = '1';
}

function clearCompressPDF() {
    document.getElementById('compress-pdf-info').style.display = 'none';
    document.getElementById('compress-file-input').value = '';
}

function clearExtractPDF() {
    document.getElementById('extract-pdf-info').style.display = 'none';
    document.getElementById('extract-preview-container').innerHTML = '';
    document.getElementById('extract-file-input').value = '';
    document.getElementById('extract-page-ranges').value = '';
}

// 工具函数
function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function downloadFile(data, fileName, mimeType) {
    const blob = new Blob([data], {type: mimeType});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);
}

function showProcessing(message) {
    const overlay = document.getElementById('processing-overlay');
    const text = document.getElementById('processing-text');
    const info = document.getElementById('processing-info');
    
    text.textContent = message;
    info.textContent = '';
    overlay.style.display = 'flex';
}

function updateProcessingInfo(info) {
    const infoElement = document.getElementById('processing-info');
    if (infoElement) {
        infoElement.textContent = info;
    }
}

function hideProcessing() {
    document.getElementById('processing-overlay').style.display = 'none';
}

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