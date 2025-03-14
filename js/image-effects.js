// 图片特效工具类
class ImageEffects {
    constructor() {
        // 获取DOM元素
        this.canvas = document.getElementById('image-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.uploadArea = document.getElementById('upload-area');
        this.uploadInput = document.getElementById('image-upload');
        this.editorContainer = document.getElementById('editor-container');
        this.uploadContainer = document.getElementById('upload-container');
        
        // 初始化属性
        this.originalImage = null;
        this.currentImage = null;
        this.zoom = 1;
        this.currentEffect = null;
        this.effectStrength = 50;
        this.brightness = 0;
        this.contrast = 0;
        this.saturation = 0;
        
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
        
        // 特效选择
        document.querySelectorAll('.effect-item').forEach(item => {
            item.addEventListener('click', () => {
                this.setEffect(item.dataset.effect);
            });
        });
        
        // 参数调整
        document.getElementById('effect-strength').addEventListener('input', (e) => {
            this.effectStrength = parseInt(e.target.value);
            this.updateRangeValue('effect-strength', this.effectStrength + '%');
            this.updateCanvas();
        });
        
        document.getElementById('brightness').addEventListener('input', (e) => {
            this.brightness = parseInt(e.target.value);
            this.updateRangeValue('brightness', this.brightness);
            this.updateCanvas();
        });
        
        document.getElementById('contrast').addEventListener('input', (e) => {
            this.contrast = parseInt(e.target.value);
            this.updateRangeValue('contrast', this.contrast);
            this.updateCanvas();
        });
        
        document.getElementById('saturation').addEventListener('input', (e) => {
            this.saturation = parseInt(e.target.value);
            this.updateRangeValue('saturation', this.saturation);
            this.updateCanvas();
        });
        
        // 操作按钮
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadImage();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetImage();
        });
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
    
