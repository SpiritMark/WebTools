// 背景擦除工具类
class BackgroundRemover {
    constructor() {
        // 获取DOM元素
        this.imageCanvas = document.getElementById('image-canvas');
        this.imageCtx = this.imageCanvas.getContext('2d');
        this.maskCanvas = document.getElementById('mask-canvas');
        this.maskCtx = this.maskCanvas.getContext('2d');
        this.uploadArea = document.getElementById('upload-area');
        this.uploadInput = document.getElementById('image-upload');
        this.editorContainer = document.getElementById('editor-container');
        this.uploadContainer = document.getElementById('upload-container');
        
        // 初始化属性
        this.originalImage = null;
        this.currentImage = null;
        this.zoom = 1;
        this.isDrawing = false;
        this.brushMode = 'erase';
        this.brushSize = 20;
        this.brushHardness = 0.5;
        this.edgeSmooth = 0.5;
        this.backgroundColor = '#FFFFFF';
        
        // 初始化事件监听
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // 文件拖放处理
        this.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadArea.classList.add('dragover');
        });
        
        this.uploadArea.addEventListener('dragleave', () => {
            this.uploadArea.classList.remove('dragover');
        });
        
        this.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageUpload(files[0]);
            }
        });
        
        // 文件选择处理
        this.uploadArea.addEventListener('click', () => {
            this.uploadInput.click();
        });
        
        this.uploadInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleImageUpload(e.target.files[0]);
            }
        });
        
        // 缩放控制
        document.getElementById('zoom-in').addEventListener('click', () => {
            this.setZoom(this.zoom + 0.1);
        });
        
        document.getElementById('zoom-out').addEventListener('click', () => {
            this.setZoom(this.zoom - 0.1);
        });
        
        document.getElementById('reset-zoom').addEventListener('click', () => {
            this.setZoom(1);
        });
        
        // 工具切换
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTool(tab.dataset.tab);
            });
        });
        
        // 画笔模式切换
        document.querySelectorAll('.brush-mode').forEach(mode => {
            mode.addEventListener('click', () => {
                this.setBrushMode(mode.dataset.mode);
            });
        });
        
        // 参数调整
        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            this.updateRangeValue('brush-size', this.brushSize + 'px');
        });
        
        document.getElementById('brush-hardness').addEventListener('input', (e) => {
            this.brushHardness = parseInt(e.target.value) / 100;
            this.updateRangeValue('brush-hardness', Math.round(this.brushHardness * 100) + '%');
        });
        
        document.getElementById('edge-smooth').addEventListener('input', (e) => {
            this.edgeSmooth = parseInt(e.target.value) / 100;
            this.updateRangeValue('edge-smooth', Math.round(this.edgeSmooth * 100) + '%');
            this.updateCanvas();
        });
        
        // 背景颜色选择
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.addEventListener('click', () => {
                this.setBackgroundColor(preset.dataset.color);
            });
        });
        
        document.getElementById('custom-color').addEventListener('input', (e) => {
            this.setBackgroundColor(e.target.value);
        });
        
        // 操作按钮
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadImage();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetImage();
        });
        
        // 画布事件
        this.imageCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.imageCanvas.addEventListener('mousemove', (e) => this.draw(e));
        this.imageCanvas.addEventListener('mouseup', () => this.stopDrawing());
        this.imageCanvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // 触摸事件支持
        this.imageCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        
        this.imageCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        
        this.imageCanvas.addEventListener('touchend', () => this.stopDrawing());
    }
    
    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.currentImage = img;
                this.showEditor();
                this.updateCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    showEditor() {
        this.uploadContainer.style.display = 'none';
        this.editorContainer.style.display = 'block';
    }
    
    setZoom(value) {
        this.zoom = Math.max(0.1, Math.min(2, value));
        this.updateCanvas();
    }
    
    switchTool(tool) {
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tool) {
                tab.classList.add('active');
            }
        });
        
        document.querySelectorAll('.tool-panel').forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === `${tool}-panel`) {
                panel.classList.add('active');
            }
        });
    }
    
    setBrushMode(mode) {
        this.brushMode = mode;
        
        // 更新UI
        document.querySelectorAll('.brush-mode').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
    }
    
    setBackgroundColor(color) {
        this.backgroundColor = color;
        
        // 更新UI
        document.querySelectorAll('.color-preset').forEach(preset => {
            preset.classList.remove('active');
            if (preset.dataset.color === color) {
                preset.classList.add('active');
            }
        });
        
        document.getElementById('custom-color').value = color;
        
        // 更新画布
        this.updateCanvas();
    }
    
    updateRangeValue(id, value) {
        const valueElement = document.querySelector(`#${id} + .range-value`);
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
    
    updateCanvas() {
        if (!this.currentImage) return;
        
        // 计算画布尺寸
        const maxWidth = 800;
        const maxHeight = 600;
        const scale = Math.min(maxWidth / this.currentImage.width, maxHeight / this.currentImage.height);
        
        // 设置画布尺寸
        this.imageCanvas.width = this.currentImage.width * scale;
        this.imageCanvas.height = this.currentImage.height * scale;
        this.maskCanvas.width = this.currentImage.width * scale;
        this.maskCanvas.height = this.currentImage.height * scale;
        
        // 清除画布
        this.imageCtx.clearRect(0, 0, this.imageCanvas.width, this.imageCanvas.height);
        this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
        
        // 应用缩放
        this.imageCtx.scale(this.zoom, this.zoom);
        this.maskCtx.scale(this.zoom, this.zoom);
        
        // 绘制原始图片
        this.imageCtx.drawImage(this.currentImage, 0, 0, this.imageCanvas.width / this.zoom, this.imageCanvas.height / this.zoom);
        
        // 应用背景色
        this.imageCtx.fillStyle = this.backgroundColor;
        this.imageCtx.fillRect(0, 0, this.imageCanvas.width / this.zoom, this.imageCanvas.height / this.zoom);
        
        // 应用遮罩
        this.imageCtx.globalCompositeOperation = 'destination-in';
        this.imageCtx.drawImage(this.maskCanvas, 0, 0);
        this.imageCtx.globalCompositeOperation = 'source-over';
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        this.draw(e);
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.imageCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        
        // 设置画笔样式
        this.maskCtx.lineWidth = this.brushSize;
        this.maskCtx.lineCap = 'round';
        this.maskCtx.lineJoin = 'round';
        
        // 创建渐变
        const gradient = this.maskCtx.createRadialGradient(x, y, 0, x, y, this.brushSize);
        const alpha = this.brushMode === 'erase' ? 1 : 0;
        gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha})`);
        gradient.addColorStop(this.brushHardness, `rgba(0, 0, 0, ${alpha})`);
        gradient.addColorStop(1, `rgba(0, 0, 0, ${alpha * (1 - this.brushHardness)})`);
        
        this.maskCtx.fillStyle = gradient;
        
        // 绘制
        this.maskCtx.beginPath();
        this.maskCtx.arc(x, y, this.brushSize, 0, Math.PI * 2);
        this.maskCtx.fill();
        
        // 应用边缘平滑
        if (this.edgeSmooth > 0) {
            this.applyEdgeSmoothing();
        }
        
        // 更新画布
        this.updateCanvas();
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    applyEdgeSmoothing() {
        const imageData = this.maskCtx.getImageData(0, 0, this.maskCanvas.width / this.zoom, this.maskCanvas.height / this.zoom);
        const data = imageData.data;
        const width = this.maskCanvas.width / this.zoom;
        const height = this.maskCanvas.height / this.zoom;
        
        // 创建临时数组存储平滑后的数据
        const tempData = new Uint8ClampedArray(data);
        
        // 应用高斯模糊
        const radius = Math.floor(this.edgeSmooth * 5);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                let count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const i = (ny * width + nx) * 4;
                            sum += tempData[i + 3];
                            count++;
                        }
                    }
                }
                
                const i = (y * width + x) * 4;
                data[i + 3] = sum / count;
            }
        }
        
        this.maskCtx.putImageData(imageData, 0, 0);
    }
    
    downloadImage() {
        const link = document.createElement('a');
        link.download = 'removed-bg.png';
        link.href = this.imageCanvas.toDataURL('image/png');
        link.click();
    }
    
    resetImage() {
        // 重置所有参数
        this.currentImage = this.originalImage;
        this.zoom = 1;
        this.brushMode = 'erase';
        this.brushSize = 20;
        this.brushHardness = 0.5;
        this.edgeSmooth = 0.5;
        this.backgroundColor = '#FFFFFF';
        
        // 重置UI
        document.getElementById('brush-size').value = 20;
        document.getElementById('brush-hardness').value = 50;
        document.getElementById('edge-smooth').value = 50;
        document.getElementById('custom-color').value = '#FFFFFF';
        
        // 更新UI显示
        this.updateRangeValue('brush-size', '20px');
        this.updateRangeValue('brush-hardness', '50%');
        this.updateRangeValue('edge-smooth', '50%');
        
        // 重置画笔模式
        this.setBrushMode('erase');
        
        // 重置背景颜色
        this.setBackgroundColor('#FFFFFF');
        
        // 清除遮罩
        this.maskCtx.clearRect(0, 0, this.maskCanvas.width, this.maskCanvas.height);
        
        // 更新画布
        this.updateCanvas();
    }
}

// 初始化工具
document.addEventListener('DOMContentLoaded', () => {
    window.backgroundRemover = new BackgroundRemover();
}); 