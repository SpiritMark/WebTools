// 图片编辑器类
class ImageEditor {
    constructor() {
        this.canvas = document.getElementById('image-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.currentImage = null;
        this.isDrawing = false;
        this.currentTool = 'adjust';
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        
        // 获取DOM元素
        this.uploadArea = document.getElementById('upload-area');
        this.uploadInput = document.getElementById('image-upload');
        this.editorContainer = document.getElementById('editor-container');
        this.uploadContainer = document.getElementById('upload-container');
        this.editContainer = document.getElementById('edit-container');
        
        // 绘画相关
        this.drawingLayer = document.getElementById('drawing-layer');
        this.textLayer = document.getElementById('text-layer');
        this.texts = [];
        this.stickers = [];
        
        // 调整参数
        this.adjustments = {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            hue: 0,
            blur: 0
        };
        
        // 裁剪参数
        this.cropperInstance = null;
        
        // 滤镜参数
        this.currentFilter = 'none';
        this.filterStrength = 1;
        
        // 添加裁剪相关属性
        this.cropMode = false;
        this.cropStartX = 0;
        this.cropStartY = 0;
        this.cropWidth = 0;
        this.cropHeight = 0;
        this.cropRatio = null;
        
        // 添加文字相关属性
        this.selectedText = null;
        this.isDraggingText = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        // 添加绘画相关属性
        this.brushSize = 5;
        this.brushColor = '#ff0000';
        this.brushType = 'brush';
        this.lastX = 0;
        this.lastY = 0;
        this.drawingHistory = [];
        this.currentHistoryIndex = -1;
        
        // 添加贴纸相关属性
        this.selectedSticker = null;
        this.isDraggingSticker = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        // 定义滤镜效果
        this.filters = {
            none: {
                name: '原图',
                matrix: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]
            },
            grayscale: {
                name: '黑白',
                matrix: [0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0, 0, 0, 1, 0]
            },
            sepia: {
                name: '复古',
                matrix: [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0]
            },
            warm: {
                name: '暖色',
                matrix: [1.1, 0, 0, 0, 30, 0, 1.02, 0, 0, 15, 0, 0, 0.9, 0, -10, 0, 0, 0, 1, 0]
            },
            cool: {
                name: '冷色',
                matrix: [0.9, 0, 0, 0, -10, 0, 0.95, 0, 0, -5, 0, 0, 1.2, 0, 20, 0, 0, 0, 1, 0]
            },
            hdr: {
                name: 'HDR',
                matrix: [1.5, -0.1, -0.1, 0, 15, -0.1, 1.5, -0.1, 0, 15, -0.1, -0.1, 1.5, 0, 15, 0, 0, 0, 1, 0]
            },
            vintage: {
                name: '老照片',
                matrix: [0.7, 0.4, 0.2, 0, 10, 0.2, 0.6, 0.1, 0, 5, 0.1, 0.3, 0.5, 0, -5, 0, 0, 0, 1, 0]
            },
            dramatic: {
                name: '戏剧',
                matrix: [1.5, -0.2, -0.2, 0, -30, -0.2, 1.5, -0.2, 0, -30, -0.2, -0.2, 1.5, 0, -30, 0, 0, 0, 1, 0]
            }
        };
        
        // 定义贴纸
        this.stickerList = [
            { id: 'smile', icon: '😊', name: '笑脸' },
            { id: 'heart', icon: '❤️', name: '心形' },
            { id: 'star', icon: '⭐', name: '星星' },
            { id: 'thumbsup', icon: '👍', name: '点赞' },
            { id: 'fire', icon: '🔥', name: '火焰' },
            { id: 'rocket', icon: '🚀', name: '火箭' },
            { id: 'rainbow', icon: '🌈', name: '彩虹' },
            { id: 'sun', icon: '☀️', name: '太阳' },
            { id: 'moon', icon: '🌙', name: '月亮' },
            { id: 'cloud', icon: '☁️', name: '云朵' },
            { id: 'rain', icon: '🌧️', name: '下雨' },
            { id: 'snow', icon: '🌨️', name: '下雪' },
            { id: 'flower', icon: '🌸', name: '花朵' },
            { id: 'tree', icon: '🌳', name: '树木' },
            { id: 'house', icon: '🏠', name: '房子' },
            { id: 'car', icon: '🚗', name: '汽车' },
            { id: 'bike', icon: '🚲', name: '自行车' },
            { id: 'plane', icon: '✈️', name: '飞机' },
            { id: 'boat', icon: '🚢', name: '船' },
            { id: 'train', icon: '🚂', name: '火车' }
        ];
        
        // 确保所有元素都存在
        this.validateElements();
        
        // 初始化事件监听
        this.initializeEventListeners();
        
        // 初始化调整事件监听
        this.initializeAdjustmentListeners();
        
        // 初始化裁剪事件监听
        this.initializeCropListeners();
        
        // 初始化滤镜事件监听
        this.initializeFilterListeners();
        
        // 初始化文字事件监听
        this.initializeTextListeners();
        
        // 初始化绘画事件监听
        this.initializeDrawListeners();
        
        // 初始化贴纸事件监听
        this.initializeStickerListeners();
        
        // 初始化保存按钮
        this.initializeSaveButton();
        
        console.log('图片编辑器初始化完成');
    }
    
