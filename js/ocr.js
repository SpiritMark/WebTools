/**
 * OCR文字识别工具 JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const imageInput = document.getElementById('imageInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const cameraBtn = document.getElementById('cameraBtn');
    const uploadContainer = document.getElementById('uploadContainer');
    const previewContainer = document.getElementById('previewContainer');
    const imagePreview = document.getElementById('imagePreview');
    const previewLoading = document.getElementById('previewLoading');
    const changeImageBtn = document.getElementById('changeImageBtn');
    const recognizeBtn = document.getElementById('recognizeBtn');
    const resultText = document.getElementById('resultText');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const clearBtn = document.getElementById('clearBtn');
    const languageSelect = document.getElementById('languageSelect');
    const accuracySelect = document.getElementById('accuracySelect');
    const layoutAnalysisToggle = document.getElementById('layoutAnalysisToggle');
    const autoCorrectToggle = document.getElementById('autoCorrectToggle');
    const recognitionTime = document.getElementById('recognitionTime');
    const charCount = document.getElementById('charCount');
    const lineCount = document.getElementById('lineCount');
    const cameraModal = document.getElementById('cameraModal');
    const closeCameraModal = document.getElementById('closeCameraModal');
    const cameraVideo = document.getElementById('cameraVideo');
    const cameraCanvas = document.getElementById('cameraCanvas');
    const takePictureBtn = document.getElementById('takePictureBtn');
    const switchCameraBtn = document.getElementById('switchCameraBtn');

    // 工作状态
    let currentImage = null;
    let isProcessing = false;
    let worker = null;
    let stream = null;
    let facingMode = 'environment'; // 默认使用后置摄像头
    let languageLoaded = false; // 跟踪语言包加载状态
    let tempCanvas = document.createElement('canvas'); // 用于图像预处理
    let initRetryCount = 0; // 记录初始化重试次数
    let initializingWorker = false; // 标记Worker是否正在初始化中

    // 初始化Tesseract Worker
    initWorker();

    // 事件监听
    uploadBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', handleFileSelect);
    changeImageBtn.addEventListener('click', resetUpload);
    recognizeBtn.addEventListener('click', startOCR);
    copyBtn.addEventListener('click', copyText);
    downloadBtn.addEventListener('click', downloadText);
    clearBtn.addEventListener('click', clearResult);
    cameraBtn.addEventListener('click', openCamera);
    closeCameraModal.addEventListener('click', closeCamera);
    takePictureBtn.addEventListener('click', takePicture);
    switchCameraBtn.addEventListener('click', switchCamera);
    languageSelect.addEventListener('change', preloadLanguage);

    // 添加重试按钮监听
    document.addEventListener('click', function(e) {
        if (e.target.closest('.retry-worker-btn')) {
            initWorker();
        }
    });

    // 拖放功能
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    // 初始化Tesseract Worker并预加载语言
    async function initWorker() {
        if (initializingWorker) {
            showNotification('提示', 'OCR引擎正在初始化中，请稍候...', 'info');
            return;
        }
        
        initializingWorker = true;
        
        try {
            // 禁用识别按钮并显示加载中状态
            recognizeBtn.disabled = true;
            recognizeBtn.innerHTML = '<i class="ri-loader-2-line"></i> 初始化中...';
            
            showNotification('提示', 'OCR引擎初始化中，这可能需要几秒钟...', 'info');
            
            // 检查是否已存在worker并终止
            if (worker) {
                await worker.terminate();
                worker = null;
            }
            
            // 创建带有更多日志的worker
            worker = await Tesseract.createWorker({
                logger: m => {
                    console.log(m);
                    
                    // 显示下载进度
                    if (m.status === 'loading tesseract core' || m.status.includes('loading')) {
                        const progress = m.progress * 100;
                        recognizeBtn.innerHTML = `<i class="ri-loader-2-line"></i> 加载中 ${progress.toFixed(0)}%`;
                    }
                }
            });
            
            // 恢复按钮状态
            recognizeBtn.disabled = false;
            recognizeBtn.innerHTML = '<i class="ri-scan-line"></i> 开始识别';
            
            console.log('Tesseract worker初始化成功');
            showNotification('成功', 'OCR引擎初始化完成', 'success');
            
            // 重置重试计数
            initRetryCount = 0;
            
            // 预加载默认语言
            preloadLanguage();
        } catch (error) {
            console.error('Tesseract worker初始化失败:', error);
            
            // 恢复按钮状态但显示错误
            recognizeBtn.disabled = false;
            recognizeBtn.innerHTML = '<i class="ri-error-warning-line"></i> 引擎加载失败';
            
            // 错误显示和重试选项
            initRetryCount++;
            const errorDetail = error.toString().substring(0, 150);
            let errorMsg = `OCR引擎初始化失败 (尝试 ${initRetryCount}/3)`;
            
            if (navigator.onLine === false) {
                errorMsg = '网络连接已断开，请检查您的网络连接后重试';
            } else if (error.message && error.message.includes('Failed to fetch')) {
                errorMsg = 'Tesseract模型下载失败，请检查网络连接';
            } else if (error.name === 'NotSupportedError') {
                errorMsg = '您的浏览器不支持WebAssembly，请更新或更换浏览器';
            }
            
            const notification = document.createElement('div');
            notification.className = `notification notification-error`;
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-icon">
                        <i class="ri-error-warning-line"></i>
                    </div>
                    <div class="notification-text">
                        <h4>初始化失败</h4>
                        <p>${errorMsg}</p>
                        <p class="error-details">${errorDetail}</p>
                        <button class="btn btn-small retry-worker-btn">
                            <i class="ri-refresh-line"></i> 重试
                        </button>
                    </div>
                </div>
                <button class="notification-close"><i class="ri-close-line"></i></button>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            const closeBtn = notification.querySelector('.notification-close');
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            });
            
            // 自动重试（最多3次）
            if (initRetryCount < 3) {
                setTimeout(() => {
                    initializingWorker = false;
                    initWorker();
                }, 3000);
            }
        } finally {
            initializingWorker = false;
        }
    }

    // 预加载选择的语言
    async function preloadLanguage() {
        if (!worker) {
            showNotification('错误', 'OCR引擎尚未准备好，请先等待引擎初始化完成或点击重试', 'error');
            return;
        }
        
        const language = languageSelect.value;
        languageLoaded = false;
        
        // 禁用识别按钮
        recognizeBtn.disabled = true;
        recognizeBtn.innerHTML = `<i class="ri-loader-2-line"></i> 加载${getLanguageName(language)}中...`;
        
        try {
            showNotification('提示', `正在加载${getLanguageName(language)}语言包，首次加载可能需要一些时间`, 'info');
            await worker.loadLanguage(language);
            await worker.initialize(language);
            languageLoaded = true;
            console.log(`语言包${language}加载成功`);
            
            // 恢复按钮状态
            recognizeBtn.disabled = false;
            recognizeBtn.innerHTML = '<i class="ri-scan-line"></i> 开始识别';
        } catch (error) {
            console.error('语言包加载失败:', error);
            
            // 恢复按钮状态
            recognizeBtn.disabled = false;
            recognizeBtn.innerHTML = '<i class="ri-scan-line"></i> 开始识别';
            
            // 显示更详细的错误
            let errorMsg = `${getLanguageName(language)}语言包加载失败`;
            if (navigator.onLine === false) {
                errorMsg += '，网络连接已断开';
            } else if (error.message && error.message.includes('Failed to fetch')) {
                errorMsg += '，无法下载语言模型，请检查网络';
            }
            
            showNotification('错误', errorMsg, 'error');
        }
    }

    // 获取语言名称
    function getLanguageName(code) {
        const languages = {
            'auto': '自动检测',
            'chi_sim': '中文(简体)',
            'chi_tra': '中文(繁体)',
            'eng': '英文',
            'jpn': '日文',
            'kor': '韩文',
            'fra': '法文',
            'deu': '德文',
            'rus': '俄文',
            'spa': '西班牙文'
        };
        return languages[code] || code;
    }

    // 处理文件选择
    function handleFileSelect(e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    }

    // 处理文件
    function handleFile(file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showNotification('错误', '请上传图片文件', 'error');
            return;
        }
        
        // 检查文件大小（限制5MB）
        if (file.size > 5 * 1024 * 1024) {
            showNotification('错误', '图片大小不能超过5MB', 'error');
            return;
        }
        
        // 创建文件预览
        const reader = new FileReader();
        reader.onload = function(e) {
            currentImage = e.target.result;
            imagePreview.src = currentImage;
            uploadContainer.style.display = 'none';
            previewContainer.style.display = 'block';
            resultText.value = '';
            updateStats(0, 0, 0);
            
            // 如果语言尚未加载，尝试预加载
            if (!languageLoaded) {
                preloadLanguage();
            }
        };
        reader.readAsDataURL(file);
    }

    // 重置上传
    function resetUpload() {
        imageInput.value = '';
        uploadContainer.style.display = 'block';
        previewContainer.style.display = 'none';
        currentImage = null;
    }

    // 图像预处理函数
    function preprocessImage(imageData) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = function() {
                // 设置Canvas尺寸
                tempCanvas.width = img.width;
                tempCanvas.height = img.height;
                const ctx = tempCanvas.getContext('2d');
                
                // 绘制原始图像
                ctx.drawImage(img, 0, 0, img.width, img.height);
                
                // 获取图像数据
                let imageData = ctx.getImageData(0, 0, img.width, img.height);
                let data = imageData.data;
                
                // 应用多种增强技术
                // 1. 增强对比度和锐化
                const accuracy = accuracySelect.value;
                
                if (accuracy === 'best') {
                    // 二值化处理（适用于文档）
                    const threshold = otsuThreshold(data);
                    for (let i = 0; i < data.length; i += 4) {
                        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                        const val = avg > threshold ? 255 : 0;
                        data[i] = data[i + 1] = data[i + 2] = val;
                    }
                } else {
                    // 增强对比度
                    const contrast = 1.2; // 对比度增强比例
                    for (let i = 0; i < data.length; i += 4) {
                        // 对比度调整
                        data[i] = Math.min(255, Math.max(0, ((data[i] / 255 - 0.5) * contrast + 0.5) * 255));
                        data[i+1] = Math.min(255, Math.max(0, ((data[i+1] / 255 - 0.5) * contrast + 0.5) * 255));
                        data[i+2] = Math.min(255, Math.max(0, ((data[i+2] / 255 - 0.5) * contrast + 0.5) * 255));
                    }
                }
                
                // 更新处理后的图像数据
                ctx.putImageData(imageData, 0, 0);
                
                // 返回处理后的图像数据URL
                resolve(tempCanvas.toDataURL('image/png'));
            };
            
            img.onerror = function() {
                reject(new Error('图像加载失败'));
            };
            
            img.src = imageData;
        });
    }
    
    // Otsu算法计算最佳二值化阈值
    function otsuThreshold(data) {
        // 计算直方图
        const histogram = Array(256).fill(0);
        let pixelCount = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const avg = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
            histogram[avg]++;
            pixelCount++;
        }
        
        let sum = 0;
        for (let i = 0; i < 256; i++) {
            sum += i * histogram[i];
        }
        
        let sumB = 0;
        let wB = 0;
        let wF = 0;
        let maxVariance = 0;
        let threshold = 0;
        
        for (let i = 0; i < 256; i++) {
            wB += histogram[i];
            if (wB === 0) continue;
            
            wF = pixelCount - wB;
            if (wF === 0) break;
            
            sumB += i * histogram[i];
            
            const mB = sumB / wB;
            const mF = (sum - sumB) / wF;
            
            const variance = wB * wF * (mB - mF) * (mB - mF);
            
            if (variance > maxVariance) {
                maxVariance = variance;
                threshold = i;
            }
        }
        
        return threshold;
    }

    // 开始OCR识别
    async function startOCR() {
        if (!currentImage) {
            showNotification('提示', '请先上传或拍摄一张图片', 'info');
            return;
        }
        
        if (isProcessing) {
            showNotification('提示', '识别正在进行中，请稍候', 'info');
            return;
        }
        
        if (!worker) {
            showNotification('错误', 'OCR引擎尚未准备好，正在尝试重新初始化...', 'error');
            // 自动尝试初始化
            initWorker();
            return;
        }
        
        if (!languageLoaded) {
            showNotification('提示', '语言模型正在加载中，请稍候几秒后再试', 'info');
            preloadLanguage();
            return;
        }
        
        isProcessing = true;
        previewLoading.classList.add('active');
        resultText.value = '正在识别中，请稍候...';
        recognizeBtn.disabled = true;
        recognizeBtn.innerHTML = '<i class="ri-loader-4-line"></i> 识别中...';
        
        const startTime = performance.now();
        const language = languageSelect.value;
        const accuracyMode = accuracySelect.value;
        
        try {
            // 根据精度模式设置Tesseract选项
            let engineMode = 3; // 默认标准模式
            if (accuracyMode === 'fast') engineMode = 2;
            if (accuracyMode === 'best') engineMode = 4;
            
            // 设置识别参数
            await worker.setParameters({
                tessedit_ocr_engine_mode: engineMode,
                preserve_interword_spaces: '1',
                textord_tabfind_vertical_text: '1',
                tessedit_char_whitelist: '', // 空白列表表示不限制字符
                tessjs_create_hocr: '0',
                tessjs_create_tsv: '0',
                tessjs_create_box: '0',
                tessjs_create_unlv: '0',
                tessjs_create_osd: '0',
                // 中文识别优化参数
                textord_heavy_nr: language.startsWith('chi') ? '1' : '0', // 针对中文的噪声去除
                segment_segcost_rating: language.startsWith('chi') ? '2' : '1', // 提高分割准确度
                language_model_ngram_on: '1',
                textord_force_make_prop_words: '0',
                edges_max_children_per_outline: '40'
            });
            
            // 图像预处理
            const processedImage = await preprocessImage(currentImage);
            
            // 开始识别
            const result = await worker.recognize(processedImage);
            
            // 计算识别时间
            const endTime = performance.now();
            const timeSpent = ((endTime - startTime) / 1000).toFixed(2);
            
            // 处理识别结果
            let text = result.data.text;
            
            // 如果启用了自动校正
            if (autoCorrectToggle.checked) {
                text = autoCorrect(text, language);
            }
            
            // 显示结果
            resultText.value = text;
            
            // 更新统计信息
            const chars = text.replace(/\s/g, '').length;
            const lines = text.split('\n').length;
            updateStats(timeSpent, chars, lines);
            
            showNotification('成功', '文字识别完成', 'success');
        } catch (error) {
            console.error('OCR识别失败:', error);
            
            let errorMsg = '文字识别失败，请重试';
            if (error.message) {
                if (error.message.includes('memory')) {
                    errorMsg = '内存不足，请尝试使用较小的图片或选择快速模式';
                } else if (error.message.includes('network') || error.message.includes('fetch')) {
                    errorMsg = '网络错误，请检查您的网络连接';
                }
            }
            
            resultText.value = '识别失败：' + errorMsg;
            showNotification('错误', errorMsg, 'error');
            
            // 如果是因为worker问题，尝试重新初始化
            if (error.message && (error.message.includes('worker') || error.message.includes('terminated'))) {
                setTimeout(() => {
                    initWorker();
                }, 1000);
            }
        } finally {
            isProcessing = false;
            previewLoading.classList.remove('active');
            recognizeBtn.disabled = false;
            recognizeBtn.innerHTML = '<i class="ri-scan-line"></i> 开始识别';
        }
    }

    // 自动校正文本
    function autoCorrect(text, language) {
        // 去除多余空行
        text = text.replace(/\n{3,}/g, '\n\n');
        
        // 去除行首空格
        text = text.replace(/^\s+/gm, '');
        
        // 根据不同语言应用不同的校正规则
        if (language.startsWith('chi')) { // 中文校正规则
            // 常见中文OCR错误修正
            const zhCorrections = {
                '口': '口',
                '囗': '口',
                '曰': '日',
                '夂': '夕',
                '貝': '贝',
                '見': '见',
                '兌': '兑',
                '東': '东',
                '車': '车',
                '長': '长',
                '馬': '马',
                '為': '为',
                '這': '这',
                '個': '个',
                '們': '们',
                '後': '后',
                '與': '与',
                '時': '时',
                '實': '实',
                '發': '发',
                '電': '电',
                '權': '权',
                '無': '无',
                '來': '来',
                '問': '问',
                '幾': '几'
            };
            
            for (const [wrong, correct] of Object.entries(zhCorrections)) {
                text = text.replace(new RegExp(wrong, 'g'), correct);
            }
            
            // 修复数字与中文之间的间隔
            text = text.replace(/(\d)([一-龥])/g, '$1 $2');
            text = text.replace(/([一-龥])(\d)/g, '$1 $2');
        } else if (language === 'eng') { // 英文校正规则
            const engCorrections = {
                'l\\b': 'I',
                '0': 'O',
                '\\bI\\b': 'I',
                '\\bl\\b': 'I',
                'rnrn': 'mm',
                'rn': 'm',
                'ii': 'n',
                'ii': 'n',
                '\\.\\s*-\\s*': '.-',
                'vv': 'w'
            };
            
            for (const [pattern, replacement] of Object.entries(engCorrections)) {
                text = text.replace(new RegExp(pattern, 'g'), replacement);
            }
        }
        
        // 通用校正
        text = text.replace(/\s{2,}/g, ' '); // 连续多个空格替换为单个
        
        return text;
    }

    // 更新统计信息
    function updateStats(time, chars, lines) {
        recognitionTime.textContent = time;
        charCount.textContent = chars;
        lineCount.textContent = lines;
    }

    // 复制文本
    function copyText() {
        const text = resultText.value;
        if (!text) return;
        
        navigator.clipboard.writeText(text)
            .then(() => {
                showNotification('成功', '文本已复制到剪贴板', 'success');
            })
            .catch(() => {
                showNotification('错误', '复制失败，请手动选择并复制文本', 'error');
            });
    }

    // 下载文本
    function downloadText() {
        const text = resultText.value;
        if (!text) return;
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ocr-result.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('成功', '文本已下载', 'success');
    }

    // 清空结果
    function clearResult() {
        resultText.value = '';
        updateStats(0, 0, 0);
    }

    // 打开摄像头
    async function openCamera() {
        cameraModal.classList.add('active');
        
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            cameraVideo.srcObject = stream;
        } catch (error) {
            console.error('摄像头访问失败:', error);
            showNotification('错误', '无法访问摄像头', 'error');
            closeCamera();
        }
    }

    // 关闭摄像头
    function closeCamera() {
        cameraModal.classList.remove('active');
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    // 切换前后置摄像头
    async function switchCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        facingMode = facingMode === 'user' ? 'environment' : 'user';
        
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facingMode }
            });
            cameraVideo.srcObject = stream;
        } catch (error) {
            console.error('切换摄像头失败:', error);
            showNotification('错误', '切换摄像头失败', 'error');
        }
    }

    // 拍照
    function takePicture() {
        if (!stream) return;
        
        const ctx = cameraCanvas.getContext('2d');
        
        // 调整Canvas大小以匹配视频流
        cameraCanvas.width = cameraVideo.videoWidth;
        cameraCanvas.height = cameraVideo.videoHeight;
        
        // 将视频帧绘制到Canvas
        ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);
        
        // 获取图像数据
        currentImage = cameraCanvas.toDataURL('image/png');
        
        // 设置预览
        imagePreview.src = currentImage;
        uploadContainer.style.display = 'none';
        previewContainer.style.display = 'block';
        
        // 关闭摄像头
        closeCamera();
    }

    // 显示通知
    function showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="ri-${type === 'success' ? 'checkbox-circle-line' : type === 'error' ? 'error-warning-line' : 'information-line'}"></i>
                </div>
                <div class="notification-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
            </div>
            <button class="notification-close"><i class="ri-close-line"></i></button>
        `;
        
        document.body.appendChild(notification);
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 添加关闭按钮事件
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        });
        
        // 自动关闭
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
    }

    // 添加通知样式
    function addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 300px;
                background-color: var(--card-bg);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(120%);
                transition: transform 0.3s ease;
                z-index: 1100;
                overflow: hidden;
                padding: 15px;
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
            }
            
            .notification.show {
                transform: translateX(0);
            }
            
            .notification-success {
                border-left: 4px solid #4caf50;
            }
            
            .notification-error {
                border-left: 4px solid #f44336;
            }
            
            .notification-info {
                border-left: 4px solid #2196f3;
            }
            
            .notification-content {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                flex: 1;
            }
            
            .notification-icon {
                font-size: 1.5rem;
            }
            
            .notification-success .notification-icon {
                color: #4caf50;
            }
            
            .notification-error .notification-icon {
                color: #f44336;
            }
            
            .notification-info .notification-icon {
                color: #2196f3;
            }
            
            .notification-text h4 {
                margin: 0;
                font-size: 1rem;
                margin-bottom: 5px;
            }
            
            .notification-text p {
                margin: 0;
                font-size: 0.85rem;
                color: var(--text-secondary);
            }
            
            .notification-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                color: var(--text-secondary);
                cursor: pointer;
                padding: 0;
                margin-left: 10px;
            }
            
            .error-details {
                font-size: 0.75rem !important;
                margin-top: 5px !important;
                color: #888 !important;
                word-break: break-word;
            }
            
            .btn-small {
                font-size: 0.8rem;
                padding: 4px 8px;
                margin-top: 8px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 4px;
            }
            
            .btn-small:hover {
                background-color: var(--primary-hover);
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            .ri-loader-2-line, .ri-loader-4-line {
                animation: spin 1s linear infinite;
                display: inline-block;
            }
        `;
        document.head.appendChild(style);
    }

    // 初始化通知样式
    addNotificationStyles();

    // 页面关闭前释放资源
    window.addEventListener('beforeunload', () => {
        if (worker) {
            worker.terminate();
        }
        
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    });
}); 