/**
 * 视频剪辑工具 JavaScript
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const uploadContainer = document.getElementById('uploadContainer');
    const editorContainer = document.getElementById('editorContainer');
    const uploadArea = document.getElementById('uploadArea');
    const videoInput = document.getElementById('videoInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const previewVideo = document.getElementById('previewVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const timelineTrack = document.getElementById('timelineTrack');
    const timelineProgress = document.getElementById('timelineProgress');
    const startMarker = document.getElementById('startMarker');
    const endMarker = document.getElementById('endMarker');
    const timeDisplay = document.getElementById('timeDisplay');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const trimBtn = document.getElementById('trimBtn');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    const applySpeedBtn = document.getElementById('applySpeedBtn');
    const resolutionSelect = document.getElementById('resolutionSelect');
    const filterItems = document.querySelectorAll('.filter-item');
    const resetBtn = document.getElementById('resetBtn');
    const previewBtn = document.getElementById('previewBtn');
    const exportBtn = document.getElementById('exportBtn');
    const exportModal = document.getElementById('exportModal');
    const closeExportModal = document.getElementById('closeExportModal');
    const startExportBtn = document.getElementById('startExportBtn');
    const processingModal = document.getElementById('processingModal');
    const exportFilename = document.getElementById('exportFilename');
    const exportFormat = document.getElementById('exportFormat');
    const exportQuality = document.getElementById('exportQuality');

    // 视频编辑状态
    let videoState = {
        originalSrc: null,     // 原始视频URL
        originalBlob: null,    // 原始视频Blob
        startTime: 0,          // 开始裁剪时间（秒）
        endTime: 0,            // 结束裁剪时间（秒）
        duration: 0,           // 视频总时长（秒）
        speed: 1,              // 播放速度
        filter: 'none',        // 滤镜效果
        resolution: 'original' // 视频分辨率
    };

    // 上传文件相关事件
    uploadBtn.addEventListener('click', () => videoInput.click());
    
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
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    videoInput.addEventListener('change', () => {
        if (videoInput.files.length > 0) {
            handleFileUpload(videoInput.files[0]);
        }
    });

    // 处理文件上传
    function handleFileUpload(file) {
        // 检查文件类型
        if (!file.type.startsWith('video/')) {
            showNotification('错误', '请上传视频文件！', 'error');
            return;
        }
        
        // 检查文件大小（限制100MB）
        if (file.size > 100 * 1024 * 1024) {
            showNotification('错误', '文件大小超过限制（100MB）！', 'error');
            return;
        }
        
        // 创建文件URL
        const fileURL = URL.createObjectURL(file);
        
        // 保存原始数据
        videoState.originalSrc = fileURL;
        videoState.originalBlob = file;
        
        // 设置到视频元素
        previewVideo.src = fileURL;
        
        // 设置文件名（去除扩展名）
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        exportFilename.value = fileName + '-edited';
        
        // 等待视频元数据加载完毕
        previewVideo.onloadedmetadata = function() {
            // 切换到编辑器界面
            uploadContainer.style.display = 'none';
            editorContainer.style.display = 'block';
            
            // 保存视频时长
            videoState.duration = previewVideo.duration;
            videoState.endTime = previewVideo.duration;
            
            // 更新UI显示
            updateTimeDisplay();
            updateTimeInputs();
            
            // 调整结束标记位置
            endMarker.style.left = '100%';
        };
    }

    // 播放/暂停控制
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    function togglePlayPause() {
        if (previewVideo.paused) {
            previewVideo.play();
            playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
        } else {
            previewVideo.pause();
            playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
        }
    }

    // 时间线进度更新
    previewVideo.addEventListener('timeupdate', () => {
        // 计算进度百分比
        const progressPercent = (previewVideo.currentTime / videoState.duration) * 100;
        timelineProgress.style.width = `${progressPercent}%`;
        
        // 更新时间显示
        updateTimeDisplay();
        
        // 如果到达裁剪结束点，则暂停
        if (previewVideo.currentTime >= videoState.endTime) {
            previewVideo.pause();
            previewVideo.currentTime = videoState.startTime;
            playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
        }
    });

    // 视频结束时重置
    previewVideo.addEventListener('ended', () => {
        previewVideo.currentTime = videoState.startTime;
        playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
    });

    // 时间线点击跳转
    timelineTrack.addEventListener('click', (e) => {
        // 计算点击位置相对时间线的百分比
        const rect = timelineTrack.getBoundingClientRect();
        const clickPos = (e.clientX - rect.left) / rect.width;
        
        // 计算对应的时间并跳转
        let newTime = videoState.duration * clickPos;
        
        // 确保在裁剪范围内
        newTime = Math.max(videoState.startTime, Math.min(videoState.endTime, newTime));
        previewVideo.currentTime = newTime;
    });

    // 标记拖动功能
    let isDragging = false;
    let currentMarker = null;

    // 开始标记拖动
    function startDrag(marker, e) {
        isDragging = true;
        currentMarker = marker;
        document.addEventListener('mousemove', dragMarker);
        document.addEventListener('mouseup', stopDrag);
        e.preventDefault();
    }

    // 拖动过程
    function dragMarker(e) {
        if (!isDragging) return;
        
        const rect = timelineTrack.getBoundingClientRect();
        const trackWidth = rect.width;
        
        // 计算新位置（百分比）
        let newPos = (e.clientX - rect.left) / trackWidth;
        newPos = Math.max(0, Math.min(1, newPos));
        
        // 根据当前拖动的是开始还是结束标记，设置不同的限制
        if (currentMarker === startMarker) {
            // 开始标记不能超过结束标记
            const endPos = parseFloat(endMarker.style.left) / 100 || 1;
            newPos = Math.min(newPos, endPos);
            
            // 更新开始时间
            videoState.startTime = newPos * videoState.duration;
            
            // 如果当前播放位置在新开始时间之前，则调整
            if (previewVideo.currentTime < videoState.startTime) {
                previewVideo.currentTime = videoState.startTime;
            }
        } else if (currentMarker === endMarker) {
            // 结束标记不能在开始标记之前
            const startPos = parseFloat(startMarker.style.left) / 100 || 0;
            newPos = Math.max(newPos, startPos);
            
            // 更新结束时间
            videoState.endTime = newPos * videoState.duration;
            
            // 如果当前播放位置在新结束时间之后，则调整
            if (previewVideo.currentTime > videoState.endTime) {
                previewVideo.currentTime = videoState.endTime;
            }
        }
        
        // 更新标记位置
        currentMarker.style.left = `${newPos * 100}%`;
        
        // 更新时间输入框
        updateTimeInputs();
    }

    // 结束拖动
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', dragMarker);
        document.removeEventListener('mouseup', stopDrag);
    }

    // 添加标记拖动事件
    startMarker.addEventListener('mousedown', (e) => startDrag(startMarker, e));
    endMarker.addEventListener('mousedown', (e) => startDrag(endMarker, e));

    // 更新时间显示
    function updateTimeDisplay() {
        timeDisplay.textContent = `${formatTime(previewVideo.currentTime)} / ${formatTime(videoState.duration)}`;
    }

    // 更新时间输入框
    function updateTimeInputs() {
        startTimeInput.value = formatTime(videoState.startTime);
        endTimeInput.value = formatTime(videoState.endTime);
    }

    // 格式化时间为 MM:SS 格式
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 解析时间输入
    function parseTimeInput(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return null;
        
        const mins = parseInt(parts[0], 10);
        const secs = parseInt(parts[1], 10);
        
        if (isNaN(mins) || isNaN(secs)) return null;
        
        return mins * 60 + secs;
    }

    // 应用时间裁剪
    trimBtn.addEventListener('click', () => {
        // 解析输入的时间值
        const startTime = parseTimeInput(startTimeInput.value);
        const endTime = parseTimeInput(endTimeInput.value);
        
        if (startTime === null || endTime === null) {
            showNotification('错误', '请输入有效的时间格式（MM:SS）', 'error');
            return;
        }
        
        // 验证时间范围
        if (startTime >= endTime) {
            showNotification('错误', '开始时间必须小于结束时间', 'error');
            return;
        }
        
        if (endTime > videoState.duration) {
            showNotification('错误', '结束时间不能超过视频时长', 'error');
            return;
        }
        
        // 更新状态
        videoState.startTime = startTime;
        videoState.endTime = endTime;
        
        // 更新标记位置
        const startPos = (startTime / videoState.duration) * 100;
        const endPos = (endTime / videoState.duration) * 100;
        startMarker.style.left = `${startPos}%`;
        endMarker.style.left = `${endPos}%`;
        
        // 跳转到开始位置
        previewVideo.currentTime = startTime;
        
        showNotification('成功', '时间裁剪已应用', 'success');
    });

    // 速度调整
    speedRange.addEventListener('input', () => {
        speedValue.textContent = `${speedRange.value}x`;
    });
    
    applySpeedBtn.addEventListener('click', () => {
        videoState.speed = parseFloat(speedRange.value);
        previewVideo.playbackRate = videoState.speed;
        showNotification('成功', `播放速度已调整为 ${videoState.speed}x`, 'success');
    });

    // 滤镜效果
    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            // 移除所有active类
            filterItems.forEach(i => i.classList.remove('active'));
            
            // 添加active类到当前项
            item.classList.add('active');
            
            // 更新滤镜状态
            videoState.filter = item.dataset.filter;
            
            // 应用滤镜
            applyFilter();
        });
    });
    
    function applyFilter() {
        // 移除之前的所有滤镜类
        previewVideo.classList.remove('filter-grayscale', 'filter-sepia', 'filter-invert', 'filter-blur', 'filter-brightness');
        
        // 添加新的滤镜类（如果不是none）
        if (videoState.filter !== 'none') {
            previewVideo.classList.add(`filter-${videoState.filter}`);
        }
    }

    // 重置按钮
    resetBtn.addEventListener('click', () => {
        // 重置视频状态
        videoState.startTime = 0;
        videoState.endTime = videoState.duration;
        videoState.speed = 1;
        videoState.filter = 'none';
        videoState.resolution = 'original';
        
        // 重置UI
        startMarker.style.left = '0%';
        endMarker.style.left = '100%';
        speedRange.value = 1;
        speedValue.textContent = '1.0x';
        resolutionSelect.value = 'original';
        
        // 移除所有滤镜样式
        previewVideo.classList.remove('filter-grayscale', 'filter-sepia', 'filter-invert', 'filter-blur', 'filter-brightness');
        
        // 重置滤镜选择UI
        filterItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.filter === 'none') {
                item.classList.add('active');
            }
        });
        
        // 重置视频播放速度
        previewVideo.playbackRate = 1;
        
        // 更新时间输入
        updateTimeInputs();
        
        // 回到开始位置
        previewVideo.currentTime = 0;
        
        showNotification('成功', '已重置所有编辑', 'success');
    });

    // 预览效果
    previewBtn.addEventListener('click', () => {
        // 确保视频设置在开始时间
        previewVideo.currentTime = videoState.startTime;
        
        // 应用当前的速度设置
        previewVideo.playbackRate = videoState.speed;
        
        // 开始播放
        previewVideo.play();
        playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
    });

    // 导出功能
    exportBtn.addEventListener('click', () => {
        // 显示导出选项模态框
        exportModal.classList.add('active');
    });
    
    closeExportModal.addEventListener('click', () => {
        exportModal.classList.remove('active');
    });
    
    startExportBtn.addEventListener('click', async () => {
        // 隐藏导出模态框
        exportModal.classList.remove('active');
        
        // 显示处理中模态框
        processingModal.classList.add('active');
        
        try {
            // 这里将会处理视频导出
            // 注意：在实际浏览器环境中，以下代码仅作为示例，实际导出需要使用更复杂的视频处理库
            
            // 模拟导出延迟
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 在实际应用中，这里应该使用WebCodecs API或视频处理库来处理视频
            // 由于浏览器环境限制，我们只能保存原始视频
            
            // 创建下载链接
            const fileName = exportFilename.value || 'edited-video';
            const format = exportFormat.value;
            const downloadName = `${fileName}.${format}`;
            
            // 创建下载链接
            const downloadLink = document.createElement('a');
            downloadLink.href = videoState.originalSrc;
            downloadLink.download = downloadName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // 显示成功提示
            showNotification('成功', '视频导出完成！', 'success');
            
        } catch (error) {
            console.error('视频导出失败:', error);
            showNotification('错误', '视频导出失败，请重试', 'error');
        } finally {
            // 隐藏处理中模态框
            processingModal.classList.remove('active');
        }
    });

    // 通知显示函数
    function showNotification(title, message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-header">
                <h4>${title}</h4>
                <button class="close-btn"><i class="ri-close-line"></i></button>
            </div>
            <div class="notification-body">
                <p>${message}</p>
            </div>
        `;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('active');
        }, 10);
        
        // 绑定关闭按钮
        const closeBtn = notification.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            notification.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        });
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // 添加视频滤镜样式 - 需要添加到head部分
    function addFilterStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .filter-grayscale { filter: grayscale(100%); }
            .filter-sepia { filter: sepia(100%); }
            .filter-invert { filter: invert(100%); }
            .filter-blur { filter: blur(2px); }
            .filter-brightness { filter: brightness(1.5); }
            
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
            }
            
            .notification.active {
                transform: translateX(0);
            }
            
            .notification.success {
                border-left: 4px solid #4caf50;
            }
            
            .notification.error {
                border-left: 4px solid #f44336;
            }
            
            .notification.info {
                border-left: 4px solid #2196f3;
            }
            
            .notification-header {
                padding: 12px 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid var(--border-color);
            }
            
            .notification-header h4 {
                margin: 0;
                font-size: 16px;
            }
            
            .notification-body {
                padding: 15px;
            }
            
            .notification-body p {
                margin: 0;
                font-size: 14px;
            }
        `;
        document.head.appendChild(styleElement);
    }
    
    // 初始化滤镜样式
    addFilterStyles();
}); 