    setEffect(effect) {
        this.currentEffect = effect;
        
        // 更新UI
        document.querySelectorAll('.effect-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.effect === effect) {
                item.classList.add('active');
            }
        });
        
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
        this.canvas.width = this.currentImage.width * scale;
        this.canvas.height = this.currentImage.height * scale;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 应用缩放
        this.ctx.scale(this.zoom, this.zoom);
        
        // 绘制原始图片
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width / this.zoom, this.canvas.height / this.zoom);
        
        // 获取图像数据
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width / this.zoom, this.canvas.height / this.zoom);
        const data = imageData.data;
        
        // 应用基础调整
        this.applyBasicAdjustments(data);
        
        // 应用特效
        if (this.currentEffect) {
            this.applyEffect(data);
        }
        
        // 更新画布
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    applyBasicAdjustments(data) {
        for (let i = 0; i < data.length; i += 4) {
            // 亮度调整
            if (this.brightness !== 0) {
                data[i] += this.brightness;
                data[i + 1] += this.brightness;
                data[i + 2] += this.brightness;
            }
            
            // 对比度调整
            if (this.contrast !== 0) {
                const factor = (259 * (this.contrast + 255)) / (255 * (259 - this.contrast));
                data[i] = factor * (data[i] - 128) + 128;
                data[i + 1] = factor * (data[i + 1] - 128) + 128;
                data[i + 2] = factor * (data[i + 2] - 128) + 128;
            }
            
            // 饱和度调整
            if (this.saturation !== 0) {
                const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
                data[i] = gray + (data[i] - gray) * (1 + this.saturation / 100);
                data[i + 1] = gray + (data[i + 1] - gray) * (1 + this.saturation / 100);
                data[i + 2] = gray + (data[i + 2] - gray) * (1 + this.saturation / 100);
            }
            
            // 确保值在0-255范围内
            data[i] = Math.max(0, Math.min(255, data[i]));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1]));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2]));
        }
    }
    
    applyEffect(data) {
        const strength = this.effectStrength / 100;
        
        switch (this.currentEffect) {
            case 'vintage':
                this.applyVintageEffect(data, strength);
                break;
            case 'blur':
                this.applyBlurEffect(data, strength);
                break;
            case 'sharpen':
                this.applySharpenEffect(data, strength);
                break;
            case 'emboss':
                this.applyEmbossEffect(data, strength);
                break;
            case 'edge':
                this.applyEdgeEffect(data, strength);
                break;
            case 'pixelate':
                this.applyPixelateEffect(data, strength);
                break;
            case 'noise':
                this.applyNoiseEffect(data, strength);
                break;
            case 'sepia':
                this.applySepiaEffect(data, strength);
                break;
            case 'grayscale':
                this.applyGrayscaleEffect(data, strength);
                break;
            case 'invert':
                this.applyInvertEffect(data, strength);
                break;
            case 'posterize':
                this.applyPosterizeEffect(data, strength);
                break;
            case 'solarize':
                this.applySolarizeEffect(data, strength);
                break;
        }
    }
    
    // 各种特效的具体实现
    applyVintageEffect(data, strength) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * (1 - strength * 0.3); // 减少红色
            data[i + 1] = data[i + 1] * (1 - strength * 0.2); // 减少绿色
            data[i + 2] = data[i + 2] * (1 - strength * 0.1); // 减少蓝色
        }
    }
    
    applyBlurEffect(data, strength) {
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        const radius = Math.floor(strength * 10);
        const tempData = new Uint8ClampedArray(data);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;
                
                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        
                        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                            const i = (ny * width + nx) * 4;
                            r += tempData[i];
                            g += tempData[i + 1];
                            b += tempData[i + 2];
                            a += tempData[i + 3];
                            count++;
                        }
                    }
                }
                
                const i = (y * width + x) * 4;
                data[i] = r / count;
                data[i + 1] = g / count;
                data[i + 2] = b / count;
                data[i + 3] = a / count;
            }
        }
    }
    
    applySharpenEffect(data, strength) {
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        const tempData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    const current = tempData[i + c];
                    const neighbors = [
                        tempData[i - 4 + c],
                        tempData[i + 4 + c],
                        tempData[i - width * 4 + c],
                        tempData[i + width * 4 + c]
                    ];
                    
                    const average = neighbors.reduce((a, b) => a + b, 0) / 4;
                    data[i + c] = current + (current - average) * strength;
                }
            }
        }
    }
    
    applyEmbossEffect(data, strength) {
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        const tempData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    const diff = tempData[i + c] - tempData[i + 4 + c];
                    data[i + c] = 128 + diff * strength;
                }
            }
        }
    }
    
    applyEdgeEffect(data, strength) {
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        const tempData = new Uint8ClampedArray(data);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const i = (y * width + x) * 4;
                
                for (let c = 0; c < 3; c++) {
                    const diff = Math.abs(tempData[i + c] - tempData[i + 4 + c]) +
                               Math.abs(tempData[i + c] - tempData[i - 4 + c]) +
                               Math.abs(tempData[i + c] - tempData[i + width * 4 + c]) +
                               Math.abs(tempData[i + c] - tempData[i - width * 4 + c]);
                    
                    data[i + c] = diff * strength;
                }
            }
        }
    }
    
    applyPixelateEffect(data, strength) {
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        const size = Math.max(1, Math.floor(strength * 20));
        
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                let r = 0, g = 0, b = 0, a = 0;
                let count = 0;
                
                for (let dy = 0; dy < size && y + dy < height; dy++) {
                    for (let dx = 0; dx < size && x + dx < width; dx++) {
                        const i = ((y + dy) * width + (x + dx)) * 4;
                        r += data[i];
                        g += data[i + 1];
                        b += data[i + 2];
                        a += data[i + 3];
                        count++;
                    }
                }
                
                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);
                a = Math.floor(a / count);
                
                for (let dy = 0; dy < size && y + dy < height; dy++) {
                    for (let dx = 0; dx < size && x + dx < width; dx++) {
                        const i = ((y + dy) * width + (x + dx)) * 4;
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                        data[i + 3] = a;
                    }
                }
            }
        }
    }
    
    applyNoiseEffect(data, strength) {
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * strength * 100;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
    }
    
    applySepiaEffect(data, strength) {
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            data[i] = (r * 0.393 + g * 0.769 + b * 0.189) * strength + r * (1 - strength);
            data[i + 1] = (r * 0.349 + g * 0.686 + b * 0.168) * strength + g * (1 - strength);
            data[i + 2] = (r * 0.272 + g * 0.534 + b * 0.131) * strength + b * (1 - strength);
        }
    }
    
    applyGrayscaleEffect(data, strength) {
        for (let i = 0; i < data.length; i += 4) {
            const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
            data[i] = gray * strength + data[i] * (1 - strength);
            data[i + 1] = gray * strength + data[i + 1] * (1 - strength);
            data[i + 2] = gray * strength + data[i + 2] * (1 - strength);
        }
    }
    
    applyInvertEffect(data, strength) {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - (data[i] - 255) * strength;
            data[i + 1] = 255 - (data[i + 1] - 255) * strength;
            data[i + 2] = 255 - (data[i + 2] - 255) * strength;
        }
    }
    
    applyPosterizeEffect(data, strength) {
        const levels = Math.floor(strength * 8) + 2;
        const step = 255 / (levels - 1);
        
        for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
                data[i + c] = Math.round(data[i + c] / step) * step;
            }
        }
    }
    
    applySolarizeEffect(data, strength) {
        const threshold = 128;
        for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
                if (data[i + c] > threshold) {
                    data[i + c] = 255 - (data[i + c] - 255) * strength;
                }
            }
        }
    }
    
    downloadImage() {
        const link = document.createElement('a');
        link.download = 'image-with-effect.png';
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
    
    resetImage() {
        // 重置所有参数
        this.currentImage = this.originalImage;
        this.zoom = 1;
        this.currentEffect = null;
        this.effectStrength = 50;
        this.brightness = 0;
        this.contrast = 0;
        this.saturation = 0;
        
        // 重置UI
        document.getElementById('effect-strength').value = 50;
        document.getElementById('brightness').value = 0;
        document.getElementById('contrast').value = 0;
        document.getElementById('saturation').value = 0;
        
        // 更新UI显示
        this.updateRangeValue('effect-strength', '50%');
        this.updateRangeValue('brightness', '0');
        this.updateRangeValue('contrast', '0');
        this.updateRangeValue('saturation', '0');
        
        // 清除特效选择
        document.querySelectorAll('.effect-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 更新画布
        this.updateCanvas();
    }
}

// 初始化工具
document.addEventListener('DOMContentLoaded', () => {
    window.imageEffects = new ImageEffects();
}); 