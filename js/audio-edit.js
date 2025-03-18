/**
 * 音频剪辑与合并工具
 * 使用Web Audio API和WaveSurfer.js实现音频处理和波形可视化
 */

// 全局变量和状态
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let wavesurfer = null;
let audioTracks = []; // 存储所有音频轨道
let currentTrackIndex = -1; // 当前选中的轨道索引
let isPlaying = false;

// DOM 元素
const uploadContainer = document.getElementById('uploadContainer');
const editorContainer = document.getElementById('editorContainer');
const audioInput = document.getElementById('audioInput');
const uploadBtn = document.getElementById('uploadBtn');
const addTrackBtn = document.getElementById('addTrackBtn');
const tracksList = document.getElementById('tracksList');
const waveformContainer = document.getElementById('waveformContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const timelineProgress = document.getElementById('timelineProgress');
const timelineCursor = document.getElementById('timelineCursor');
const timeDisplay = document.getElementById('timeDisplay');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const trimBtn = document.getElementById('trimBtn');
const volumeRange = document.getElementById('volumeRange');
const volumeValue = document.getElementById('volumeValue');
const applyVolumeBtn = document.getElementById('applyVolumeBtn');
const fadeInTime = document.getElementById('fadeInTime');
const fadeOutTime = document.getElementById('fadeOutTime');
const applyFadeBtn = document.getElementById('applyFadeBtn');
const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');
const applySpeedBtn = document.getElementById('applySpeedBtn');
const effectSelect = document.getElementById('effectSelect');
const applyEffectBtn = document.getElementById('applyEffectBtn');
const mergeType = document.getElementById('mergeType');
const crossfadeDuration = document.getElementById('crossfadeDuration');
const resetBtn = document.getElementById('resetBtn');
const previewBtn = document.getElementById('previewBtn');
const exportBtn = document.getElementById('exportBtn');
const exportModal = document.getElementById('exportModal');
const closeExportModal = document.getElementById('closeExportModal');
const cancelExportBtn = document.getElementById('cancelExportBtn');
const confirmExportBtn = document.getElementById('confirmExportBtn');
const exportFormat = document.getElementById('exportFormat');
const exportQuality = document.getElementById('exportQuality');
const exportFilename = document.getElementById('exportFilename');

// 初始化WaveSurfer波形可视化
function initWaveSurfer() {
    if (wavesurfer) {
        wavesurfer.destroy();
    }
    
    wavesurfer = WaveSurfer.create({
        container: waveformContainer,
        waveColor: '#8CAAF7',
        progressColor: '#4A6CF7',
        cursorColor: '#F55',
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        cursorWidth: 2,
        height: 120,
        normalize: true,
        responsive: true,
        fillParent: true
    });

    // 监听波形显示完成事件
    wavesurfer.on('ready', function() {
        const duration = wavesurfer.getDuration();
        timeDisplay.textContent = `00:00 / ${formatTime(duration)}`;
        startTimeInput.placeholder = "00:00.00";
        endTimeInput.placeholder = formatTime(duration);
        updateTimelineProgress(0);
    });

    // 监听播放事件
    wavesurfer.on('play', function() {
        isPlaying = true;
        playPauseBtn.innerHTML = '<i class="ri-pause-fill"></i>';
    });

    // 监听暂停事件
    wavesurfer.on('pause', function() {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
    });

    // 监听播放位置更新
    wavesurfer.on('audioprocess', function(currentTime) {
        const duration = wavesurfer.getDuration();
        timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        updateTimelineProgress(currentTime / duration * 100);
    });

    // 监听播放结束
    wavesurfer.on('finish', function() {
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="ri-play-fill"></i>';
        updateTimelineProgress(100);
    });

    return wavesurfer;
}

// 时间格式化辅助函数 (秒 -> MM:SS.ss)
function formatTime(timeInSeconds) {
    if (isNaN(timeInSeconds)) return "00:00.00";
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    const milliseconds = Math.floor((timeInSeconds % 1) * 100);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}

// 从格式化时间转换为秒
function parseTime(formattedTime) {
    if (!formattedTime) return 0;
    
    const parts = formattedTime.split(':');
    if (parts.length !== 2) return 0;
    
    const secondParts = parts[1].split('.');
    const minutes = parseInt(parts[0], 10);
    const seconds = parseInt(secondParts[0], 10);
    const milliseconds = secondParts.length > 1 ? parseInt(secondParts[1], 10) : 0;
    
    return minutes * 60 + seconds + milliseconds / 100;
}

// 更新时间轴进度条
function updateTimelineProgress(percent) {
    timelineProgress.style.width = `${percent}%`;
    timelineCursor.style.left = `${percent}%`;
}

// 创建音频轨道项UI
function createTrackItem(track, index) {
    const trackItem = document.createElement('div');
    trackItem.className = 'track-item';
    trackItem.dataset.index = index;
    
    if (index === currentTrackIndex) {
        trackItem.classList.add('selected');
    }
    
    trackItem.innerHTML = `
        <div class="track-header">
            <h4 class="track-name">${track.name}</h4>
            <div class="track-actions">
                <button class="track-action-btn play-track"><i class="ri-play-circle-line"></i></button>
                <button class="track-action-btn mute-track"><i class="ri-volume-up-line"></i></button>
                <button class="track-action-btn delete-track"><i class="ri-delete-bin-6-line"></i></button>
            </div>
        </div>
        <div class="track-info">
            <div class="track-duration"><i class="ri-time-line"></i> ${formatTime(track.duration)}</div>
            <div class="track-format"><i class="ri-file-music-line"></i> ${track.format.toUpperCase()}</div>
        </div>
        <div class="track-waveform" id="track-waveform-${index}">
            <div class="track-waveform-inner"></div>
        </div>
    `;
    
    return trackItem;
}

// 渲染所有音频轨道
function renderTracks() {
    tracksList.innerHTML = '';
    
    if (audioTracks.length === 0) {
        tracksList.innerHTML = '<div class="no-tracks">没有音频轨道，请上传或添加轨道</div>';
        return;
    }
    
    audioTracks.forEach((track, index) => {
        const trackItem = createTrackItem(track, index);
        tracksList.appendChild(trackItem);
        
        // 为每个轨道生成小型波形图
        const trackWavesurfer = WaveSurfer.create({
            container: trackItem.querySelector(`#track-waveform-${index} .track-waveform-inner`),
            waveColor: '#8CAAF7',
            progressColor: '#4A6CF7',
            barWidth: 1,
            barGap: 1,
            barRadius: 1,
            height: 40,
            normalize: true,
            responsive: true,
            fillParent: true,
            cursorWidth: 0
        });
        
        trackWavesurfer.load(track.audioUrl);
    });
}

// 选择轨道
function selectTrack(index) {
    if (index < 0 || index >= audioTracks.length) return;
    
    currentTrackIndex = index;
    
    // 更新UI选中状态
    document.querySelectorAll('.track-item').forEach((item) => {
        item.classList.remove('selected');
    });
    
    const selectedItem = document.querySelector(`.track-item[data-index="${index}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }
    
    // 更新波形显示
    wavesurfer.load(audioTracks[index].audioUrl);
    
    // 更新编辑工具状态
    updateEditTools();
}

// 更新编辑工具状态
function updateEditTools() {
    if (currentTrackIndex === -1) {
        // 禁用所有编辑工具
        document.querySelectorAll('.tool-group button').forEach(btn => {
            btn.disabled = true;
        });
        return;
    }
    
    // 启用所有编辑工具
    document.querySelectorAll('.tool-group button').forEach(btn => {
        btn.disabled = false;
    });
    
    // 更新音量滑块
    volumeRange.value = audioTracks[currentTrackIndex].volume * 100;
    volumeValue.textContent = `${Math.round(audioTracks[currentTrackIndex].volume * 100)}%`;
    
    // 更新速度滑块
    speedRange.value = audioTracks[currentTrackIndex].speed;
    speedValue.textContent = `${audioTracks[currentTrackIndex].speed.toFixed(1)}x`;
    
    // 更新淡入淡出输入框
    fadeInTime.value = audioTracks[currentTrackIndex].fadeIn;
    fadeOutTime.value = audioTracks[currentTrackIndex].fadeOut;
    
    // 更新效果选择器
    effectSelect.value = audioTracks[currentTrackIndex].effect;
}

// 初始化事件监听
function initEventListeners() {
    // 上传按钮点击事件
    uploadBtn.addEventListener('click', () => {
        audioInput.click();
    });
    
    // 文件选择变更事件
    audioInput.addEventListener('change', handleFileUpload);
    
    // 添加轨道按钮点击事件
    addTrackBtn.addEventListener('click', () => {
        audioInput.click();
    });
    
    // 播放/暂停按钮点击事件
    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            wavesurfer.pause();
        } else {
            wavesurfer.play();
        }
    });
    
    // 时间轴点击事件
    document.getElementById('timelineTrack').addEventListener('click', (e) => {
        const percent = e.offsetX / e.target.offsetWidth;
        wavesurfer.seekTo(percent);
    });
    
    // 轨道列表交互事件
    tracksList.addEventListener('click', (e) => {
        const trackItem = e.target.closest('.track-item');
        if (!trackItem) return;
        
        const index = parseInt(trackItem.dataset.index, 10);
        
        // 处理轨道操作按钮点击
        if (e.target.closest('.play-track')) {
            selectTrack(index);
            wavesurfer.play();
        } else if (e.target.closest('.mute-track')) {
            // 切换静音状态
            audioTracks[index].muted = !audioTracks[index].muted;
            const muteBtn = e.target.closest('.mute-track');
            if (audioTracks[index].muted) {
                muteBtn.innerHTML = '<i class="ri-volume-mute-line"></i>';
            } else {
                muteBtn.innerHTML = '<i class="ri-volume-up-line"></i>';
            }
        } else if (e.target.closest('.delete-track')) {
            // 删除轨道
            if (confirm('确定要删除这个音频轨道吗？')) {
                audioTracks.splice(index, 1);
                if (currentTrackIndex === index) {
                    currentTrackIndex = audioTracks.length > 0 ? 0 : -1;
                } else if (currentTrackIndex > index) {
                    currentTrackIndex--;
                }
                renderTracks();
                if (currentTrackIndex !== -1) {
                    selectTrack(currentTrackIndex);
                } else {
                    wavesurfer.empty();
                    timeDisplay.textContent = "00:00 / 00:00";
                    updateTimelineProgress(0);
                }
            }
        } else {
            // 点击轨道项，选择轨道
            selectTrack(index);
        }
    });
    
    // 音量滑块事件
    volumeRange.addEventListener('input', () => {
        const value = volumeRange.value;
        volumeValue.textContent = `${value}%`;
    });
    
    // 速度滑块事件
    speedRange.addEventListener('input', () => {
        const value = speedRange.value;
        speedValue.textContent = `${parseFloat(value).toFixed(1)}x`;
    });
    
    // 合并类型变更事件
    mergeType.addEventListener('change', () => {
        const crossfadeOption = document.querySelector('.merge-option.crossfade-duration');
        if (mergeType.value === 'crossfade') {
            crossfadeOption.style.display = 'flex';
        } else {
            crossfadeOption.style.display = 'none';
        }
    });
    
    // 导出按钮点击事件
    exportBtn.addEventListener('click', () => {
        if (audioTracks.length === 0) {
            alert('没有可导出的音频轨道！');
            return;
        }
        exportModal.style.display = 'flex';
    });
    
    // 关闭导出模态框
    closeExportModal.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });
    
    cancelExportBtn.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });
    
    // 修剪按钮点击事件
    trimBtn.addEventListener('click', applyTrim);
    
    // 应用音量按钮点击事件
    applyVolumeBtn.addEventListener('click', applyVolume);
    
    // 应用淡变按钮点击事件
    applyFadeBtn.addEventListener('click', applyFade);
    
    // 应用速度按钮点击事件
    applySpeedBtn.addEventListener('click', applySpeed);
    
    // 应用效果按钮点击事件
    applyEffectBtn.addEventListener('click', applyEffect);
    
    // 预览按钮点击事件
    previewBtn.addEventListener('click', previewMergedAudio);
    
    // 确认导出按钮点击事件
    confirmExportBtn.addEventListener('click', exportAudio);
    
    // 重置按钮点击事件
    resetBtn.addEventListener('click', resetEditor);
    
    // 按Esc键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && exportModal.style.display === 'flex') {
            exportModal.style.display = 'none';
        }
    });
}

// 处理文件上传
function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // 显示编辑器容器，隐藏上传容器
    uploadContainer.style.display = 'none';
    editorContainer.style.display = 'block';
    
    // 为每个上传的文件创建音频轨道
    Array.from(files).forEach(file => {
        const audioUrl = URL.createObjectURL(file);
        const fileName = file.name;
        const fileFormat = fileName.split('.').pop().toLowerCase();
        
        // 获取音频时长
        const audio = new Audio();
        audio.src = audioUrl;
        
        audio.addEventListener('loadedmetadata', () => {
            const newTrack = {
                name: fileName.replace(`.${fileFormat}`, ''),
                file: file,
                audioUrl: audioUrl,
                duration: audio.duration,
                format: fileFormat,
                volume: 1,
                speed: 1,
                fadeIn: 0,
                fadeOut: 0,
                effect: 'none',
                muted: false,
                trimStart: 0,
                trimEnd: audio.duration
            };
            
            audioTracks.push(newTrack);
            renderTracks();
            
            // 如果是第一个上传的轨道，自动选中
            if (currentTrackIndex === -1) {
                selectTrack(audioTracks.length - 1);
            }
        });
    });
    
    // 清空文件输入，允许再次选择相同文件
    audioInput.value = '';
    
    // 如果尚未初始化WaveSurfer，现在初始化
    if (!wavesurfer) {
        initWaveSurfer();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initWaveSurfer();
    initEventListeners();
});
