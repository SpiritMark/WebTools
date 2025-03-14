// 图片拼接工具类
class ImageCollage {
    constructor() {
        // 获取DOM元素
        this.canvas = document.getElementById('image-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.uploadArea = document.getElementById('upload-area');
        this.uploadInput = document.getElementById('image-upload');
        this.editorContainer = document.getElementById('editor-container');
        this.uploadContainer = document.getElementById('upload-container');
        
        // 初始化属性
        this.images = [];
        this.currentLayout = '1x1';
        this.spacing = 10;
        this.borderRadius = 0;
        this.background = '#FFFFFF';
        this.zoom = 1;
        
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
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            if (files.length > 0) {
                this.handleImageUpload(files);
            }
        });
        
        // 文件选择处理
        this.uploadArea.addEventListener('click', () => {
            this.uploadInput.click();
        });
        
        this.uploadInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
            if (files.length > 0) {
                this.handleImageUpload(files);
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
        
        // 布局选择
        document.querySelectorAll('.layout-item').forEach(item => {
            item.addEventListener('click', () => {
                this.setLayout(item.dataset.layout);
            });
        });
        
        // 样式设置
        document.getElementById('spacing').addEventListener('input', (e) => {
            this.spacing = parseInt(e.target.value);
            this.updateRangeValue('spacing', this.spacing + 'px');
            this.updateCanvas();
        });
        
        document.getElementById('border-radius').addEventListener('input', (e) => {
            this.borderRadius = parseInt(e.target.value);
            this.updateRangeValue('border-radius', this.borderRadius + 'px');
            this.updateCanvas();
        });
        
        // 背景颜色
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setBackground(btn.dataset.color);
            });
        });
        
        document.getElementById('custom-color').addEventListener('input', (e) => {
            this.setBackground(e.target.value);
        });
        
        // 操作按钮
        document.getElementById('download-btn').addEventListener('click', () => {
            this.downloadCollage();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetCollage();
        });
    }
    
    handleImageUpload(files) {
        // 清空现有图片
        this.images = [];
        
        // 处理每个文件
        const loadPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        resolve(img);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            });
        });
        
        // 等待所有图片加载完成
        Promise.all(loadPromises).then(images => {
            this.images = images;
            this.showEditor();
            this.updateCanvas();
            this.updateImageList();
        });
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
    
    setLayout(layout) {
        this.currentLayout = layout;
        
        // 更新UI
        document.querySelectorAll('.layout-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.layout === layout) {
                item.classList.add('active');
            }
        });
        
        this.updateCanvas();
    }
    
    setBackground(color) {
        this.background = color;
        
        // 更新UI
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color === color) {
                btn.classList.add('active');
            }
        });
        
        document.getElementById('custom-color').value = color;
        
        this.updateCanvas();
    }
    
    updateRangeValue(id, value) {
        const valueElement = document.querySelector(`#${id} + .range-value`);
        if (valueElement) {
            valueElement.textContent = value;
        }
    }
    
    updateImageList() {
        const imageList = document.querySelector('.image-list');
        imageList.innerHTML = '';
        
        this.images.forEach((img, index) => {
            const item = document.createElement('div');
            item.className = 'image-item';
            
            const preview = document.createElement('img');
            preview.src = img.src;
            
            const controls = document.createElement('div');
            controls.className = 'image-item-controls';
            
            const moveUpBtn = document.createElement('button');
            moveUpBtn.innerHTML = '<i class="ri-arrow-up-line"></i> 上移';
            moveUpBtn.onclick = () => this.moveImage(index, -1);
            
            const moveDownBtn = document.createElement('button');
            moveDownBtn.innerHTML = '<i class="ri-arrow-down-line"></i> 下移';
            moveDownBtn.onclick = () => this.moveImage(index, 1);
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '<i class="ri-delete-bin-line"></i> 删除';
            removeBtn.onclick = () => this.removeImage(index);
            
            controls.appendChild(moveUpBtn);
            controls.appendChild(moveDownBtn);
            controls.appendChild(removeBtn);
            
            item.appendChild(preview);
            item.appendChild(controls);
            imageList.appendChild(item);
        });
    }
    
    moveImage(index, direction) {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < this.images.length) {
            const temp = this.images[index];
            this.images[index] = this.images[newIndex];
            this.images[newIndex] = temp;
            this.updateImageList();
            this.updateCanvas();
        }
    }
    
    removeImage(index) {
        this.images.splice(index, 1);
        this.updateImageList();
        this.updateCanvas();
    }
    
    updateCanvas() {
        if (this.images.length === 0) return;
        
        // 获取布局尺寸
        const [rows, cols] = this.currentLayout.split('x').map(Number);
        
        // 计算画布尺寸
        const maxWidth = 800;
        const maxHeight = 600;
        const cellWidth = maxWidth / cols;
        const cellHeight = maxHeight / rows;
        
        // 设置画布尺寸
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        
        // 清除画布
        this.ctx.fillStyle = this.background;
        this.ctx.fillRect(0, 0, maxWidth, maxHeight);
        
        // 绘制图片
        this.images.forEach((img, index) => {
            if (index >= rows * cols) return;
            
            // 计算当前图片的位置
            const row = Math.floor(index / cols);
            const col = index % cols;
            const x = col * cellWidth + this.spacing;
            const y = row * cellHeight + this.spacing;
            
            // 计算图片尺寸
            const width = cellWidth - this.spacing * 2;
            const height = cellHeight - this.spacing * 2;
            
            // 保存上下文状态
            this.ctx.save();
            
            // 应用缩放
            this.ctx.scale(this.zoom, this.zoom);
            
            // 绘制圆角矩形
            if (this.borderRadius > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(x / this.zoom + this.borderRadius, y / this.zoom);
                this.ctx.lineTo(x / this.zoom + width / this.zoom - this.borderRadius, y / this.zoom);
                this.ctx.quadraticCurveTo(x / this.zoom + width / this.zoom, y / this.zoom, x / this.zoom + width / this.zoom, y / this.zoom + this.borderRadius);
                this.ctx.lineTo(x / this.zoom + width / this.zoom, y / this.zoom + height / this.zoom - this.borderRadius);
                this.ctx.quadraticCurveTo(x / this.zoom + width / this.zoom, y / this.zoom + height / this.zoom, x / this.zoom + width / this.zoom - this.borderRadius, y / this.zoom + height / this.zoom);
                this.ctx.lineTo(x / this.zoom + this.borderRadius, y / this.zoom + height / this.zoom);
                this.ctx.quadraticCurveTo(x / this.zoom, y / this.zoom + height / this.zoom, x / this.zoom, y / this.zoom + height / this.zoom - this.borderRadius);
                this.ctx.lineTo(x / this.zoom, y / this.zoom + this.borderRadius);
                this.ctx.quadraticCurveTo(x / this.zoom, y / this.zoom, x / this.zoom + this.borderRadius, y / this.zoom);
                this.ctx.closePath();
                this.ctx.clip();
            }
            
            // 绘制图片
            this.ctx.drawImage(img, x / this.zoom, y / this.zoom, width / this.zoom, height / this.zoom);
            
            // 恢复上下文状态
            this.ctx.restore();
        });
    }
    
    downloadCollage() {
        // 创建临时画布
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 绘制背景
        tempCtx.fillStyle = this.background;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // 绘制拼图
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // 创建下载链接
        const link = document.createElement('a');
        link.download = `collage-${this.currentLayout}.png`;
        link.href = tempCanvas.toDataURL('image/png');
        link.click();
    }
    
    resetCollage() {
        // 重置所有参数
        this.images = [];
        this.currentLayout = '1x1';
        this.spacing = 10;
        this.borderRadius = 0;
        this.background = '#FFFFFF';
        this.zoom = 1;
        
        // 重置UI
        document.getElementById('spacing').value = 10;
        document.getElementById('border-radius').value = 0;
        document.getElementById('custom-color').value = '#FFFFFF';
        
        // 更新UI
        document.querySelectorAll('.layout-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.layout === '1x1') {
                item.classList.add('active');
            }
        });
        
        document.querySelectorAll('.color-preset').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.color === '#FFFFFF') {
                btn.classList.add('active');
            }
        });
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 隐藏编辑器
        this.editorContainer.style.display = 'none';
        this.uploadContainer.style.display = 'block';
        
        // 清空图片列表
        document.querySelector('.image-list').innerHTML = '';
    }
}

// 初始化工具
document.addEventListener('DOMContentLoaded', () => {
    window.imageCollage = new ImageCollage();
}); 