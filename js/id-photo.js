/**
 * 证件照制作工具
 * ID Photo Maker Tool
 */
class IdPhotoMaker {
    constructor() {
        // 界面元素
        this.uploadContainer = document.getElementById('upload-container');
        this.editorContainer = document.getElementById('editor-container');
        this.uploadArea = document.getElementById('upload-area');
        this.imageUpload = document.getElementById('image-upload');
        this.canvas = document.getElementById('image-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 工具面板
        this.sizeTabs = document.querySelectorAll('.tool-tab');
        this.toolPanels = document.querySelectorAll('.tool-panel');
        
        // 预设尺寸
        this.sizePresets = document.querySelectorAll('.size-preset');
        this.customSizeDiv = document.querySelector('.custom-size');
        this.customWidth = document.getElementById('custom-width');
        this.customHeight = document.getElementById('custom-height');
        this.dpiSelect = document.getElementById('dpi');
        
        // 背景颜色
        this.colorPresets = document.querySelectorAll('.color-preset');
        this.customColor = document.getElementById('custom-color');
        
        // 调整参数
        this.brightnessSlider = document.getElementById('brightness');
        this.contrastSlider = document.getElementById('contrast');
        this.saturationSlider = document.getElementById('saturation');
        this.rotateLeftBtn = document.getElementById('rotate-left');
        this.rotateRightBtn = document.getElementById('rotate-right');
        
        // 缩放控制
        this.zoomInBtn = document.getElementById('zoom-in');
        this.zoomOutBtn = document.getElementById('zoom-out');
        this.resetZoomBtn = document.getElementById('reset-zoom');
        
        // 操作按钮
        this.downloadBtn = document.getElementById('download-btn');
        this.resetBtn = document.getElementById('reset-btn');
        
        // 图片和照片属性
        this.originalImage = null;
        this.currentSize = '25x35';  // 默认一寸
        this.customSizeFlag = false;
        this.backgroundColor = '#FFFFFF';
        this.zoomLevel = 1;
        this.brightness = 0;
        this.contrast = 0;
        this.saturation = 0;
        this.rotation = 0;
        
        // 初始化事件监听器
        this.initializeEventListeners();
        
        // 监听语言变更
        document.addEventListener('languageChanged', this.onLanguageChanged.bind(this));
    }
    
    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 上传区域
        this.uploadArea.addEventListener('click', () => {
            this.imageUpload.click();
        });
        
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
            if (e.dataTransfer.files.length) {
                this.handleImageUpload(e.dataTransfer.files[0]);
            }
        });
        
        this.imageUpload.addEventListener('change', (e) => {
            if (e.target.files.length) {
                this.handleImageUpload(e.target.files[0]);
            }
        });
        
        // 工具切换
        this.sizeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.switchTool(tabName);
            });
        });
        
        // 尺寸设置
        this.sizePresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const size = preset.getAttribute('data-size');
                this.setSize(size);
            });
        });
        
        // 自定义尺寸
        this.customWidth.addEventListener('input', () => {
            this.updateCustomSize();
        });
        
        this.customHeight.addEventListener('input', () => {
            this.updateCustomSize();
        });
        
        this.dpiSelect.addEventListener('change', () => {
            this.updateCanvas();
        });
        
        // 背景颜色
        this.colorPresets.forEach(preset => {
            preset.addEventListener('click', () => {
                const color = preset.getAttribute('data-color');
                this.setBackground(color);
            });
        });
        
        this.customColor.addEventListener('input', () => {
            this.setBackground(this.customColor.value);
        });
        
        // 调整参数
        this.brightnessSlider.addEventListener('input', () => {
            this.brightness = parseInt(this.brightnessSlider.value);
            this.updateRangeValue('brightness', this.brightness);
            this.updateCanvas();
        });
        
        this.contrastSlider.addEventListener('input', () => {
            this.contrast = parseInt(this.contrastSlider.value);
            this.updateRangeValue('contrast', this.contrast);
            this.updateCanvas();
        });
        
        this.saturationSlider.addEventListener('input', () => {
            this.saturation = parseInt(this.saturationSlider.value);
            this.updateRangeValue('saturation', this.saturation);
            this.updateCanvas();
        });
        
        this.rotateLeftBtn.addEventListener('click', () => {
            this.rotation = (this.rotation - 90) % 360;
            this.updateCanvas();
        });
        
        this.rotateRightBtn.addEventListener('click', () => {
            this.rotation = (this.rotation + 90) % 360;
            this.updateCanvas();
        });
        
        // 缩放控制
        this.zoomInBtn.addEventListener('click', () => {
            this.setZoom(this.zoomLevel + 0.1);
        });
        
        this.zoomOutBtn.addEventListener('click', () => {
            this.setZoom(this.zoomLevel - 0.1);
        });
        
        this.resetZoomBtn.addEventListener('click', () => {
            this.setZoom(1);
        });
        
        // 操作按钮
        this.downloadBtn.addEventListener('click', () => {
            this.downloadPhoto();
        });
        
        this.resetBtn.addEventListener('click', () => {
            this.resetPhoto();
        });
    }
    
    /**
     * 处理语言变更事件
     */
    onLanguageChanged(e) {
        // 如果需要对一些动态元素进行特殊处理，可以在这里添加代码
        // 大多数静态元素通过HTML中的data-i18n属性自动更新
        
        // 更新滑块值文本
        this.updateRangeValue('brightness', this.brightness);
        this.updateRangeValue('contrast', this.contrast);
        this.updateRangeValue('saturation', this.saturation);
    }
    
    /**
     * 处理图片上传
     */
    handleImageUpload(file) {
        if (!file.type.startsWith('image/')) {
            alert(window.i18n && window.i18n.t ? 
                  window.i18n.t('common', 'invalidFileType') : 
                  '无效的文件类型，请上传图片文件');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.showEditor();
                this.updateCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    /**
     * 显示编辑器
     */
    showEditor() {
        this.uploadContainer.style.display = 'none';
        this.editorContainer.style.display = 'block';
    }
    
    /**
     * 设置缩放级别
     */
    setZoom(value) {
        this.zoomLevel = Math.max(0.1, Math.min(3, value));
        this.canvas.style.transform = `scale(${this.zoomLevel})`;
    }
    
    /**
     * 切换工具面板
     */
    switchTool(tool) {
        this.sizeTabs.forEach(tab => {
            if (tab.getAttribute('data-tab') === tool) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
        
        this.toolPanels.forEach(panel => {
            if (panel.id === `${tool}-panel`) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
    }
    
    /**
     * 设置照片尺寸
     */
    setSize(size) {
        this.sizePresets.forEach(preset => {
            if (preset.getAttribute('data-size') === size) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
        
        if (size === 'custom') {
            this.customSizeFlag = true;
            this.customSizeDiv.style.display = 'block';
            
            // 设置默认的自定义尺寸
            if (!this.customWidth.value) this.customWidth.value = 35;
            if (!this.customHeight.value) this.customHeight.value = 45;
            
            this.updateCustomSize();
        } else {
            this.customSizeFlag = false;
            this.customSizeDiv.style.display = 'none';
            this.currentSize = size;
            this.updateCanvas();
        }
    }
    
    /**
     * 更新自定义尺寸
     */
    updateCustomSize() {
        const width = parseInt(this.customWidth.value) || 35;
        const height = parseInt(this.customHeight.value) || 45;
        
        this.currentSize = `${width}x${height}`;
        this.updateCanvas();
    }
    
    /**
     * 设置背景颜色
     */
    setBackground(color) {
        this.backgroundColor = color;
        this.customColor.value = color;
        
        this.colorPresets.forEach(preset => {
            if (preset.getAttribute('data-color') === color) {
                preset.classList.add('active');
            } else {
                preset.classList.remove('active');
            }
        });
        
        this.updateCanvas();
    }
    
    /**
     * 更新范围滑块的值显示
     */
    updateRangeValue(id, value) {
        const rangeValue = document.querySelector(`#${id}`).nextElementSibling;
        rangeValue.textContent = value;
    }
    
    /**
     * 应用图像调整
     */
    updateAdjustments() {
        if (!this.originalImage) return;
        
        // 创建离屏canvas进行图像处理
        const offscreenCanvas = document.createElement('canvas');
        const offscreenCtx = offscreenCanvas.getContext('2d');
        
        // 设置与原始图像相同的尺寸
        offscreenCanvas.width = this.originalImage.width;
        offscreenCanvas.height = this.originalImage.height;
        
        // 绘制原始图像
        offscreenCtx.drawImage(this.originalImage, 0, 0);
        
        // 获取图像数据
        const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        const data = imageData.data;
        
        // 应用亮度、对比度和饱和度调整
        const brightness = this.brightness / 100;
        const contrast = this.contrast / 100;
        const saturation = this.saturation / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            // 获取RGB值
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // 应用亮度
            if (brightness !== 0) {
                if (brightness > 0) {
                    r += ((255 - r) * brightness);
                    g += ((255 - g) * brightness);
                    b += ((255 - b) * brightness);
                } else {
                    r += (r * brightness);
                    g += (g * brightness);
                    b += (b * brightness);
                }
            }
            
            // 应用对比度
            if (contrast !== 0) {
                const factor = (259 * (contrast + 1)) / (255 * (1 - contrast));
                r = factor * (r - 128) + 128;
                g = factor * (g - 128) + 128;
                b = factor * (b - 128) + 128;
            }
            
            // 应用饱和度
            if (saturation !== 0) {
                // 计算灰度值
                const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
                
                // 调整RGB值
                r = gray + saturation * (r - gray);
                g = gray + saturation * (g - gray);
                b = gray + saturation * (b - gray);
            }
            
            // 限制RGB值在0-255范围内
            data[i] = Math.max(0, Math.min(255, Math.round(r)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
        }
        
        // 将处理后的图像数据放回canvas
        offscreenCtx.putImageData(imageData, 0, 0);
        
        return offscreenCanvas;
    }
    
    /**
     * 更新Canvas绘制
     */
    updateCanvas() {
        if (!this.originalImage) return;
        
        // 获取证件照尺寸和DPI
        const [width, height] = this.currentSize.split('x').map(Number);
        const dpi = parseInt(this.dpiSelect.value);
        
        // 计算像素尺寸
        const pixelWidth = Math.round(width * dpi / 25.4);
        const pixelHeight = Math.round(height * dpi / 25.4);
        
        // 设置canvas尺寸
        this.canvas.width = pixelWidth;
        this.canvas.height = pixelHeight;
        
        // 填充背景色
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 应用图像调整
        const adjustedCanvas = this.updateAdjustments();
        
        // 计算缩放比例和位置，使图像居中
        const scaleX = pixelWidth / adjustedCanvas.width;
        const scaleY = pixelHeight / adjustedCanvas.height;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = adjustedCanvas.width * scale;
        const scaledHeight = adjustedCanvas.height * scale;
        const x = (pixelWidth - scaledWidth) / 2;
        const y = (pixelHeight - scaledHeight) / 2;
        
        // 清除canvas并重新绘制
        this.ctx.save();
        
        // 应用旋转
        if (this.rotation !== 0) {
            this.ctx.translate(pixelWidth / 2, pixelHeight / 2);
            this.ctx.rotate(this.rotation * Math.PI / 180);
            this.ctx.translate(-pixelWidth / 2, -pixelHeight / 2);
        }
        
        // 绘制调整后的图像
        this.ctx.drawImage(
            adjustedCanvas,
            0, 0, adjustedCanvas.width, adjustedCanvas.height,
            x, y, scaledWidth, scaledHeight
        );
        
        this.ctx.restore();
    }
    
    /**
     * 下载证件照
     */
    downloadPhoto() {
        if (!this.canvas) {
            alert('请先上传图片');
            return;
        }
        
        // 根据尺寸类型设置文件名
        let sizeText = '证件照';
        if (this.currentSize === '25x35') {
            sizeText = window.i18n && window.i18n.t ? 
                      window.i18n.t('idPhoto', 'oneInch') : 
                      '一寸';
        } else if (this.currentSize === '35x45') {
            sizeText = window.i18n && window.i18n.t ? 
                      window.i18n.t('idPhoto', 'twoInch') : 
                      '二寸';
        } else if (this.currentSize === '35x53') {
            sizeText = window.i18n && window.i18n.t ? 
                      window.i18n.t('idPhoto', 'smallTwoInch') : 
                      '小二寸';
        } else if (this.currentSize === '40x60') {
            sizeText = window.i18n && window.i18n.t ? 
                      window.i18n.t('idPhoto', 'passport') : 
                      '护照';
        }
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `${sizeText}_${new Date().getTime()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
    }
    
    /**
     * 重置照片
     */
    resetPhoto() {
        if (!this.originalImage) return;
        
        // 重置所有参数
        this.zoomLevel = 1;
        this.canvas.style.transform = 'scale(1)';
        
        this.brightness = 0;
        this.contrast = 0;
        this.saturation = 0;
        this.rotation = 0;
        
        // 重置滑块位置
        this.brightnessSlider.value = 0;
        this.contrastSlider.value = 0;
        this.saturationSlider.value = 0;
        
        // 更新滑块值显示
        this.updateRangeValue('brightness', 0);
        this.updateRangeValue('contrast', 0);
        this.updateRangeValue('saturation', 0);
        
        // 更新canvas
        this.updateCanvas();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    const idPhotoMaker = new IdPhotoMaker();
}); 