/**
 * 网页快照工具
 * 功能：捕获指定URL的网页快照，支持自定义设备类型、尺寸和格式
 */
class WebpageSnapshot {
    constructor() {
        // 配置
        this.apiBaseUrl = 'http://localhost:3000'; // 开发环境API地址
        this.useDummyData = true; // 是否使用模拟数据（无服务端时）
        
        // DOM元素
        this.urlInput = document.getElementById('urlInput');
        this.captureBtn = document.getElementById('captureBtn');
        this.toggleOptions = document.getElementById('toggleOptions');
        this.optionsContent = document.getElementById('optionsContent');
        this.deviceSelect = document.getElementById('deviceSelect');
        this.customDimensions = document.getElementById('customDimensions');
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.formatSelect = document.getElementById('formatSelect');
        this.fullPageCheckbox = document.getElementById('fullPageCheckbox');
        this.delaySelect = document.getElementById('delaySelect');
        this.statusSection = document.getElementById('statusSection');
        this.statusMessage = document.getElementById('statusMessage');
        this.progressBar = document.getElementById('progressBar');
        this.resultSection = document.getElementById('resultSection');
        this.resultImage = document.getElementById('resultImage');
        this.capturedUrl = document.getElementById('capturedUrl');
        this.captureTime = document.getElementById('captureTime');
        this.imageSize = document.getElementById('imageSize');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.shareBtn = document.getElementById('shareBtn');
        this.newCaptureBtn = document.getElementById('newCaptureBtn');
        this.historyItems = document.getElementById('historyItems');
        this.clearHistory = document.getElementById('clearHistory');
        
        // 当前快照数据
        this.currentSnapshot = null;
        
        // 设备预设尺寸
        this.devicePresets = {
            desktop: { width: 1920, height: 1080 },
            tablet: { width: 768, height: 1024 },
            mobile: { width: 375, height: 667 },
            custom: { width: 1920, height: 1080 }
        };
        
        // 初始化
        this.initEventListeners();
        this.loadHistory();
        
        // 检测API状态
        this.checkApiStatus();
    }
    
