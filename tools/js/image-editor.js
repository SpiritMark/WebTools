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
            saturation: 0
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
        this.brushOpacity = 1;
        this.lastX = 0;
        this.lastY = 0;
        this.drawingHistory = [];
        this.currentHistoryIndex = -1;
        this.points = [];
        this.minDistance = 2;
        this.maxDistance = 30;
        this.brushPreview = null;
        
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
        
        // 初始化所有事件监听器
        this.initializeEventListeners();
        this.initializeAdjustmentListeners();
        this.initializeCropListeners();
        this.initializeFilterListeners();
        this.initializeTextListeners();
        this.initializeDrawListeners();
        this.initializeStickerListeners();
        
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
                const tool = tab.dataset.tool;
                if (tool) {
                    this.switchTool(tool);
                }
            });
        });

        // 下载按钮处理
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.saveImage();
            });
        }

        // 重置按钮处理
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (this.originalImage) {
                    this.currentImage = this.originalImage;
                    this.adjustments = {
                        brightness: 0,
                        contrast: 0,
                        saturation: 0
                    };
                    this.drawImage();
                }
            });
        }
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
        // 计算画布大小，保持图片比例，但增大尺寸
        const maxWidth = Math.max(this.canvas.parentElement.clientWidth || 800, 1000);
        const maxHeight = Math.max(this.canvas.parentElement.clientHeight || 600, 800);
        let width = img.width;
        let height = img.height;
        
        // 存储原始图片尺寸
        this.originalWidth = width;
        this.originalHeight = height;
        
        // 计算缩放比例，确保画布足够大
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
        if (!this.currentImage) return;
        
        // 清除画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制图片
        this.ctx.save();
        
        // 处理旋转和翻转
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.rotate((this.rotation * Math.PI) / 180);
        this.ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);
        
        // 绘制当前图片
        this.ctx.drawImage(this.currentImage, 0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.restore();
        
        // 绘制所有贴纸
        this.stickers.forEach((sticker, index) => {
            this.ctx.save();
            this.ctx.font = `${sticker.size}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // 如果是选中的贴纸，绘制边框
            if (this.selectedSticker === sticker) {
                const halfSize = sticker.size / 2;
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(
                    sticker.x - halfSize,
                    sticker.y - halfSize,
                    sticker.size,
                    sticker.size
                );
            }
            
            this.ctx.fillText(sticker.icon, sticker.x, sticker.y);
            this.ctx.restore();
        });
        
        // 渲染文字
        this.texts.forEach(text => {
            this.ctx.save();
            
            // 设置文字样式
            let fontStyle = '';
            if (text.bold) fontStyle += 'bold ';
            if (text.italic) fontStyle += 'italic ';
            this.ctx.font = `${fontStyle}${text.fontSize}px ${text.fontFamily}`;
            this.ctx.fillStyle = text.color;
            this.ctx.textBaseline = 'bottom';
            
            // 如果是选中的文字，绘制边框
            if (text === this.selectedText) {
                const metrics = this.ctx.measureText(text.text);
                const textWidth = metrics.width;
                const textHeight = text.fontSize;
                
                // 绘制选中框
                this.ctx.strokeStyle = '#4c6ef5';
                this.ctx.lineWidth = 1;
                this.ctx.setLineDash([5, 3]);
                this.ctx.strokeRect(
                    text.x - 5,
                    text.y - textHeight - 5,
                    textWidth + 10,
                    textHeight + 10
                );
                
                // 绘制控制点
                this.ctx.fillStyle = '#4c6ef5';
                this.ctx.setLineDash([]);
                const controlPoints = [
                    { x: text.x - 5, y: text.y - textHeight - 5 },
                    { x: text.x + textWidth + 5, y: text.y - textHeight - 5 },
                    { x: text.x - 5, y: text.y + 5 },
                    { x: text.x + textWidth + 5, y: text.y + 5 }
                ];
                controlPoints.forEach(point => {
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                });
            }
            
            // 绘制文字
            this.ctx.fillStyle = text.color;
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
            
            this.ctx.restore();
        });
    }
    
    showEditor() {
        console.log('显示编辑器');
        this.uploadContainer.style.display = 'none';
        this.editContainer.style.display = 'block';
        
        // 给Canvas添加container类
        const canvasParent = this.canvas.parentElement;
        if (canvasParent && !canvasParent.classList.contains('canvas-container')) {
            canvasParent.classList.add('canvas-container');
        }
        
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
            if (tab.dataset.tool === tool) {
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
        if (brightnessSlider) {
        brightnessSlider.addEventListener('input', (e) => {
            this.adjustments.brightness = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('brightness', e.target.value);
        });
        }
        
        // 对比度调整
        const contrastSlider = document.getElementById('contrast');
        if (contrastSlider) {
        contrastSlider.addEventListener('input', (e) => {
            this.adjustments.contrast = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('contrast', e.target.value);
        });
        }
        
        // 饱和度调整
        const saturationSlider = document.getElementById('saturation');
        if (saturationSlider) {
        saturationSlider.addEventListener('input', (e) => {
            this.adjustments.saturation = parseInt(e.target.value);
            this.updateAdjustments();
            this.updateRangeValue('saturation', e.target.value);
        });
        }
        
        // 旋转和翻转按钮
        const rotateLeft = document.getElementById('rotate-left');
        const rotateRight = document.getElementById('rotate-right');
        const flipH = document.getElementById('flip-h');
        const flipV = document.getElementById('flip-v');
        
        if (rotateLeft) {
            rotateLeft.addEventListener('click', () => {
            this.rotation = (this.rotation - 90) % 360;
            this.drawImage();
        });
        }
        
        if (rotateRight) {
            rotateRight.addEventListener('click', () => {
            this.rotation = (this.rotation + 90) % 360;
            this.drawImage();
        });
        }
        
        if (flipH) {
            flipH.addEventListener('click', () => {
            this.flipH = !this.flipH;
            this.drawImage();
        });
        }
        
        if (flipV) {
            flipV.addEventListener('click', () => {
            this.flipV = !this.flipV;
            this.drawImage();
        });
        }
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
        const addTextBtn = document.getElementById('add-text');
        const textInput = document.getElementById('text-input');
        const fontFamily = document.getElementById('font-family');
        const fontSize = document.getElementById('font-size');
        const fontColor = document.getElementById('text-color');
        const textBold = document.getElementById('text-bold');
        const textItalic = document.getElementById('text-italic');
        const textUnderline = document.getElementById('text-underline');
        
        if (addTextBtn && textInput) {
            addTextBtn.addEventListener('click', () => {
                const text = textInput.value.trim();
                if (!text) return;

                const textObj = {
                    text: text,
                    x: this.canvas.width / 2,
                    y: this.canvas.height / 2,
                    fontFamily: fontFamily ? fontFamily.value : 'Arial',
                    fontSize: fontSize ? parseInt(fontSize.value) : 24,
                    color: fontColor ? fontColor.value : '#000000',
                    bold: false,
                    italic: false,
                    underline: false
                };

                this.texts.push(textObj);
                this.selectedText = textObj;
                textInput.value = '';

                // 更新UI
                if (textBold) textBold.classList.remove('active');
                if (textItalic) textItalic.classList.remove('active');
                if (textUnderline) textUnderline.classList.remove('active');

                this.drawImage();
            });
        }

        // 文字样式控制
        if (fontFamily) {
        fontFamily.addEventListener('change', () => {
            if (this.selectedText) {
                this.selectedText.fontFamily = fontFamily.value;
                this.drawImage();
            }
        });
        }
        
        if (fontSize) {
        fontSize.addEventListener('change', () => {
            if (this.selectedText) {
                this.selectedText.fontSize = parseInt(fontSize.value);
                this.drawImage();
            }
        });
        }
        
        if (fontColor) {
        fontColor.addEventListener('input', () => {
            if (this.selectedText) {
                this.selectedText.color = fontColor.value;
                this.drawImage();
            }
        });
        }
        
        if (textBold) {
        textBold.addEventListener('click', () => {
            if (this.selectedText) {
                this.selectedText.bold = !this.selectedText.bold;
                textBold.classList.toggle('active');
                this.drawImage();
            }
        });
        }
        
        if (textItalic) {
        textItalic.addEventListener('click', () => {
            if (this.selectedText) {
                this.selectedText.italic = !this.selectedText.italic;
                textItalic.classList.toggle('active');
                this.drawImage();
            }
        });
        }
        
        if (textUnderline) {
        textUnderline.addEventListener('click', () => {
            if (this.selectedText) {
                this.selectedText.underline = !this.selectedText.underline;
                textUnderline.classList.toggle('active');
                this.drawImage();
            }
        });
        }

        // 文字拖拽功能
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool !== 'text' || this.isDraggingSticker) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            // 检查是否点击了文字
            let clickedText = null;
            for (let i = this.texts.length - 1; i >= 0; i--) {
                const text = this.texts[i];
                
                this.ctx.save();
                let fontStyle = '';
                if (text.bold) fontStyle += 'bold ';
                if (text.italic) fontStyle += 'italic ';
                this.ctx.font = `${fontStyle}${text.fontSize}px ${text.fontFamily}`;
                
                const metrics = this.ctx.measureText(text.text);
                const textWidth = metrics.width;
                const textHeight = text.fontSize;
                
                // 扩大点击区域
                const padding = textHeight / 2;
                if (x >= text.x - padding && 
                    x <= text.x + textWidth + padding &&
                    y >= text.y - textHeight - padding && 
                    y <= text.y + padding) {
                    clickedText = text;
                    this.ctx.restore();
                    break;
                }
                this.ctx.restore();
            }
            
            if (clickedText) {
                this.selectedText = clickedText;
                this.isDraggingText = true;
                this.dragStartX = x - clickedText.x;
                this.dragStartY = y - clickedText.y;
                
                this.canvas.style.cursor = 'move';
                document.body.style.userSelect = 'none';
                
                // 显示拖拽指示器
                this.showTextDragIndicator(clickedText);
            } else {
                this.selectedText = null;
                this.hideTextDragIndicator();
            }
            
            this.drawImage();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!this.isDraggingText || !this.selectedText) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            // 计算新位置，考虑边界
            let newX = x - this.dragStartX;
            let newY = y - this.dragStartY;
            
            // 获取文字尺寸
            this.ctx.save();
            let fontStyle = '';
            if (this.selectedText.bold) fontStyle += 'bold ';
            if (this.selectedText.italic) fontStyle += 'italic ';
            this.ctx.font = `${fontStyle}${this.selectedText.fontSize}px ${this.selectedText.fontFamily}`;
            const metrics = this.ctx.measureText(this.selectedText.text);
            const textWidth = metrics.width;
            this.ctx.restore();
            
            // 边界检查
            newX = Math.max(0, Math.min(newX, this.canvas.width - textWidth));
            newY = Math.max(this.selectedText.fontSize, Math.min(newY, this.canvas.height));
            
            // 更新文字位置
            this.selectedText.x = newX;
            this.selectedText.y = newY;
            
            // 更新拖拽指示器
            this.updateTextDragIndicator(newX, newY);
            
            this.drawImage();
            e.preventDefault();
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDraggingText) {
                this.isDraggingText = false;
                this.canvas.style.cursor = 'default';
                document.body.style.userSelect = '';
                this.hideTextDragGuides();
                this.drawImage();
            }
        });

        // 鼠标悬停效果
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDraggingText || this.currentTool !== 'text') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            let isOverText = false;
            let hoveredText = null;
            
            for (let i = this.texts.length - 1; i >= 0; i--) {
                const text = this.texts[i];
                
                this.ctx.save();
                let fontStyle = '';
                if (text.bold) fontStyle += 'bold ';
                if (text.italic) fontStyle += 'italic ';
                this.ctx.font = `${fontStyle}${text.fontSize}px ${text.fontFamily}`;
                
                const metrics = this.ctx.measureText(text.text);
                const textWidth = metrics.width;
                const textHeight = text.fontSize;
                this.ctx.restore();
                
                const padding = textHeight / 2;
                if (x >= text.x - padding && 
                    x <= text.x + textWidth + padding &&
                    y >= text.y - textHeight - padding && 
                    y <= text.y + padding) {
                    isOverText = true;
                    hoveredText = text;
                    break;
                }
            }
            
            this.canvas.style.cursor = isOverText ? 'move' : 'default';
            
            if (isOverText && hoveredText) {
                this.showTextDragHandle(hoveredText);
            } else {
                this.hideTextDragHandle();
            }
        });
    }
    
    initializeDrawListeners() {
        // 笔刷大小调整
        const brushSizeSlider = document.getElementById('brush-size');
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                this.updateRangeValue('brush-size', e.target.value + 'px');
                this.updateBrushPreview();
            });
        }
        
        // 笔刷不透明度调整
        const brushOpacitySlider = document.getElementById('brush-opacity');
        if (brushOpacitySlider) {
            brushOpacitySlider.addEventListener('input', (e) => {
                this.brushOpacity = parseInt(e.target.value) / 100;
                this.updateRangeValue('brush-opacity', e.target.value + '%');
                this.updateBrushPreview();
            });
        }
        
        // 笔刷颜色选择
        const brushColorPicker = document.getElementById('brush-color');
        if (brushColorPicker) {
            brushColorPicker.addEventListener('input', (e) => {
                this.brushColor = e.target.value;
                this.updateBrushPreview();
            });
        }
        
        // 笔刷类型选择
        document.querySelectorAll('.brush-type').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setBrushType(btn.dataset.type);
                this.updateBrushPreview();
            });
        });
        
        // 清除绘画按钮
        const clearDrawingBtn = document.getElementById('clear-drawing');
        if (clearDrawingBtn) {
            clearDrawingBtn.addEventListener('click', () => {
                this.clearDrawing();
            });
        }

        // 撤销按钮
        const undoBtn = document.getElementById('undo-drawing');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoDrawing();
            });
        }

        // 重做按钮
        const redoBtn = document.getElementById('redo-drawing');
        if (redoBtn) {
            redoBtn.addEventListener('click', () => {
                this.redoDrawing();
            });
        }
        
        // 画布鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.currentTool === 'draw') {
                this.startDrawing(e);
            }
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.currentTool === 'draw') {
                if (this.isDrawing) {
                    this.draw(e);
                } else {
                    this.updateBrushCursor(e);
                }
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

        // 创建画笔预览元素
        this.createBrushPreview();
    }
    
    initializeStickerListeners() {
        // 初始化贴纸网格
        const stickersGrid = document.querySelector('.stickers-grid');
        if (!stickersGrid) return;
        
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
                this.handleStickerMouseDown(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
                this.handleStickerMouseMove(e);
        });
        
        this.canvas.addEventListener('mouseup', () => {
                this.handleStickerMouseUp();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.handleStickerMouseUp();
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
        
        // 重置点数组
        this.points = [];
        this.addPoint(this.lastX, this.lastY);
        
        // 创建新的历史记录
        this.saveToHistory();
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        // 添加新的点
        this.addPoint(currentX, currentY);
        
        // 根据笔刷类型绘制
        switch (this.brushType) {
            case 'brush':
                this.drawBrush();
                break;
            case 'marker':
                this.drawMarker();
                break;
            case 'pencil':
                this.drawPencil();
                break;
            case 'spray':
                this.drawSpray(currentX, currentY);
                break;
            case 'eraser':
                this.drawEraser();
                break;
        }
        
        this.lastX = currentX;
        this.lastY = currentY;
    }
    
    addPoint(x, y) {
        const points = this.points;
        const lastPoint = points[points.length - 1];
        
        if (lastPoint) {
            const dx = x - lastPoint.x;
            const dy = y - lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.minDistance) {
                return;
            }
            
            if (distance > this.maxDistance) {
                const count = Math.floor(distance / this.maxDistance);
                for (let i = 1; i <= count; i++) {
                    const ratio = i / (count + 1);
                    points.push({
                        x: lastPoint.x + dx * ratio,
                        y: lastPoint.y + dy * ratio,
                        pressure: 0.5
                    });
                }
            }
        }
        
        points.push({ x, y, pressure: 1 });
    }
    
    drawBrush() {
        const points = this.points;
        const ctx = this.ctx;
        
        ctx.save();
        ctx.globalAlpha = this.brushOpacity;
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        if (points.length < 3) {
            ctx.beginPath();
            ctx.arc(points[0].x, points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length - 2; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        
        ctx.stroke();
        ctx.restore();
    }
    
    drawMarker() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.3 * this.brushOpacity;
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        this.drawBrush();
        
        ctx.restore();
    }
    
    drawPencil() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = this.brushOpacity;
        ctx.strokeStyle = this.brushColor;
        ctx.lineWidth = this.brushSize / 2;
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        
        this.drawBrush();
        
        ctx.restore();
    }
    
    drawSpray(x, y) {
        const ctx = this.ctx;
        const density = this.brushSize * 2;
        const radius = this.brushSize;
        
        ctx.save();
        ctx.fillStyle = this.brushColor;
        ctx.globalAlpha = 0.05 * this.brushOpacity;
        
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radiusRandom = Math.random() * radius;
            const px = x + Math.cos(angle) * radiusRandom;
            const py = y + Math.sin(angle) * radiusRandom;
            
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    drawSprayPreview(ctx, x, y) {
        const density = this.brushSize;
        const radius = this.brushSize / 2;
        
        ctx.fillStyle = this.brushColor;
        ctx.globalAlpha = 0.1 * this.brushOpacity;
        
        for (let i = 0; i < density; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radiusRandom = Math.random() * radius;
            const px = x + Math.cos(angle) * radiusRandom;
            const py = y + Math.sin(angle) * radiusRandom;
            
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drawEraser() {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = this.brushOpacity;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = this.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        this.drawBrush();
        
        ctx.restore();
    }
    
    stopDrawing() {
        this.isDrawing = false;
        this.points = [];
        if (this.brushPreview) {
            this.brushPreview.parentElement.style.display = 'none';
        }
    }
    
    saveToHistory() {
        // 删除当前位置之后的历史记录
        this.drawingHistory = this.drawingHistory.slice(0, this.currentHistoryIndex + 1);
        // 添加新的状态
        this.drawingHistory.push(this.canvas.toDataURL());
        this.currentHistoryIndex++;
        // 限制历史记录数量
        if (this.drawingHistory.length > 50) {
            this.drawingHistory.shift();
            this.currentHistoryIndex--;
        }
        this.updateUndoRedoButtons();
    }
    
    undoDrawing() {
        if (this.currentHistoryIndex > 0) {
            this.currentHistoryIndex--;
            this.loadFromHistory();
        }
    }
    
    redoDrawing() {
        if (this.currentHistoryIndex < this.drawingHistory.length - 1) {
            this.currentHistoryIndex++;
            this.loadFromHistory();
        }
    }
    
    loadFromHistory() {
        const img = new Image();
        img.src = this.drawingHistory[this.currentHistoryIndex];
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
        this.updateUndoRedoButtons();
    }
    
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-drawing');
        const redoBtn = document.getElementById('redo-drawing');
        
        if (undoBtn) {
            undoBtn.disabled = this.currentHistoryIndex <= 0;
        }
        if (redoBtn) {
            redoBtn.disabled = this.currentHistoryIndex >= this.drawingHistory.length - 1;
        }
    }
    
    clearDrawing() {
        this.saveToHistory();
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
        // 如果正在拖动文字，不处理贴纸
        if (this.isDraggingText) return;
        
        // 只有在贴纸工具激活时才处理贴纸
        if (this.currentTool !== 'stickers') return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 检查是否点击了贴纸
        this.selectedSticker = null;
        for (let i = this.stickers.length - 1; i >= 0; i--) {
            const sticker = this.stickers[i];
            const halfSize = sticker.size / 2;
            
            // 扩大点击检测区域
            const padding = 10;
            if (x >= sticker.x - halfSize - padding && 
                x <= sticker.x + halfSize + padding &&
                y >= sticker.y - halfSize - padding && 
                y <= sticker.y + halfSize + padding) {
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
        
        // 限制贴纸在画布范围内
        const halfSize = this.selectedSticker.size / 2;
        this.selectedSticker.x = Math.max(halfSize, Math.min(x - this.dragStartX, this.canvas.width - halfSize));
        this.selectedSticker.y = Math.max(halfSize, Math.min(y - this.dragStartY, this.canvas.height - halfSize));
        
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

    createBrushPreview() {
        // 创建画笔预览容器
        const previewContainer = document.createElement('div');
        previewContainer.className = 'brush-preview-container';
        previewContainer.style.position = 'absolute';
        previewContainer.style.pointerEvents = 'none';
        previewContainer.style.zIndex = '1000';
        previewContainer.style.display = 'none';
        
        // 创建画笔预览画布
        this.brushPreview = document.createElement('canvas');
        this.brushPreview.width = 100;
        this.brushPreview.height = 100;
        previewContainer.appendChild(this.brushPreview);
        
        document.querySelector('.editor-preview').appendChild(previewContainer);
    }

    updateBrushPreview() {
        if (!this.brushPreview) return;
        
        const ctx = this.brushPreview.getContext('2d');
        ctx.clearRect(0, 0, this.brushPreview.width, this.brushPreview.height);
        
        // 绘制画笔预览
        const centerX = this.brushPreview.width / 2;
        const centerY = this.brushPreview.height / 2;
        
        ctx.save();
        ctx.globalAlpha = this.brushOpacity;
        
        switch (this.brushType) {
            case 'brush':
                ctx.beginPath();
                ctx.arc(centerX, centerY, this.brushSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = this.brushColor;
                ctx.fill();
                break;
                
            case 'marker':
                ctx.beginPath();
                ctx.arc(centerX, centerY, this.brushSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = this.brushColor;
                ctx.globalAlpha = 0.3;
                ctx.fill();
                break;
                
            case 'pencil':
                ctx.beginPath();
                ctx.arc(centerX, centerY, this.brushSize / 4, 0, Math.PI * 2);
                ctx.fillStyle = this.brushColor;
                ctx.fill();
                break;
                
            case 'spray':
                this.drawSprayPreview(ctx, centerX, centerY);
                break;
                
            case 'eraser':
                ctx.beginPath();
                ctx.arc(centerX, centerY, this.brushSize / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 1;
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }

    updateBrushCursor(e) {
        if (!this.brushPreview) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const container = this.brushPreview.parentElement;
        container.style.display = 'block';
        container.style.left = (e.clientX + 20) + 'px';
        container.style.top = (e.clientY + 20) + 'px';
    }
}

// 初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    window.imageEditor = new ImageEditor();
});
