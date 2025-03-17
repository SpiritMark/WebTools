document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const uploadContainer = document.getElementById('uploadContainer');
    const uploadArea = document.getElementById('uploadArea');
    const editorContainer = document.getElementById('editorContainer');
    const videoInput = document.getElementById('videoInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const importSubtitleBtn = document.getElementById('importSubtitleBtn');
    const subtitleInput = document.getElementById('subtitleInput');
    const previewVideo = document.getElementById('previewVideo');
    const subtitleDisplay = document.getElementById('subtitleDisplay');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineProgress = document.getElementById('timelineProgress');
    const subtitleMarkers = document.getElementById('subtitleMarkers');
    const timeDisplay = document.getElementById('timeDisplay');
    const backwardBtn = document.getElementById('backwardBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const addSubtitleBtn = document.getElementById('addSubtitleBtn');
    const syncSubtitleBtn = document.getElementById('syncSubtitleBtn');
    const subtitleList = document.getElementById('subtitleList');
    const subtitleStartTime = document.getElementById('subtitleStartTime');
    const subtitleEndTime = document.getElementById('subtitleEndTime');
    const subtitleText = document.getElementById('subtitleText');
    const setCurrentTimeBtn = document.getElementById('setCurrentTimeBtn');
    const previewSubtitleBtn = document.getElementById('previewSubtitleBtn');
    const saveSubtitleBtn = document.getElementById('saveSubtitleBtn');
    
    // 字幕样式元素
    const fontFamily = document.getElementById('fontFamily');
    const fontSize = document.getElementById('fontSize');
    const textColor = document.getElementById('textColor');
    const backgroundColor = document.getElementById('backgroundColor');
    const backgroundOpacity = document.getElementById('backgroundOpacity');
    const position = document.getElementById('position');
    
    // 导出相关元素
    const exportFormat = document.getElementById('exportFormat');
    const exportEncoding = document.getElementById('exportEncoding');
    const exportSubtitleBtn = document.getElementById('exportSubtitleBtn');
    const exportVideoBtn = document.getElementById('exportVideoBtn');
    const exportModal = document.getElementById('exportModal');
    const closeExportModal = document.getElementById('closeExportModal');
    const startExportBtn = document.getElementById('startExportBtn');
    const processingModal = document.getElementById('processingModal');
    const exportProgress = document.getElementById('exportProgress');
    const progressText = document.getElementById('progressText');
    
    // 状态变量
    let videoFile = null;
    let subtitles = [];
    let currentSubtitleIndex = -1;
    let isDragging = false;
    let isVideoPaused = true;
    let lastRenderTime = 0;
    
    // 初始化
    function init() {
        // 上传事件
        uploadBtn.addEventListener('click', () => videoInput.click());
        videoInput.addEventListener('change', handleVideoUpload);
        importSubtitleBtn.addEventListener('click', () => subtitleInput.click());
        subtitleInput.addEventListener('change', handleSubtitleImport);
        
        // 拖放功能
        setupDragAndDrop();
        
        // 视频控制
        playPauseBtn.addEventListener('click', togglePlayPause);
        previewVideo.addEventListener('timeupdate', updateVideoProgress);
        previewVideo.addEventListener('loadedmetadata', updateVideoDuration);
        timelineTrack.addEventListener('click', seekVideo);
        backwardBtn.addEventListener('click', () => seek(-5));
        forwardBtn.addEventListener('click', () => seek(5));
        
        // 字幕控制
        addSubtitleBtn.addEventListener('click', addNewSubtitle);
        syncSubtitleBtn.addEventListener('click', syncSubtitles);
        setCurrentTimeBtn.addEventListener('click', setCurrentTime);
        previewSubtitleBtn.addEventListener('click', previewCurrentSubtitle);
        saveSubtitleBtn.addEventListener('click', saveCurrentSubtitle);
        
        // 样式控制
        fontFamily.addEventListener('change', updateSubtitleStyle);
        fontSize.addEventListener('change', updateSubtitleStyle);
        textColor.addEventListener('input', updateSubtitleStyle);
        backgroundColor.addEventListener('input', updateSubtitleStyle);
        backgroundOpacity.addEventListener('input', updateSubtitleStyle);
        position.addEventListener('change', updateSubtitleStyle);
        
        // 导出控制
        exportSubtitleBtn.addEventListener('click', exportSubtitleFile);
        exportVideoBtn.addEventListener('click', () => exportModal.classList.add('active'));
        closeExportModal.addEventListener('click', () => exportModal.classList.remove('active'));
        startExportBtn.addEventListener('click', exportVideoWithSubtitles);
        
        // 初始应用字幕样式
        updateSubtitleStyle();
        
        // 动画帧循环渲染字幕
        requestAnimationFrame(renderSubtitles);
    }
    
    // 设置拖放功能
    function setupDragAndDrop() {
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
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('video/')) {
                    videoInput.files = e.dataTransfer.files;
                    handleVideoUpload({ target: videoInput });
                } else {
                    showNotification('错误', '请上传视频文件', 'error');
                }
            }
        });
    }
    
    // 处理视频上传
    function handleVideoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('video/')) {
            showNotification('错误', '请上传视频文件', 'error');
            return;
        }
        
        if (file.size > 100 * 1024 * 1024) { // 100MB
            showNotification('错误', '视频文件大小不能超过100MB', 'error');
            return;
        }
        
        videoFile = file;
        const videoURL = URL.createObjectURL(file);
        previewVideo.src = videoURL;
        
        // 切换到编辑界面
        uploadContainer.style.display = 'none';
        editorContainer.style.display = 'block';
        
        // 清空字幕列表
        subtitles = [];
        subtitleList.innerHTML = '';
        renderSubtitleMarkers();
        
        showNotification('成功', '视频已上传，可以开始添加字幕', 'success');
    }
    
    // 处理字幕文件导入
    function handleSubtitleImport(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            const extension = file.name.split('.').pop().toLowerCase();
            
            try {
                if (extension === 'srt') {
                    parseSRT(content);
                } else if (extension === 'vtt') {
                    parseVTT(content);
                } else if (extension === 'ass') {
                    parseASS(content);
                } else {
                    throw new Error('不支持的字幕格式');
                }
                showNotification('成功', '字幕文件已导入', 'success');
            } catch (error) {
                console.error('字幕解析错误:', error);
                showNotification('错误', '字幕文件解析失败', 'error');
            }
        };
        reader.onerror = function() {
            showNotification('错误', '读取文件失败', 'error');
        };
        reader.readAsText(file);
    }
    
    // 解析SRT字幕文件
    function parseSRT(content) {
        const srtRegex = /(\d+)\r?\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\r?\n([\s\S]*?)(?=\r?\n\r?\n\d+|$)/g;
        const matches = [...content.matchAll(srtRegex)];
        
        subtitles = matches.map(match => {
            return {
                id: parseInt(match[1]),
                startTime: timeStringToSeconds(match[2]),
                endTime: timeStringToSeconds(match[3]),
                text: match[4].trim()
            };
        });
        
        renderSubtitleList();
        renderSubtitleMarkers();
    }
    
    // 解析VTT字幕文件
    function parseVTT(content) {
        // 移除WEBVTT头
        let processedContent = content.replace(/^WEBVTT.*\r?\n/, '');
        
        const vttRegex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})(.*)\r?\n([\s\S]*?)(?=\r?\n\r?\n|\r?\n\d{2}:\d{2}:\d{2}\.\d{3}|$)/g;
        const matches = [...processedContent.matchAll(vttRegex)];
        
        subtitles = matches.map((match, index) => {
            return {
                id: index + 1,
                startTime: timeStringToSeconds(match[1].replace('.', ',')),
                endTime: timeStringToSeconds(match[2].replace('.', ',')),
                text: match[4].trim()
            };
        });
        
        renderSubtitleList();
        renderSubtitleMarkers();
    }
    
    // 时间字符串转换为秒
    function timeStringToSeconds(timeStr) {
        const [time, milliseconds] = timeStr.split(',');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds + Number(milliseconds) / 1000;
    }
    
    // 秒转换为时间字符串
    function secondsToTimeString(seconds, includeMilliseconds = true) {
        if (isNaN(seconds)) seconds = 0;
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 1000);
        
        const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        return includeMilliseconds ? `${timeStr},${ms.toString().padStart(3, '0')}` : timeStr;
    }
    
    // 切换播放/暂停
    function togglePlayPause() {
        if (previewVideo.paused) {
            previewVideo.play();
            playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
            isVideoPaused = false;
        } else {
            previewVideo.pause();
            playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
            isVideoPaused = true;
        }
    }
    
    // 更新视频进度
    function updateVideoProgress() {
        const currentTime = previewVideo.currentTime;
        const duration = previewVideo.duration;
        
        if (isNaN(duration)) return;
        
        const progressPercentage = (currentTime / duration) * 100;
        timelineProgress.style.width = `${progressPercentage}%`;
        timeDisplay.textContent = `${secondsToTimeString(currentTime, false)} / ${secondsToTimeString(duration, false)}`;
    }
    
    // 更新视频时长
    function updateVideoDuration() {
        const duration = previewVideo.duration;
        if (isNaN(duration)) return;
        
        timeDisplay.textContent = `00:00:00 / ${secondsToTimeString(duration, false)}`;
    }
    
    // 视频跳转
    function seekVideo(e) {
        const rect = timelineTrack.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = offsetX / rect.width;
        const seekTime = percentage * previewVideo.duration;
        
        previewVideo.currentTime = seekTime;
    }
    
    // 快进/快退
    function seek(seconds) {
        previewVideo.currentTime += seconds;
    }
    
    // 添加新字幕
    function addNewSubtitle() {
        // 设置默认时间为当前视频时间，持续5秒
        const currentTime = previewVideo.currentTime;
        subtitleStartTime.value = secondsToTimeString(currentTime);
        subtitleEndTime.value = secondsToTimeString(currentTime + 5);
        subtitleText.value = '';
        
        // 设置为新增模式
        currentSubtitleIndex = -1;
        
        // 高亮显示编辑区域
        document.querySelector('.current-subtitle-editor').classList.add('active');
    }
    
    // 设置当前时间
    function setCurrentTime() {
        const currentTime = previewVideo.currentTime;
        subtitleStartTime.value = secondsToTimeString(currentTime);
    }
    
    // 预览当前字幕
    function previewCurrentSubtitle() {
        const startTime = timeStringToSeconds(subtitleStartTime.value);
        const endTime = timeStringToSeconds(subtitleEndTime.value);
        const text = subtitleText.value;
        
        if (isNaN(startTime) || isNaN(endTime) || !text) {
            showNotification('错误', '请输入有效的时间和文本', 'error');
            return;
        }
        
        if (startTime >= endTime) {
            showNotification('错误', '结束时间必须大于开始时间', 'error');
            return;
        }
        
        // 设置视频到开始时间
        previewVideo.currentTime = startTime;
        
        // 显示字幕
        subtitleDisplay.textContent = text;
        subtitleDisplay.style.display = 'block';
        
        // 播放视频以查看效果
        previewVideo.play();
        playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
        isVideoPaused = false;
        
        // 设置定时器以在结束时间隐藏字幕
        setTimeout(() => {
            subtitleDisplay.style.display = 'none';
            previewVideo.pause();
            playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
            isVideoPaused = true;
        }, (endTime - startTime) * 1000);
    }
    
    // 保存当前字幕
    function saveCurrentSubtitle() {
        const startTime = timeStringToSeconds(subtitleStartTime.value);
        const endTime = timeStringToSeconds(subtitleEndTime.value);
        const text = subtitleText.value;
        
        if (isNaN(startTime) || isNaN(endTime) || !text) {
            showNotification('错误', '请输入有效的时间和文本', 'error');
            return;
        }
        
        if (startTime >= endTime) {
            showNotification('错误', '结束时间必须大于开始时间', 'error');
            return;
        }
        
        const newSubtitle = {
            id: currentSubtitleIndex >= 0 ? subtitles[currentSubtitleIndex].id : subtitles.length + 1,
            startTime,
            endTime,
            text
        };
        
        if (currentSubtitleIndex >= 0) {
            // 编辑现有字幕
            subtitles[currentSubtitleIndex] = newSubtitle;
        } else {
            // 添加新字幕
            subtitles.push(newSubtitle);
        }
        
        // 按时间排序
        subtitles.sort((a, b) => a.startTime - b.startTime);
        
        // 重新生成ID
        subtitles.forEach((subtitle, index) => {
            subtitle.id = index + 1;
        });
        
        // 更新UI
        renderSubtitleList();
        renderSubtitleMarkers();
        
        // 重置编辑区
        subtitleStartTime.value = '';
        subtitleEndTime.value = '';
        subtitleText.value = '';
        currentSubtitleIndex = -1;
        
        showNotification('成功', '字幕已保存', 'success');
    }
    
    // 渲染字幕列表
    function renderSubtitleList() {
        subtitleList.innerHTML = '';
        
        subtitles.forEach((subtitle, index) => {
            const subtitleItem = document.createElement('div');
            subtitleItem.className = 'subtitle-item';
            subtitleItem.dataset.index = index;
            
            subtitleItem.innerHTML = `
                <div class="subtitle-time">${secondsToTimeString(subtitle.startTime)} - ${secondsToTimeString(subtitle.endTime)}</div>
                <div class="subtitle-content">${subtitle.text}</div>
                <div class="subtitle-actions">
                    <button class="subtitle-btn edit-btn" title="编辑"><i class="ri-edit-line"></i></button>
                    <button class="subtitle-btn delete-btn" title="删除"><i class="ri-delete-bin-line"></i></button>
                </div>
            `;
            
            // 点击字幕项以选择
            subtitleItem.addEventListener('click', function(e) {
                if (!e.target.closest('.subtitle-actions')) {
                    selectSubtitle(index);
                }
            });
            
            // 编辑按钮
            subtitleItem.querySelector('.edit-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                editSubtitle(index);
            });
            
            // 删除按钮
            subtitleItem.querySelector('.delete-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                deleteSubtitle(index);
            });
            
            subtitleList.appendChild(subtitleItem);
        });
    }
    
    // 选择字幕
    function selectSubtitle(index) {
        // 移除所有活动状态
        const items = subtitleList.querySelectorAll('.subtitle-item');
        items.forEach(item => item.classList.remove('active'));
        
        // 设置当前项为活动状态
        items[index]?.classList.add('active');
        
        // 跳转视频到字幕开始时间
        previewVideo.currentTime = subtitles[index].startTime;
    }
    
    // 编辑字幕
    function editSubtitle(index) {
        const subtitle = subtitles[index];
        
        subtitleStartTime.value = secondsToTimeString(subtitle.startTime);
        subtitleEndTime.value = secondsToTimeString(subtitle.endTime);
        subtitleText.value = subtitle.text;
        
        currentSubtitleIndex = index;
        
        // 高亮显示编辑区域
        document.querySelector('.current-subtitle-editor').classList.add('active');
    }
    
    // 删除字幕
    function deleteSubtitle(index) {
        if (confirm('确定要删除这条字幕吗？')) {
            subtitles.splice(index, 1);
            
            // 重新生成ID
            subtitles.forEach((subtitle, index) => {
                subtitle.id = index + 1;
            });
            
            renderSubtitleList();
            renderSubtitleMarkers();
            
            showNotification('成功', '字幕已删除', 'success');
        }
    }
    
    // 渲染字幕标记
    function renderSubtitleMarkers() {
        subtitleMarkers.innerHTML = '';
        
        if (subtitles.length === 0 || !previewVideo.duration) return;
        
        subtitles.forEach((subtitle, index) => {
            const startPercentage = (subtitle.startTime / previewVideo.duration) * 100;
            const endPercentage = (subtitle.endTime / previewVideo.duration) * 100;
            const width = endPercentage - startPercentage;
            
            const marker = document.createElement('div');
            marker.className = 'subtitle-marker';
            marker.dataset.index = index;
            marker.style.left = `${startPercentage}%`;
            marker.style.width = `${width}%`;
            
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                selectSubtitle(index);
            });
            
            subtitleMarkers.appendChild(marker);
        });
    }
    
    // 更新字幕样式
    function updateSubtitleStyle() {
        const fontFamilyValue = fontFamily.value;
        const fontSizeValue = fontSize.value;
        const textColorValue = textColor.value;
        const backgroundColorValue = backgroundColor.value;
        const backgroundOpacityValue = backgroundOpacity.value;
        const positionValue = position.value;
        
        subtitleDisplay.style.fontFamily = fontFamilyValue;
        subtitleDisplay.style.fontSize = fontSizeValue;
        subtitleDisplay.style.color = textColorValue;
        subtitleDisplay.style.backgroundColor = backgroundColorValue + Math.round(backgroundOpacityValue * 255).toString(16).padStart(2, '0');
        
        // 设置位置
        subtitleDisplay.className = 'subtitle-display';
        if (positionValue === 'top') {
            subtitleDisplay.classList.add('top');
        }
    }
    
    // 动画帧渲染字幕
    function renderSubtitles(timestamp) {
        // 避免过于频繁渲染
        if (timestamp - lastRenderTime > 100) {
            lastRenderTime = timestamp;
            
            if (!isVideoPaused) {
                const currentTime = previewVideo.currentTime;
                
                // 查找当前时间应显示的字幕
                const activeSubtitles = subtitles.filter(
                    subtitle => currentTime >= subtitle.startTime && currentTime <= subtitle.endTime
                );
                
                if (activeSubtitles.length > 0) {
                    // 显示字幕（如果有多个，合并显示）
                    subtitleDisplay.textContent = activeSubtitles.map(s => s.text).join('\n');
                    subtitleDisplay.style.display = 'block';
                    
                    // 高亮时间线上的活动标记
                    const activeIndices = activeSubtitles.map(s => subtitles.indexOf(s));
                    document.querySelectorAll('.subtitle-marker').forEach((marker, index) => {
                        marker.classList.toggle('active', activeIndices.includes(index));
                    });
                } else {
                    // 隐藏字幕
                    subtitleDisplay.style.display = 'none';
                    
                    // 移除所有高亮标记
                    document.querySelectorAll('.subtitle-marker.active').forEach(marker => {
                        marker.classList.remove('active');
                    });
                }
            }
        }
        
        requestAnimationFrame(renderSubtitles);
    }
    
    // 导出字幕文件
    function exportSubtitleFile() {
        if (subtitles.length === 0) {
            showNotification('错误', '没有可导出的字幕', 'error');
            return;
        }
        
        const format = exportFormat.value;
        const encoding = exportEncoding.value;
        
        let content = '';
        
        if (format === 'srt') {
            content = generateSRT();
        } else if (format === 'vtt') {
            content = generateVTT();
        } else if (format === 'ass') {
            content = generateASS();
        }
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `subtitles.${format}`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        showNotification('成功', `字幕已导出为${format.toUpperCase()}格式`, 'success');
    }
    
    // 生成SRT格式字幕
    function generateSRT() {
        return subtitles.map(subtitle => {
            return `${subtitle.id}\n${secondsToTimeString(subtitle.startTime)} --> ${secondsToTimeString(subtitle.endTime)}\n${subtitle.text}\n`;
        }).join('\n');
    }
    
    // 生成VTT格式字幕
    function generateVTT() {
        const header = 'WEBVTT\n\n';
        const body = subtitles.map(subtitle => {
            const startTime = secondsToTimeString(subtitle.startTime).replace(',', '.');
            const endTime = secondsToTimeString(subtitle.endTime).replace(',', '.');
            return `${startTime} --> ${endTime}\n${subtitle.text}\n`;
        }).join('\n');
        
        return header + body;
    }
    
    // 通知函数
    function showNotification(title, message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="ri-${type === 'success' ? 'check-line' : type === 'error' ? 'error-warning-line' : 'information-line'}"></i>
            </div>
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <button class="notification-close"><i class="ri-close-line"></i></button>
        `;
        
        // 添加到文档
        document.body.appendChild(notification);
        
        // 添加关闭按钮事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.add('notification-hiding');
            setTimeout(() => notification.remove(), 300);
        });
        
        // 自动关闭
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('notification-hiding');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // 显示动画
        setTimeout(() => notification.classList.add('notification-show'), 10);
        
        // 添加通知样式（如果尚未添加）
        if (!document.getElementById('notification-styles')) {
            addNotificationStyles();
        }
    }
    
    // 添加通知样式
    function addNotificationStyles() {
        const styleElement = document.createElement('style');
        styleElement.id = 'notification-styles';
        styleElement.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                min-width: 300px;
                max-width: 90%;
                background-color: var(--card-bg);
                color: var(--text-color);
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                padding: 16px;
                z-index: 9999;
                opacity: 0;
                transform: translateX(50px);
                transition: all 0.3s ease;
            }
            
            .notification-show {
                opacity: 1;
                transform: translateX(0);
            }
            
            .notification-hiding {
                opacity: 0;
                transform: translateX(50px);
            }
            
            .notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
            }
            
            .notification-success .notification-icon {
                background-color: rgba(39, 174, 96, 0.2);
                color: #27ae60;
            }
            
            .notification-error .notification-icon {
                background-color: rgba(231, 76, 60, 0.2);
                color: #e74c3c;
            }
            
            .notification-info .notification-icon {
                background-color: rgba(52, 152, 219, 0.2);
                color: #3498db;
            }
            
            .notification-content {
                flex-grow: 1;
            }
            
            .notification-content h4 {
                margin: 0 0 4px;
                font-size: 16px;
            }
            
            .notification-content p {
                margin: 0;
                font-size: 14px;
                color: var(--text-secondary);
            }
            
            .notification-close {
                background: none;
                border: none;
                color: var(--text-secondary);
                cursor: pointer;
                margin-left: 8px;
                padding: 0;
                font-size: 18px;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // 初始化应用
    init();
});