    validateElements() {
        const elements = [
            { name: 'canvas', element: this.canvas },
            { name: 'uploadArea', element: this.uploadArea },
            { name: 'uploadInput', element: this.uploadInput },
            { name: 'editorContainer', element: this.editorContainer },
            { name: 'uploadContainer', element: this.uploadContainer },
            { name: 'editContainer', element: this.editContainer }
        ];
        
        let missingElements = elements.filter(item => !item.element);
        
        if (missingElements.length > 0) {
            console.error('缺少以下元素:', missingElements.map(item => item.name).join(', '));
            alert('页面元素加载不完整，请刷新页面重试');
        }
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
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleImageUpload(file);
            }
        });
        
        // 文件选择处理
        this.uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });
        
        // 工具切换处理
        document.querySelectorAll('.tool-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTool(tab.dataset.tab);
            });
        });
    }
    
    handleImageUpload(file) {
        if (!file || !file.type.match('image.*')) {
            console.error('不是有效的图片文件');
            alert('请选择有效的图片文件');
            return;
        }
        
        console.log('开始上传图片:', file.name);
        
        const reader = new FileReader();
        
        reader.onerror = () => {
            console.error('文件读取失败');
            alert('图片读取失败，请重试');
        };
        
        reader.onload = (e) => {
            console.log('图片读取成功，正在加载');
            
            const img = new Image();
            
            img.onerror = () => {
                console.error('图片加载失败');
                alert('图片加载失败，请选择其他图片');
            };
            
            img.onload = () => {
                console.log('图片加载完成，尺寸:', img.width, 'x', img.height);
                this.originalImage = img;
                this.currentImage = img;
                
                // 重置编辑状态
                this.rotation = 0;
                this.flipH = false;
                this.flipV = false;
                
                // 设置画布并显示编辑器
                this.setupCanvas(img);
                this.showEditor();
            };
            
            img.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    setupCanvas(img) {
        // 计算画布大小，保持图片比例
        const maxWidth = this.canvas.parentElement.clientWidth || 800;
        const maxHeight = this.canvas.parentElement.clientHeight || 600;
        let width = img.width;
        let height = img.height;
        
        // 存储原始图片尺寸
        this.originalWidth = width;
        this.originalHeight = height;
        
        // 计算缩放比例
        const scale = Math.min(maxWidth / width, maxHeight / height);
        
        width = width * scale;
        height = height * scale;
        
        // 设置画布尺寸
        this.canvas.width = width;
        this.canvas.height = height;
        
        // 更新图片信息
        const dimensions = document.getElementById('image-dimensions');
        const filesize = document.getElementById('image-filesize');
        if (dimensions) dimensions.textContent = `尺寸: ${img.width} x ${img.height}`;
        if (filesize) filesize.textContent = `文件大小: ${Math.round(img.src.length / 1024)} KB`;
        
        // 绘制图片
        this.drawImage();
        
        console.log("Canvas setup complete. Width:", width, "Height:", height);
    }
    
    drawImage() {
        if (!this.currentImage) {
            console.log("No current image to draw");
            return;
        }
        
        console.log("Drawing image to canvas");
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        
        // 应用变换
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        this.ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        
        // 绘制图片
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制文字
        this.texts.forEach(text => {
            this.ctx.save();
            
            // 设置文字样式
            this.ctx.font = `${text.bold ? 'bold' : ''} ${text.italic ? 'italic' : ''} ${text.fontSize}px ${text.fontFamily}`;
            this.ctx.fillStyle = text.color;
            
            // 绘制文字
            this.ctx.fillText(text.text, text.x, text.y);
            
            // 绘制下划线
            if (text.underline) {
                const metrics = this.ctx.measureText(text.text);
                this.ctx.beginPath();
                this.ctx.moveTo(text.x, text.y + 2);
                this.ctx.lineTo(text.x + metrics.width, text.y + 2);
                this.ctx.strokeStyle = text.color;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
            
            // 绘制选中框
            if (text === this.selectedText) {
                const metrics = this.ctx.measureText(text.text);
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(
                    text.x - 2,
                    text.y - text.fontSize - 2,
                    metrics.width + 4,
                    text.fontSize + 4
                );
            }
            
            this.ctx.restore();
        });
        
        // 绘制贴纸
        this.stickers.forEach(sticker => {
            this.ctx.save();
            this.ctx.font = `${sticker.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(sticker.icon, sticker.x, sticker.y);
            
            // 绘制选中框
            if (sticker === this.selectedSticker) {
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(
                    sticker.x - sticker.size/2 - 2,
                    sticker.y - sticker.size/2 - 2,
                    sticker.size + 4,
                    sticker.size + 4
                );
            }
            
            this.ctx.restore();
        });
        
        // 绘制裁剪框
        if (this.currentTool === 'crop' && (this.cropWidth !== 0 || this.cropHeight !== 0)) {
            const x = this.cropStartX + (this.cropWidth < 0 ? this.cropWidth : 0);
            const y = this.cropStartY + (this.cropHeight < 0 ? this.cropHeight : 0);
            const width = Math.abs(this.cropWidth);
            const height = Math.abs(this.cropHeight);
            
            // 绘制半透明遮罩
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.clearRect(x, y, width, height);
            
            // 绘制裁剪框
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, width, height);
            
            // 绘制控制点
            this.ctx.fillStyle = '#fff';
            const handleSize = 8;
            this.ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
            this.ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
            this.ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
            this.ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
        }
        
        this.ctx.restore();
    }
    
    showEditor() {
        console.log('显示编辑器');
        this.uploadContainer.style.display = 'none';
        this.editContainer.style.display = 'block';
        
        // 设置初始工具
        this.switchTool('adjust');
        
        // 刷新UI
        this.updateAdjustments();
        
        // 更新滤镜预览
        this.updateFilterPreviews();
        
        // 确保绘图层与画布大小一致
        if (this.drawingLayer) {
            this.drawingLayer.style.width = this.canvas.width + 'px';
            this.drawingLayer.style.height = this.canvas.height + 'px';
        }
        
        if (this.textLayer) {
            this.textLayer.style.width = this.canvas.width + 'px';
            this.textLayer.style.height = this.canvas.height + 'px';
        }
    }
    
    switchTool(tool) {
        this.currentTool = tool;
        
        // 更新UI
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
    
    initializeAdjustmentListeners() {
        // 亮度调整
        const brightnessSlider = document.getElementById('brightness');
        brightnessSlider.addEventListener('input', (e) => {
            this.adjustments.brightness = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('brightness', e.target.value);
        });
        
        // 对比度调整
        const contrastSlider = document.getElementById('contrast');
        contrastSlider.addEventListener('input', (e) => {
            this.adjustments.contrast = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('contrast', e.target.value);
        });
        
        // 饱和度调整
        const saturationSlider = document.getElementById('saturation');
        saturationSlider.addEventListener('input', (e) => {
            this.adjustments.saturation = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('saturation', e.target.value);
        });
        
        // 色调调整
        const hueSlider = document.getElementById('hue');
        hueSlider.addEventListener('input', (e) => {
            this.adjustments.hue = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('hue', e.target.value);
        });
        
        // 模糊调整
        const blurSlider = document.getElementById('blur');
        blurSlider.addEventListener('input', (e) => {
            this.adjustments.blur = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('blur', e.target.value);
        });
        
        // 旋转和翻转按钮
        document.getElementById('rotate-left').addEventListener('click', () => {
            this.rotation = (this.rotation - 90) % 360;
            this.drawImage();
        });
        
        document.getElementById('rotate-right').addEventListener('click', () => {
            this.rotation = (this.rotation + 90) % 360;
            this.drawImage();
        });
        
        document.getElementById('flip-h').addEventListener('click', () => {
            this.flipH = !this.flipH;
            this.drawImage();
        });
        
        document.getElementById('flip-v').addEventListener('click', () => {
            this.flipV = !this.flipV;
            this.drawImage();
        });
    }
    
    initializeCropListeners() {
        // 裁剪预设按钮
        document.querySelectorAll('.crop-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setCropRatio(btn.dataset.ratio);
            });
        });
        
        // 应用裁剪按钮
        document.getElementById('apply-crop').addEventListener('click', () => {
            this.applyCrop();
        });
        
        // 取消裁剪按钮
        document.getElementById('cancel-crop').addEventListener('click', () => {
            this.cancelCrop();
        });
        
        // 画布鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'crop') {
                this.startCrop(e);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.currentTool === 'crop' && this.cropMode) {
                this.updateCrop(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.currentTool === 'crop' && this.cropMode) {
                this.endCrop();
            }
        });
    }
    
    initializeFilterListeners() {
        // 滤镜选择
        const filterItems = document.querySelectorAll('.filter-item');
        
        // 创建滤镜预览图
        this.createFilterPreviews();
        
        filterItems.forEach(item => {
            item.addEventListener('click', () => {
                this.setFilter(item.dataset.filter);
            });
        });
        
        // 滤镜强度调整
        const filterStrengthSlider = document.getElementById('filter-strength');
        filterStrengthSlider.addEventListener('input', (e) => {
            this.filterStrength = parseInt(e.target.value) / 100;
            this.updateFilter();
            this.updateRangeValue('filter-strength', e.target.value + '%');
        });
    }
    
    // 创建滤镜预览图
    createFilterPreviews() {
        if (!this.originalImage) return;
        
        const filterItems = document.querySelectorAll('.filter-item');
        
        filterItems.forEach(item => {
            const filterName = item.dataset.filter;
            const previewDiv = item.querySelector('.filter-preview');
            
            if (!previewDiv) return;
            
            // 创建预览图
            const canvas = document.createElement('canvas');
            canvas.width = 80;
            canvas.height = 80;
            const ctx = canvas.getContext('2d');
            
            // 创建默认预览图
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 添加滤镜名称
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.filters[filterName]?.name || filterName, canvas.width/2, canvas.height/2);
            
            // 设置预览图
            previewDiv.innerHTML = '';
            previewDiv.appendChild(canvas);
        });
    }
    
    // 更新滤镜预览图，当有图片时调用
    updateFilterPreviews() {
        if (!this.originalImage) return;
        
        const filterItems = document.querySelectorAll('.filter-item');
        const previewSize = 80;
        
        filterItems.forEach(item => {
            const filterName = item.dataset.filter;
            const previewDiv = item.querySelector('.filter-preview');
            
            if (!previewDiv) return;
            
            // 创建预览图
            const canvas = document.createElement('canvas');
            canvas.width = previewSize;
            canvas.height = previewSize;
            const ctx = canvas.getContext('2d');
            
            // 绘制预览图
            const scale = Math.min(previewSize / this.originalImage.width, previewSize / this.originalImage.height);
            const width = this.originalImage.width * scale;
            const height = this.originalImage.height * scale;
            const x = (previewSize - width) / 2;
            const y = (previewSize - height) / 2;
            
            // 绘制原始图片
            ctx.drawImage(this.originalImage, x, y, width, height);
            
            // 应用滤镜
            if (filterName !== 'none' && this.filters[filterName]) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                
                // 应用滤镜矩阵
                const matrix = this.filters[filterName].matrix;
                
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    data[i] = r * matrix[0] + g * matrix[1] + b * matrix[2] + matrix[4];
                    data[i + 1] = r * matrix[5] + g * matrix[6] + b * matrix[7] + matrix[9];
                    data[i + 2] = r * matrix[10] + g * matrix[11] + b * matrix[12] + matrix[14];
                }
                
                ctx.putImageData(imageData, 0, 0);
            }
            
            // 设置预览图
            previewDiv.innerHTML = '';
            previewDiv.appendChild(canvas);
        });
    }
    
    initializeTextListeners() {
        // 添加文字按钮
        document.getElementById('add-text').addEventListener('click', () => {
            this.addText();
        });
        
        // 文字样式控制
        const fontFamily = document.getElementById('font-family');
        const fontSize = document.getElementById('font-size');
        const fontColor = document.getElementById('font-color');
        const textBold = document.getElementById('text-bold');
        const textItalic = document.getElementById('text-italic');
        const textUnderline = document.getElementById('text-underline');
        
        fontFamily.addEventListener('change', () => {
            if (this.selectedText) {
                this.selectedText.fontFamily = fontFamily.value;
                this.drawImage();
            }
        });
        
        fontSize.addEventListener('change', () => {
            if (this.selectedText) {
                this.selectedText.fontSize = parseInt(fontSize.value);
                this.drawImage();
            }
        });
        
        fontColor.addEventListener('input', () => {
            if (this.selectedText) {
                this.selectedText.color = fontColor.value;
                this.drawImage();
            }
        });
        
        textBold.addEventListener('click', () => {
            if (this.selectedText) {
                this.selectedText.bold = !this.selectedText.bold;
                textBold.classList.toggle('active');
                this.drawImage();
            }
        });
        
        textItalic.addEventListener('click', () => {
            if (this.selectedText) {
                this.selectedText.italic = !this.selectedText.italic;
                textItalic.classList.toggle('active');
                this.drawImage();
            }
        });
        
        textUnderline.addEventListener('click', () => {
            if (this.selectedText) {
                this.selectedText.underline = !this.selectedText.underline;
                textUnderline.classList.toggle('active');
                this.drawImage();
            }
        });
        
        // 画布鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'text') {
                this.handleTextMouseDown(e);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.currentTool === 'text' && this.isDraggingText) {
                this.handleTextMouseMove(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.currentTool === 'text' && this.isDraggingText) {
                this.handleTextMouseUp();
            }
        });
    }
    
    initializeDrawListeners() {
        // 笔刷大小调整
        const brushSizeSlider = document.getElementById('brush-size');
        brushSizeSlider.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            this.updateRangeValue('brush-size', e.target.value + 'px');
        });
        
        // 笔刷颜色选择
        const brushColorPicker = document.getElementById('brush-color');
        brushColorPicker.addEventListener('input', (e) => {
            this.brushColor = e.target.value;
        });
        
        // 笔刷类型选择
        document.querySelectorAll('.brush-type').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setBrushType(btn.dataset.type);
            });
        });
        
        // 清除绘画按钮
        document.getElementById('clear-drawing').addEventListener('click', () => {
            this.clearDrawing();
        });
        
        // 画布鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'draw') {
                this.startDrawing(e);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.currentTool === 'draw' && this.isDrawing) {
                this.draw(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.currentTool === 'draw' && this.isDrawing) {
                this.stopDrawing();
            }
        });
        
        this.canvas.addEventListener('mouseout', () => {
            if (this.currentTool === 'draw' && this.isDrawing) {
                this.stopDrawing();
            }
        });
    }
    
    initializeStickerListeners() {
        // 初始化贴纸网格
        const stickersGrid = document.querySelector('.stickers-grid');
        this.stickerList.forEach(sticker => {
            const stickerElement = document.createElement('div');
            stickerElement.className = 'sticker-item';
            stickerElement.innerHTML = `
                <div class="sticker-icon">${sticker.icon}</div>
                <div class="sticker-name">${sticker.name}</div>
            `;
            stickerElement.addEventListener('click', () => {
                this.addSticker(sticker);
            });
            stickersGrid.appendChild(stickerElement);
        });
        
        // 画布鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'stickers') {
                this.handleStickerMouseDown(e);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.currentTool === 'stickers' && this.isDraggingSticker) {
                this.handleStickerMouseMove(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            if (this.currentTool === 'stickers' && this.isDraggingSticker) {
                this.handleStickerMouseUp();
            }
        });
    }
    
    initializeSaveButton() {
        const saveButton = document.createElement('button');
        saveButton.className = 'save-btn';
        saveButton.innerHTML = '<i class="ri-save-line"></i> 保存图片';
        saveButton.addEventListener('click', () => {
            this.saveImage();
        });
        
        document.querySelector('.editor-preview').appendChild(saveButton);
    }
    
    setCropRatio(ratio) {
        this.cropRatio = ratio;
        this.cropMode = true;
        
        // 更新UI
        document.querySelectorAll('.crop-preset').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.ratio === ratio) {
                btn.classList.add('active');
            }
        });
        
        // 重置裁剪区域
        this.cropStartX = 0;
        this.cropStartY = 0;
        this.cropWidth = 0;
        this.cropHeight = 0;
        
        this.drawImage();
    }
    
    startCrop(e) {
        if (this.currentTool !== 'crop') return;
        
        const rect = this.canvas.getBoundingClientRect();
        this.cropStartX = e.clientX - rect.left;
        this.cropStartY = e.clientY - rect.top;
        this.cropMode = true;
        this.cropWidth = 0;
        this.cropHeight = 0;
    }
    
    updateCrop(e) {
        if (!this.cropMode) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.cropWidth = currentX - this.cropStartX;
        this.cropHeight = currentY - this.cropStartY;
        
        // 如果设置了裁剪比例，调整高度
        if (this.cropRatio && this.cropRatio !== 'free') {
            const [w, h] = this.cropRatio.split(':').map(Number);
            const ratio = w / h;
            
            if (Math.abs(this.cropWidth) > Math.abs(this.cropHeight * ratio)) {
                this.cropHeight = Math.abs(this.cropWidth / ratio) * Math.sign(this.cropHeight);
            } else {
                this.cropWidth = Math.abs(this.cropHeight * ratio) * Math.sign(this.cropWidth);
            }
        }
        
        this.drawImage();
    }
    
    endCrop() {
        this.cropMode = false;
        
        // 确保裁剪区域有效
        if (Math.abs(this.cropWidth) < 10 || Math.abs(this.cropHeight) < 10) {
            this.cropWidth = 0;
            this.cropHeight = 0;
        }
        
        this.drawImage();
    }
    
    applyCrop() {
        if (!this.currentImage || (this.cropWidth === 0 && this.cropHeight === 0)) return;
        
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // 计算裁剪区域
        const x = this.cropStartX + (this.cropWidth < 0 ? this.cropWidth : 0);
        const y = this.cropStartY + (this.cropHeight < 0 ? this.cropHeight : 0);
        const width = Math.abs(this.cropWidth);
        const height = Math.abs(this.cropHeight);
        
        // 设置临时画布大小
        tempCanvas.width = width;
        tempCanvas.height = height;
        
        // 绘制裁剪区域
        tempCtx.drawImage(this.currentImage, x, y, width, height, 0, 0, width, height);
        
        // 更新当前图片
        this.currentImage = tempCanvas;
        this.originalImage = tempCanvas;
        
        // 重置裁剪状态
        this.cropMode = false;
        this.cropWidth = 0;
        this.cropHeight = 0;
        this.cropRatio = null;
        
        // 更新画布大小
        this.setupCanvas(tempCanvas);
        
        // 更新UI
        document.querySelectorAll('.crop-preset').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    cancelCrop() {
        this.cropMode = false;
        this.cropWidth = 0;
        this.cropHeight = 0;
        this.cropRatio = null;
        
        // 更新UI
        document.querySelectorAll('.crop-preset').forEach(btn => {
            btn.classList.remove('active');
        });
        
        this.drawImage();
    }
    
    updateRangeValue(id, value) {
        const valueElement = document.querySelector(`#${id} + .range-value`);
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
    
    updateAdjustments() {
        if (!this.originalImage) return;
        
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 绘制原始图片
        tempCtx.drawImage(this.originalImage, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // 获取图像数据
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // 应用调整
        for (let i = 0; i < data.length; i += 4) {
            // 亮度
            if (this.adjustments.brightness !== 0) {
                data[i] += this.adjustments.brightness;
                data[i + 1] += this.adjustments.brightness;
                data[i + 2] += this.adjustments.brightness;
            }
            
            // 对比度
            if (this.adjustments.contrast !== 0) {
                const factor = (259 * (this.adjustments.contrast + 255)) / (255 * (259 - this.adjustments.contrast));
                data[i] = factor * (data[i] - 128) + 128;
                data[i + 1] = factor * (data[i + 1] - 128) + 128;
                data[i + 2] = factor * (data[i + 2] - 128) + 128;
            }
            
            // 饱和度
            if (this.adjustments.saturation !== 0) {
                const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
                data[i] = gray + (data[i] - gray) * (1 + this.adjustments.saturation / 100);
                data[i + 1] = gray + (data[i + 1] - gray) * (1 + this.adjustments.saturation / 100);
                data[i + 2] = gray + (data[i + 2] - gray) * (1 + this.adjustments.saturation / 100);
            }
            
            // 色调
            if (this.adjustments.hue !== 0) {
                const hsv = this.rgbToHsv(data[i], data[i + 1], data[i + 2]);
                hsv[0] = (hsv[0] + this.adjustments.hue) % 360;
                const rgb = this.hsvToRgb(hsv[0], hsv[1], hsv[2]);
                data[i] = rgb[0];
                data[i + 1] = rgb[1];
                data[i + 2] = rgb[2];
            }
        }
        
        // 应用模糊
        if (this.adjustments.blur > 0) {
            tempCtx.putImageData(imageData, 0, 0);
            tempCtx.filter = `blur(${this.adjustments.blur}px)`;
            tempCtx.drawImage(tempCanvas, 0, 0);
            imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        }
        
        // 更新当前图片
        tempCtx.putImageData(imageData, 0, 0);
        this.currentImage = tempCanvas;
        this.drawImage();
    }
    
    rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const d = max - min;
        
        let h = 0;
        const s = max === 0 ? 0 : d / max;
        const v = max;
        
        if (max !== min) {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }
        
        return [h * 360, s * 100, v * 100];
    }
    
    hsvToRgb(h, s, v) {
        h /= 360;
        s /= 100;
        v /= 100;
        
        let r, g, b;
        
        const i = Math.floor(h * 6);
        const f = h * 6 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;
            case 1:
                r = q;
                g = v;
                b = p;
                break;
            case 2:
                r = p;
                g = v;
                b = t;
                break;
            case 3:
                r = p;
                g = q;
                b = v;
                break;
            case 4:
                r = t;
                g = p;
                b = v;
                break;
            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }
        
        return [r * 255, g * 255, b * 255];
    }
    
    setFilter(filterName) {
        if (!this.filters[filterName]) {
            console.error(`未找到滤镜: ${filterName}`);
            return;
        }
        
        console.log(`设置滤镜: ${filterName}`);
        this.currentFilter = filterName;
        
        // 更新UI
        document.querySelectorAll('.filter-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.filter === filterName) {
                item.classList.add('active');
            }
        });
        
        this.updateFilter();
    }
    
    updateFilter() {
        if (!this.originalImage) {
            console.log('没有原始图片，无法应用滤镜');
            return;
        }
        
        console.log(`应用滤镜: ${this.currentFilter}, 强度: ${this.filterStrength}`);
        
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 清除画布
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 绘制原始图片
        tempCtx.drawImage(this.originalImage, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // 获取图像数据
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // 应用滤镜
        if (this.currentFilter !== 'none') {
            const filter = this.filters[this.currentFilter];
            if (!filter) {
                console.error(`未找到滤镜: ${this.currentFilter}`);
                return;
            }
            
            // 如果强度为0，返回原始图片
            if (this.filterStrength <= 0) {
                this.currentImage = this.originalImage;
                this.drawImage();
                return;
            }
            
            // 计算混合矩阵 (原始矩阵与单位矩阵之间的插值)
            const identityMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];
            const matrix = filter.matrix.map((value, index) => {
                const identity = identityMatrix[index];
                return identity + (value - identity) * this.filterStrength;
            });
            
            // 应用颜色矩阵
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // 应用颜色变换
                data[i] = Math.max(0, Math.min(255, r * matrix[0] + g * matrix[1] + b * matrix[2] + matrix[4]));
                data[i + 1] = Math.max(0, Math.min(255, r * matrix[5] + g * matrix[6] + b * matrix[7] + matrix[9]));
                data[i + 2] = Math.max(0, Math.min(255, r * matrix[10] + g * matrix[11] + b * matrix[12] + matrix[14]));
            }
            
            // 将修改后的图像数据放回画布
            tempCtx.putImageData(imageData, 0, 0);
        }
        
        // 更新当前图片
        this.currentImage = tempCanvas;
        this.drawImage();
    }
    
    addText() {
        const textInput = document.getElementById('text-input');
        const text = textInput.value.trim();
        
        if (!text) return;
        
        const textObj = {
            text: text,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            fontFamily: document.getElementById('font-family').value,
            fontSize: parseInt(document.getElementById('font-size').value),
            color: document.getElementById('font-color').value,
            bold: false,
            italic: false,
            underline: false
        };
        
        this.texts.push(textObj);
        this.selectedText = textObj;
        textInput.value = '';
        
        // 更新UI
        document.getElementById('text-bold').classList.remove('active');
        document.getElementById('text-italic').classList.remove('active');
        document.getElementById('text-underline').classList.remove('active');
        
        this.drawImage();
    }
    
    handleTextMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了文字
        this.selectedText = null;
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const text = this.texts[i];
            const metrics = this.ctx.measureText(text.text);
            const textWidth = metrics.width;
            const textHeight = text.fontSize;
            
            if (x >= text.x && x <= text.x + textWidth &&
                y >= text.y - textHeight && y <= text.y) {
                this.selectedText = text;
                this.isDraggingText = true;
                this.dragStartX = x - text.x;
                this.dragStartY = y - text.y;
                break;
            }
        }
        
        this.drawImage();
    }
    
    handleTextMouseMove(e) {
        if (!this.selectedText || !this.isDraggingText) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.selectedText.x = x - this.dragStartX;
        this.selectedText.y = y - this.dragStartY;
        
        this.drawImage();
    }
    
    handleTextMouseUp() {
        this.isDraggingText = false;
    }
    
    setBrushType(type) {
        this.brushType = type;
        
        // 更新UI
        document.querySelectorAll('.brush-type').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            }
        });
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        
        // 创建新的历史记录
        this.drawingHistory = this.drawingHistory.slice(0, this.currentHistoryIndex + 1);
        this.drawingHistory.push(this.canvas.toDataURL());
        this.currentHistoryIndex++;
    }
    
    draw(e) {
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(currentX, currentY);
        
        // 设置笔刷样式
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // 根据笔刷类型设置不同的效果
        switch (this.brushType) {
            case 'brush':
                this.ctx.globalAlpha = 1;
                this.ctx.stroke();
                break;
                
            case 'marker':
                this.ctx.globalAlpha = 0.3;
                this.ctx.stroke();
                break;
                
            case 'eraser':
                this.ctx.globalCompositeOperation = 'destination-out';
                this.ctx.stroke();
                this.ctx.globalCompositeOperation = 'source-over';
                break;
        }
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.ctx.beginPath();
    }
    
    clearDrawing() {
        // 保存当前状态到历史记录
        this.drawingHistory = this.drawingHistory.slice(0, this.currentHistoryIndex + 1);
        this.drawingHistory.push(this.canvas.toDataURL());
        this.currentHistoryIndex++;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawImage();
    }
    
    addSticker(sticker) {
        const stickerObj = {
            id: sticker.id,
            icon: sticker.icon,
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 40
        };
        
        this.stickers.push(stickerObj);
        this.selectedSticker = stickerObj;
        this.drawImage();
    }
    
    handleStickerMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了贴纸
        this.selectedSticker = null;
        for (let i = this.stickers.length - 1; i >= 0; i--) {
            const sticker = this.stickers[i];
            const stickerSize = sticker.size;
            
            if (x >= sticker.x - stickerSize/2 && x <= sticker.x + stickerSize/2 &&
                y >= sticker.y - stickerSize/2 && y <= sticker.y + stickerSize/2) {
                this.selectedSticker = sticker;
                this.isDraggingSticker = true;
                this.dragStartX = x - sticker.x;
                this.dragStartY = y - sticker.y;
                break;
            }
        }
        
        this.drawImage();
    }
    
    handleStickerMouseMove(e) {
        if (!this.selectedSticker || !this.isDraggingSticker) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.selectedSticker.x = x - this.dragStartX;
        this.selectedSticker.y = y - this.dragStartY;
        
        this.drawImage();
    }
    
    handleStickerMouseUp() {
        this.isDraggingSticker = false;
    }
    
    saveImage() {
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 绘制当前图片
        tempCtx.drawImage(this.currentImage, 0, 0, tempCanvas.width, tempCanvas.height);
        
        // 绘制文字
        this.texts.forEach(text => {
            tempCtx.save();
            tempCtx.font = `${text.bold ? 'bold' : ''} ${text.italic ? 'italic' : ''} ${text.fontSize}px ${text.fontFamily}`;
            tempCtx.fillStyle = text.color;
            tempCtx.fillText(text.text, text.x, text.y);
            tempCtx.restore();
        });
        
        // 绘制贴纸
        this.stickers.forEach(sticker => {
            tempCtx.save();
            tempCtx.font = `${sticker.size}px Arial`;
            tempCtx.textAlign = 'center';
            tempCtx.textBaseline = 'middle';
            tempCtx.fillText(sticker.icon, sticker.x, sticker.y);
            tempCtx.restore();
        });
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
}

// 初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
});