    /**
     * 检测API服务状态
     */
    async checkApiStatus() {
        if (this.useDummyData) return;
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/status`, { 
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors'
            });
            
            if (response.ok) {
                console.log('API服务正常运行');
            } else {
                console.warn('API服务响应异常，将使用模拟数据');
                this.useDummyData = true;
            }
        } catch (error) {
            console.warn('无法连接到API服务，将使用模拟数据', error);
            this.useDummyData = true;
        }
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 捕获按钮点击事件
        this.captureBtn.addEventListener('click', () => this.captureSnapshot());
        
        // URL输入框回车事件
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.captureSnapshot();
            }
        });
        
        // 切换选项显示
        this.toggleOptions.addEventListener('click', () => {
            this.optionsContent.classList.toggle('expanded');
            const isExpanded = this.optionsContent.classList.contains('expanded');
            this.toggleOptions.innerHTML = isExpanded 
                ? '<i class="ri-settings-3-line"></i> 隐藏选项'
                : '<i class="ri-settings-3-line"></i> 显示更多选项';
        });
        
        // 设备类型选择事件
        this.deviceSelect.addEventListener('change', () => {
            if (this.deviceSelect.value === 'custom') {
                this.customDimensions.style.display = 'grid';
            } else {
                this.customDimensions.style.display = 'none';
                const preset = this.devicePresets[this.deviceSelect.value];
                this.widthInput.value = preset.width;
                this.heightInput.value = preset.height;
            }
        });
        
        // 下载按钮点击事件
        this.downloadBtn.addEventListener('click', () => this.downloadSnapshot());
        
        // 复制按钮点击事件
        this.copyBtn.addEventListener('click', () => this.copySnapshotToClipboard());
        
        // 分享按钮点击事件
        this.shareBtn.addEventListener('click', () => this.shareSnapshot());
        
        // 新建快照按钮点击事件
        this.newCaptureBtn.addEventListener('click', () => {
            this.resultSection.style.display = 'none';
            this.urlInput.focus();
        });
        
        // 清空历史按钮点击事件
        this.clearHistory.addEventListener('click', () => this.clearHistoryData());
        
        // 示例URL点击事件
        document.querySelectorAll('.example-url').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.urlInput.value = link.dataset.url;
                this.captureSnapshot();
            });
        });
    }
    
    /**
     * 验证URL格式
     * @param {string} url - 要验证的URL
     * @returns {boolean} - URL是否有效
     */
    validateUrl(url) {
        if (!url) return false;
        
        // 如果URL没有协议前缀，添加https://
        if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
            this.urlInput.value = url;
        }
        
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * 捕获网页快照
     */
    async captureSnapshot() {
        const url = this.urlInput.value.trim();
        
        // 验证URL
        if (!this.validateUrl(url)) {
            this.showError('请输入有效的URL地址');
            return;
        }
        
        // 获取选项
        const options = this.getSnapshotOptions();
        
        // 显示状态
        this.showStatus(true);
        this.updateProgress(10, '正在连接服务器...');
        
        try {
            let snapshot;
            
            // 根据配置决定是使用API还是模拟数据
            if (this.useDummyData) {
                snapshot = await this.simulateSnapshotCapture(url, options);
            } else {
                snapshot = await this.captureSnapshotApi(url, options);
            }
            
            // 保存到历史记录
            this.saveToHistory(snapshot);
            
            // 显示结果
            this.showResult(snapshot);
            
        } catch (error) {
            this.showError('获取快照失败: ' + error.message);
            this.showStatus(false);
        }
    }
    
    /**
     * 通过API捕获网页快照
     * @param {string} url - 要捕获的URL
     * @param {Object} options - 捕获选项
     * @returns {Promise<Object>} - 快照数据
     */
    async captureSnapshotApi(url, options) {
        // 更新状态
        this.updateProgress(30, '服务器正在处理您的请求...');
        
        // 准备请求数据
        const requestData = {
            url,
            options
        };
        
        // 发送API请求
        const response = await fetch(`${this.apiBaseUrl}/api/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData),
            mode: 'cors'
        });
        
        // 检查响应状态
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '服务器错误');
        }
        
        // 解析响应数据
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '捕获失败');
        }
        
        // 格式化API返回的数据
        const snapshot = {
            id: data.id,
            url: data.url,
            title: data.title,
            timestamp: data.timestamp,
            imageUrl: this.apiBaseUrl + data.imageUrl,
            width: data.width,
            height: data.height,
            options: data.options
        };
        
        this.updateProgress(100, '完成！');
        
        return snapshot;
    }
    
    /**
     * 获取快照选项
     * @returns {Object} - 快照选项
     */
    getSnapshotOptions() {
        const deviceType = this.deviceSelect.value;
        let width, height;
        
        if (deviceType === 'custom') {
            width = parseInt(this.widthInput.value) || 1920;
            height = parseInt(this.heightInput.value) || 1080;
        } else {
            const preset = this.devicePresets[deviceType];
            width = preset.width;
            height = preset.height;
        }
        
        return {
            deviceType,
            width,
            height,
            format: this.formatSelect.value,
            fullPage: this.fullPageCheckbox.checked,
            delay: parseInt(this.delaySelect.value) || 0
        };
    }
    
    /**
     * 显示错误信息
     * @param {string} message - 错误信息
     */
    showError(message) {
        // 创建错误提示元素
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        
        // 添加到DOM
        document.querySelector('.input-section').appendChild(errorEl);
        
        // 2秒后移除
        setTimeout(() => {
            errorEl.classList.add('fadeOut');
            setTimeout(() => errorEl.remove(), 300);
        }, 3000);
    }
    
    /**
     * 显示/隐藏状态区域
     * @param {boolean} show - 是否显示
     */
    showStatus(show) {
        this.statusSection.style.display = show ? 'flex' : 'none';
        this.resultSection.style.display = 'none';
    }
    
    /**
     * 更新进度条和状态信息
     * @param {number} progress - 进度百分比（0-100）
     * @param {string} message - 状态信息
     */
    updateProgress(progress, message) {
        this.progressBar.style.width = `${progress}%`;
        this.statusMessage.textContent = message;
    }
    
    /**
     * 模拟捕获快照过程（无服务端时使用）
     * @param {string} url - 要捕获的URL
     * @param {Object} options - 捕获选项
     * @returns {Promise} - 完成后的Promise
     */
    simulateSnapshotCapture(url, options) {
        return new Promise((resolve, reject) => {
            // 模拟不同阶段的加载进度
            setTimeout(() => {
                this.updateProgress(30, '正在加载网页...');
                
                setTimeout(() => {
                    this.updateProgress(50, '正在渲染页面...');
                    
                    setTimeout(() => {
                        this.updateProgress(70, '正在捕获快照...');
                        
                        setTimeout(() => {
                            this.updateProgress(90, '正在处理图像...');
                            
                            setTimeout(() => {
                                this.updateProgress(100, '完成！');
                                
                                // 创建模拟快照数据
                                const snapshot = {
                                    id: Date.now(),
                                    url: url,
                                    title: this.extractDomain(url),
                                    timestamp: new Date().toISOString(),
                                    imageUrl: this.generateDummyImage(url, options),
                                    width: options.width,
                                    height: options.fullPage ? options.height * 3 : options.height,
                                    options: options
                                };
                                
                                // 存储当前快照
                                this.currentSnapshot = snapshot;
                                
                                resolve(snapshot);
                            }, 500);
                        }, 700);
                    }, 800);
                }, 500);
            }, 300);
        });
    }
    
    /**
     * 提取域名
     * @param {string} url - URL
     * @returns {string} - 域名
     */
    extractDomain(url) {
        try {
            const domain = new URL(url).hostname;
            return domain.replace(/^www\./, '');
        } catch (e) {
            return url;
        }
    }
    
    /**
     * 生成模拟快照图像
     * @param {string} url - 捕获的URL
     * @param {Object} options - 捕获选项
     * @returns {string} - 图像URL
     */
    generateDummyImage(url, options) {
        // 在实际应用中，这里应该是服务器返回的图像URL
        // 这里使用一个占位图像进行演示
        const domain = this.extractDomain(url);
        const placeholderUrl = `https://via.placeholder.com/${options.width}x${options.height}/4c6ef5/ffffff`;
        
        return placeholderUrl + `?text=${domain}`;
    }
    
    /**
     * 显示快照结果
     * @param {Object} snapshot - 快照数据
     */
    showResult(snapshot) {
        // 存储当前快照
        this.currentSnapshot = snapshot;
        
        // 隐藏状态区域，显示结果区域
        this.statusSection.style.display = 'none';
        this.resultSection.style.display = 'block';
        
        // 设置图像和信息
        this.resultImage.src = snapshot.imageUrl;
        this.capturedUrl.textContent = snapshot.url;
        this.captureTime.textContent = new Date(snapshot.timestamp).toLocaleString();
        this.imageSize.textContent = `${snapshot.width} x ${snapshot.height} px`;
        
        // 滚动到结果区域
        this.resultSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * 下载快照图像
     */
    async downloadSnapshot() {
        if (!this.currentSnapshot) return;
        
        try {
            // 如果是使用实际API，直接下载服务器上的图像
            if (!this.useDummyData && !this.currentSnapshot.imageUrl.includes('placeholder')) {
                window.open(this.currentSnapshot.imageUrl, '_blank');
                return;
            }
            
            // 对于模拟数据或特殊情况，使用Fetch API下载
            this.updateProgress(50, '正在准备下载...');
            this.showStatus(true);
            
            const response = await fetch(this.currentSnapshot.imageUrl);
            const blob = await response.blob();
            
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            const format = this.currentSnapshot.options.format || 'png';
            
            a.href = url;
            a.download = `snapshot-${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            a.remove();
            
            this.showStatus(false);
            this.resultSection.style.display = 'block';
            
        } catch (error) {
            console.error('下载失败:', error);
            this.showError('下载失败: ' + error.message);
            this.showStatus(false);
            this.resultSection.style.display = 'block';
        }
    }
    
    /**
     * 复制快照到剪贴板
     */
    async copySnapshotToClipboard() {
        if (!this.currentSnapshot) return;
        
        try {
            // 显示加载状态
            this.updateProgress(50, '正在复制到剪贴板...');
            this.showStatus(true);
            
            // 获取图像数据
            const response = await fetch(this.currentSnapshot.imageUrl);
            const blob = await response.blob();
            
            // 尝试使用Clipboard API复制图像
            try {
                await navigator.clipboard.write([
                    new ClipboardItem({
                        [blob.type]: blob
                    })
                ]);
                
                alert('快照已复制到剪贴板');
            } catch (clipboardError) {
                // 如果Clipboard API失败，使用Canvas方法
                console.warn('Clipboard API失败，尝试替代方法', clipboardError);
                
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // 提示用户手动复制
                    canvas.toBlob(blob => {
                        // 创建临时元素显示图像
                        const div = document.createElement('div');
                        div.style.position = 'fixed';
                        div.style.top = '0';
                        div.style.left = '0';
                        div.style.width = '100%';
                        div.style.height = '100%';
                        div.style.background = 'rgba(0,0,0,0.8)';
                        div.style.zIndex = '9999';
                        div.style.display = 'flex';
                        div.style.flexDirection = 'column';
                        div.style.alignItems = 'center';
                        div.style.justifyContent = 'center';
                        div.style.padding = '20px';
                        
                        const imgEl = document.createElement('img');
                        imgEl.src = URL.createObjectURL(blob);
                        imgEl.style.maxWidth = '90%';
                        imgEl.style.maxHeight = '80%';
                        imgEl.style.objectFit = 'contain';
                        imgEl.style.marginBottom = '20px';
                        
                        const p = document.createElement('p');
                        p.textContent = '右键点击图像并选择"复制图像"，完成后单击此处关闭';
                        p.style.color = 'white';
                        p.style.textAlign = 'center';
                        
                        div.appendChild(imgEl);
                        div.appendChild(p);
                        
                        div.addEventListener('click', () => {
                            document.body.removeChild(div);
                        });
                        
                        document.body.appendChild(div);
                    });
                };
                
                img.src = URL.createObjectURL(blob);
            }
            
            // 恢复UI状态
            this.showStatus(false);
            this.resultSection.style.display = 'block';
            
        } catch (err) {
            console.error('复制到剪贴板失败:', err);
            this.showError('复制快照失败，您的浏览器可能不支持此功能');
            this.showStatus(false);
            this.resultSection.style.display = 'block';
        }
    }
    
    /**
     * 分享快照
     */
    async shareSnapshot() {
        if (!this.currentSnapshot) return;
        
        // 检查分享API是否可用
        if (navigator.share) {
            try {
                // 显示加载状态
                this.updateProgress(50, '准备分享...');
                this.showStatus(true);
                
                // 获取图像blob
                const response = await fetch(this.currentSnapshot.imageUrl);
                const blob = await response.blob();
                const file = new File([blob], `snapshot-${Date.now()}.${this.currentSnapshot.options.format || 'png'}`, { type: blob.type });
                
                // 分享
                await navigator.share({
                    title: '网页快照',
                    text: `${this.currentSnapshot.url} 的网页快照`,
                    files: [file]
                });
                
                // 恢复UI状态
                this.showStatus(false);
                this.resultSection.style.display = 'block';
                
            } catch (err) {
                console.error('分享失败:', err);
                
                // 如果错误是由用户取消引起的，不显示错误
                if (err.name !== 'AbortError') {
                    this.showError('分享失败: ' + (err.message || '未知错误'));
                }
                
                this.showStatus(false);
                this.resultSection.style.display = 'block';
            }
        } else {
            alert('您的浏览器不支持分享功能');
        }
    }
    
    /**
     * 保存快照到历史记录
     * @param {Object} snapshot - 快照数据
     */
    saveToHistory(snapshot) {
        // 获取现有历史记录
        let history = this.getHistory();
        
        // 添加新快照到历史记录
        history.unshift(snapshot);
        
        // 限制历史记录数量（最多保存10条）
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        // 保存到本地存储
        localStorage.setItem('webpage-snapshots', JSON.stringify(history));
        
        // 更新历史记录UI
        this.updateHistoryUI(history);
    }
    
    /**
     * 获取历史记录
     * @returns {Array} - 历史记录数组
     */
    getHistory() {
        const historyData = localStorage.getItem('webpage-snapshots');
        return historyData ? JSON.parse(historyData) : [];
    }
    
    /**
     * 加载历史记录
     */
    loadHistory() {
        const history = this.getHistory();
        this.updateHistoryUI(history);
    }
    
    /**
     * 更新历史记录UI
     * @param {Array} history - 历史记录数组
     */
    updateHistoryUI(history) {
        // 清空历史记录容器
        this.historyItems.innerHTML = '';
        
        if (history.length === 0) {
            // 显示空历史记录提示
            const emptyEl = document.createElement('div');
            emptyEl.className = 'empty-history';
            emptyEl.textContent = '暂无历史记录';
            this.historyItems.appendChild(emptyEl);
            return;
        }
        
        // 添加历史记录项
        history.forEach(snapshot => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = snapshot.id;
            
            // 创建预览图
            const preview = document.createElement('div');
            preview.className = 'history-item-preview';
            const img = document.createElement('img');
            img.src = snapshot.imageUrl;
            img.alt = '快照预览';
            preview.appendChild(img);
            
            // 创建信息区域
            const info = document.createElement('div');
            info.className = 'history-item-info';
            
            const urlEl = document.createElement('div');
            urlEl.className = 'history-item-url';
            urlEl.textContent = this.extractDomain(snapshot.url);
            
            const timeEl = document.createElement('div');
            timeEl.className = 'history-item-time';
            timeEl.textContent = new Date(snapshot.timestamp).toLocaleString();
            
            info.appendChild(urlEl);
            info.appendChild(timeEl);
            
            // 组合元素
            historyItem.appendChild(preview);
            historyItem.appendChild(info);
            
            // 添加点击事件
            historyItem.addEventListener('click', () => {
                this.currentSnapshot = snapshot;
                this.showResult(snapshot);
            });
            
            // 添加到容器
            this.historyItems.appendChild(historyItem);
        });
    }
    
    /**
     * 清空历史记录
     */
    clearHistoryData() {
        if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
            localStorage.removeItem('webpage-snapshots');
            this.updateHistoryUI([]);
        }
    }
}

// 当DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    window.webpageSnapshot = new WebpageSnapshot();
    
    // 添加CSS样式，用于错误提示
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            background-color: #ff3860;
            color: white;
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            animation: fadeIn 0.3s ease;
            transition: opacity 0.3s ease;
        }
        
        .error-message.fadeOut {
            opacity: 0;
        }
    `;
    document.head.appendChild(style);
}); 