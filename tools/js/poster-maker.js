document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const posterContainer = document.querySelector('.poster-tool-container');
    const toolbarElement = document.querySelector('.toolbar');
    
    // 创建画布元素
    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'canvas-container';
    posterContainer.insertBefore(canvasContainer, toolbarElement);
    
    const canvas = document.createElement('div');
    canvas.id = 'poster-canvas';
    canvas.className = 'poster-canvas';
    canvasContainer.appendChild(canvas);
    
    // 添加空画布提示
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-canvas-message';
    emptyMessage.innerHTML = `
        <i class="ri-layout-5-line"></i>
        <p>选择模板和尺寸开始设计<br>或添加元素到画布</p>
    `;
    canvas.appendChild(emptyMessage);
    
    // 获取其他DOM元素
    const sizePreset = document.getElementById('size-preset');
    const customSizeInputs = document.getElementById('custom-size-inputs');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const bgColorPanel = document.getElementById('bg-color-panel');
    const bgGradientPanel = document.getElementById('bg-gradient-panel');
    const bgImagePanel = document.getElementById('bg-image-panel');
    const bgColorInput = document.getElementById('bg-color');
    const gradientColor1 = document.getElementById('gradient-color-1');
    const gradientColor2 = document.getElementById('gradient-color-2');
    const gradientDirection = document.getElementById('gradient-direction');
    const bgImageUpload = document.getElementById('bg-image-upload');
    const bgImageFit = document.getElementById('bg-image-fit');
    
    // 创建元素编辑器容器
    const editorPanel = document.createElement('div');
    editorPanel.className = 'editor-panel';
    editorPanel.innerHTML = `
        <div class="editor-header">
            <h3>元素编辑</h3>
            <button class="close-editor">&times;</button>
        </div>
        <div id="element-editor" class="element-editor">
            <div id="text-editor" class="element-type-editor">
                <!-- 文本编辑器内容 -->
            </div>
            <div id="shape-editor" class="element-type-editor">
                <!-- 形状编辑器内容 -->
            </div>
            <div id="image-editor" class="element-type-editor">
                <!-- 图片编辑器内容 -->
            </div>
        </div>
    `;
    canvasContainer.appendChild(editorPanel);
    
    // 获取编辑器元素
    const elementEditor = document.getElementById('element-editor');
    const textEditor = document.getElementById('text-editor');
    const shapeEditor = document.getElementById('shape-editor');
    const imageEditor = document.getElementById('image-editor');
    
    // 模态框元素
    const shapeModal = document.getElementById('shape-selector-modal');
    const iconModal = document.getElementById('icon-selector-modal');
    const downloadModal = document.getElementById('download-options-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // 配置和状态
    let currentTemplate = 'social-media';
    let currentBgType = 'color';
    let selectedElement = null;
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    let resizeHandle = '';
    let nextElementId = 1;

    // 初始化函数
    function initializePosterMaker() {
        updateCanvasSize();
        updateCanvasBackground();
        setupEventListeners();
    }

    // 设置事件监听器
    function setupEventListeners() {
        // 监听预设尺寸变化
        sizePreset.addEventListener('change', function() {
            if (this.value === 'custom') {
                customSizeInputs.style.display = 'flex';
            } else {
                customSizeInputs.style.display = 'none';
                updateCanvasSize();
            }
        });
        
        // 监听自定义尺寸变化
        widthInput.addEventListener('change', updateCanvasSize);
        heightInput.addEventListener('change', updateCanvasSize);
        
        // 背景类型切换
        const bgTypeButtons = document.querySelectorAll('.option-tab');
        bgTypeButtons.forEach(button => {
            button.addEventListener('click', function() {
                bgTypeButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                currentBgType = this.getAttribute('data-bg-type');
                bgColorPanel.style.display = (currentBgType === 'color') ? 'block' : 'none';
                bgGradientPanel.style.display = (currentBgType === 'gradient') ? 'block' : 'none';
                bgImagePanel.style.display = (currentBgType === 'image') ? 'block' : 'none';
                
                updateCanvasBackground();
            });
        });
        
        // 背景色变化
        bgColorInput.addEventListener('input', updateCanvasBackground);
        
        // 渐变色变化
        gradientColor1.addEventListener('input', updateCanvasBackground);
        gradientColor2.addEventListener('input', updateCanvasBackground);
        gradientDirection.addEventListener('change', updateCanvasBackground);
        
        // 背景图片上传
        bgImageUpload.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    canvas.style.backgroundImage = `url('${event.target.result}')`;
                    canvas.style.backgroundSize = bgImageFit.value;
                    canvas.style.backgroundRepeat = (bgImageFit.value === 'repeat') ? 'repeat' : 'no-repeat';
                    canvas.style.backgroundPosition = 'center';
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        });
        
        bgImageFit.addEventListener('change', function() {
            if (canvas.style.backgroundImage) {
                canvas.style.backgroundSize = this.value;
                canvas.style.backgroundRepeat = (this.value === 'repeat') ? 'repeat' : 'no-repeat';
            }
        });
        
        // 点击画布背景取消选择
        canvas.addEventListener('click', function(e) {
            if (e.target === canvas) {
                deselectAllElements();
                hideElementEditor();
            }
        });
        
        // 设置模板选择事件
        const templateOptions = document.querySelectorAll('.template-option');
        templateOptions.forEach(option => {
            option.addEventListener('click', function() {
                templateOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                currentTemplate = this.getAttribute('data-template');
                applyTemplate(currentTemplate);
            });
        });
        
        // 关闭模态框
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                hideModal(modal);
            });
        });
        
        // 关闭编辑器
        document.querySelector('.close-editor').addEventListener('click', hideElementEditor);
    }
    
    // 更新画布尺寸
    function updateCanvasSize() {
        let width, height;
        
        if (sizePreset.value === 'custom') {
            width = parseInt(widthInput.value) || 1080;
            height = parseInt(heightInput.value) || 1080;
        } else {
            const sizes = {
                'instagram': [1080, 1080],
                'facebook': [851, 315],
                'twitter': [1500, 500],
                'youtube': [1280, 720],
                'weibo': [560, 260],
                'wechat': [900, 500]
            };
            
            [width, height] = sizes[sizePreset.value] || [1080, 1080];
            widthInput.value = width;
            heightInput.value = height;
        }
        
        // 计算缩放比例，保持画布在可视区域内
        const maxWidth = posterContainer.clientWidth - toolbarElement.clientWidth - 40;
        const scale = Math.min(1, maxWidth / width);
        
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.style.transform = `scale(${scale})`;
        canvasContainer.style.height = (height * scale) + 'px';
        
        // 隐藏空画布提示
        if (canvas.children.length > 1) {
            emptyMessage.style.display = 'none';
        } else {
            emptyMessage.style.display = 'flex';
        }
    }
    
    // 更新画布背景
    function updateCanvasBackground() {
        switch (currentBgType) {
            case 'color':
                canvas.style.backgroundColor = bgColorInput.value;
                canvas.style.backgroundImage = 'none';
                break;
            case 'gradient':
                const gradient = `linear-gradient(${gradientDirection.value}, ${gradientColor1.value}, ${gradientColor2.value})`;
                canvas.style.backgroundImage = gradient;
                break;
            case 'image':
                // 背景图片在上传事件中处理
                break;
        }
    }
    
    // 显示模态框
    function showModal(modal) {
        modal.style.display = 'block';
    }
    
    // 隐藏模态框
    function hideModal(modal) {
        modal.style.display = 'none';
    }
    
    // 显示元素编辑器
    function showElementEditor(type) {
        editorPanel.style.display = 'block';
        
        textEditor.style.display = 'none';
        shapeEditor.style.display = 'none';
        imageEditor.style.display = 'none';
        
        switch (type) {
            case 'text':
                textEditor.style.display = 'block';
                break;
            case 'shape':
                shapeEditor.style.display = 'block';
                break;
            case 'image':
                imageEditor.style.display = 'block';
                break;
        }
    }
    
    // 隐藏元素编辑器
    function hideElementEditor() {
        editorPanel.style.display = 'none';
    }
    
    // 取消选择所有元素
    function deselectAllElements() {
        const elements = canvas.querySelectorAll('.poster-element');
        elements.forEach(element => {
            element.classList.remove('selected');
            const handles = element.querySelectorAll('.resize-handle');
            handles.forEach(handle => handle.remove());
        });
        selectedElement = null;
    }
    
    // 设置全局鼠标移动和鼠标松开事件处理
    document.addEventListener('mousemove', function(e) {
        if (!selectedElement) return;
        
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // 考虑画布的缩放比例
            const canvasScale = parseFloat(canvas.style.transform.replace('scale(', '').replace(')', '')) || 1;
            const scaledDx = dx / canvasScale;
            const scaledDy = dy / canvasScale;
            
            selectedElement.style.left = (startLeft + scaledDx) + 'px';
            selectedElement.style.top = (startTop + scaledDy) + 'px';
            
            // 移除translate变换，改用left/top定位
            selectedElement.style.transform = '';
        }
        
        if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // 考虑画布的缩放比例
            const canvasScale = parseFloat(canvas.style.transform.replace('scale(', '').replace(')', '')) || 1;
            const scaledDx = dx / canvasScale;
            const scaledDy = dy / canvasScale;
            
            // 根据调整手柄的位置更新元素尺寸和位置
            switch (resizeHandle) {
                case 'top-left':
                    selectedElement.style.width = (startWidth - scaledDx) + 'px';
                    selectedElement.style.height = (startHeight - scaledDy) + 'px';
                    selectedElement.style.left = (startLeft + scaledDx) + 'px';
                    selectedElement.style.top = (startTop + scaledDy) + 'px';
                    break;
                case 'top-right':
                    selectedElement.style.width = (startWidth + scaledDx) + 'px';
                    selectedElement.style.height = (startHeight - scaledDy) + 'px';
                    selectedElement.style.top = (startTop + scaledDy) + 'px';
                    break;
                case 'bottom-left':
                    selectedElement.style.width = (startWidth - scaledDx) + 'px';
                    selectedElement.style.height = (startHeight + scaledDy) + 'px';
                    selectedElement.style.left = (startLeft + scaledDx) + 'px';
                    break;
                case 'bottom-right':
                    selectedElement.style.width = (startWidth + scaledDx) + 'px';
                    selectedElement.style.height = (startHeight + scaledDy) + 'px';
                    break;
            }
            
            // 更新编辑器中的尺寸显示
            if (selectedElement.classList.contains('image-element')) {
                const img = selectedElement.querySelector('img');
                if (img) {
                    // 保持图片填充整个容器
                    img.style.width = '100%';
                    img.style.height = '100%';
                }
            }
        }
    });

    document.addEventListener('mouseup', function() {
        isDragging = false;
        isResizing = false;
    });

    // 应用模板
    function applyTemplate(templateType) {
        // 清空画布元素
        const elements = canvas.querySelectorAll('.poster-element');
        elements.forEach(el => el.remove());
        
        // 重置编辑器
        hideElementEditor();
        
        // 设置尺寸和背景
        switch (templateType) {
            case 'social-media':
                sizePreset.value = 'instagram';
                bgColorInput.value = '#f0f9ff';
                currentBgType = 'color';
                updateCanvasSize();
                updateCanvasBackground();
                
                // 添加标题
                const title = document.createElement('div');
                title.className = 'poster-element text-element heading-text';
                title.id = `element-${nextElementId++}`;
                title.textContent = '社交媒体标题';
                title.style.position = 'absolute';
                title.style.left = '50%';
                title.style.top = '30%';
                title.style.transform = 'translate(-50%, -50%)';
                title.style.color = '#2563eb';
                title.style.fontSize = '42px';
                title.style.fontWeight = 'bold';
                title.style.textAlign = 'center';
                title.style.width = '80%';
                canvas.appendChild(title);
                
                // 添加副标题
                const subtitle = document.createElement('div');
                subtitle.className = 'poster-element text-element subheading-text';
                subtitle.id = `element-${nextElementId++}`;
                subtitle.textContent = '添加您的副标题信息';
                subtitle.style.position = 'absolute';
                subtitle.style.left = '50%';
                subtitle.style.top = '45%';
                subtitle.style.transform = 'translate(-50%, -50%)';
                subtitle.style.color = '#6b7280';
                subtitle.style.fontSize = '24px';
                subtitle.style.textAlign = 'center';
                subtitle.style.width = '70%';
                canvas.appendChild(subtitle);
                
                // 添加矩形装饰
                const rect = document.createElement('div');
                rect.className = 'poster-element shape-element shape-rectangle';
                rect.id = `element-${nextElementId++}`;
                rect.style.position = 'absolute';
                rect.style.left = '50%';
                rect.style.top = '68%';
                rect.style.transform = 'translate(-50%, -50%)';
                rect.style.width = '200px';
                rect.style.height = '200px';
                rect.style.backgroundColor = '#93c5fd';
                rect.style.borderRadius = '15px';
                rect.style.opacity = '0.8';
                canvas.appendChild(rect);
                
                // 添加事件监听
                addElementEventListeners(title);
                addElementEventListeners(subtitle);
                addElementEventListeners(rect);
                break;
                
            case 'web-banner':
                sizePreset.value = 'facebook';
                currentBgType = 'gradient';
                gradientColor1.value = '#3b82f6';
                gradientColor2.value = '#8b5cf6';
                gradientDirection.value = 'to right';
                updateCanvasSize();
                updateCanvasBackground();
                
                // 添加标题
                const bannerTitle = document.createElement('div');
                bannerTitle.className = 'poster-element text-element heading-text';
                bannerTitle.id = `element-${nextElementId++}`;
                bannerTitle.textContent = '网站横幅标题';
                bannerTitle.style.position = 'absolute';
                bannerTitle.style.left = '30%';
                bannerTitle.style.top = '50%';
                bannerTitle.style.transform = 'translate(-50%, -50%)';
                bannerTitle.style.color = '#ffffff';
                bannerTitle.style.fontSize = '36px';
                bannerTitle.style.fontWeight = 'bold';
                canvas.appendChild(bannerTitle);
                
                // 添加按钮
                const button = document.createElement('div');
                button.className = 'poster-element shape-element shape-rectangle';
                button.id = `element-${nextElementId++}`;
                button.style.position = 'absolute';
                button.style.right = '100px';
                button.style.top = '50%';
                button.style.transform = 'translateY(-50%)';
                button.style.width = '150px';
                button.style.height = '50px';
                button.style.backgroundColor = '#ffffff';
                button.style.borderRadius = '25px';
                canvas.appendChild(button);
                
                // 添加按钮文本
                const buttonText = document.createElement('div');
                buttonText.className = 'poster-element text-element body-text';
                buttonText.id = `element-${nextElementId++}`;
                buttonText.textContent = '立即点击';
                buttonText.style.position = 'absolute';
                buttonText.style.right = '138px';
                buttonText.style.top = '50%';
                buttonText.style.transform = 'translateY(-50%)';
                buttonText.style.color = '#3b82f6';
                buttonText.style.fontSize = '18px';
                buttonText.style.fontWeight = 'bold';
                buttonText.style.textAlign = 'center';
                canvas.appendChild(buttonText);
                
                // 添加事件监听
                addElementEventListeners(bannerTitle);
                addElementEventListeners(button);
                addElementEventListeners(buttonText);
                break;
                
            case 'presentation':
                sizePreset.value = 'youtube';
                bgColorInput.value = '#ffffff';
                currentBgType = 'color';
                updateCanvasSize();
                updateCanvasBackground();
                
                // 添加标题栏
                const titleBar = document.createElement('div');
                titleBar.className = 'poster-element shape-element shape-rectangle';
                titleBar.id = `element-${nextElementId++}`;
                titleBar.style.position = 'absolute';
                titleBar.style.left = '0';
                titleBar.style.top = '0';
                titleBar.style.width = '100%';
                titleBar.style.height = '120px';
                titleBar.style.backgroundColor = '#4f46e5';
                canvas.appendChild(titleBar);
                
                // 添加标题
                const presentationTitle = document.createElement('div');
                presentationTitle.className = 'poster-element text-element heading-text';
                presentationTitle.id = `element-${nextElementId++}`;
                presentationTitle.textContent = '演示幻灯片标题';
                presentationTitle.style.position = 'absolute';
                presentationTitle.style.left = '50%';
                presentationTitle.style.top = '60px';
                presentationTitle.style.transform = 'translateX(-50%)';
                presentationTitle.style.color = '#ffffff';
                presentationTitle.style.fontSize = '32px';
                presentationTitle.style.fontWeight = 'bold';
                presentationTitle.style.textAlign = 'center';
                canvas.appendChild(presentationTitle);
                
                // 添加内容区块
                const contentBlock = document.createElement('div');
                contentBlock.className = 'poster-element text-element body-text';
                contentBlock.id = `element-${nextElementId++}`;
                contentBlock.textContent = '• 第一项要点\n• 第二项要点\n• 第三项要点\n• 第四项要点';
                contentBlock.style.position = 'absolute';
                contentBlock.style.left = '100px';
                contentBlock.style.top = '200px';
                contentBlock.style.width = '600px';
                contentBlock.style.color = '#1f2937';
                contentBlock.style.fontSize = '24px';
                contentBlock.style.lineHeight = '1.5';
                contentBlock.style.whiteSpace = 'pre-line';
                canvas.appendChild(contentBlock);
                
                // 添加事件监听
                addElementEventListeners(titleBar);
                addElementEventListeners(presentationTitle);
                addElementEventListeners(contentBlock);
                break;
                
            // 更多模板类型...
            default:
                // 自定义模板，仅清空画布
                break;
        }
        
        // 隐藏空画布提示
        emptyMessage.style.display = 'none';
    }

    // 设置文本编辑器事件监听
    function setupTextEditor() {
        // 文本内容
        document.getElementById('text-content').addEventListener('input', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                selectedElement.textContent = this.value;
            }
        });
        
        // 字体
        document.getElementById('text-font').addEventListener('change', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                selectedElement.style.fontFamily = this.value;
            }
        });
        
        // 字体大小
        document.getElementById('text-size').addEventListener('input', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                selectedElement.style.fontSize = this.value + 'px';
                document.getElementById('text-size-value').textContent = this.value + 'px';
            }
        });
        
        // 文本颜色
        document.getElementById('text-color').addEventListener('input', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                selectedElement.style.color = this.value;
            }
        });
        
        // 对齐方式
        document.getElementById('text-align').addEventListener('change', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                selectedElement.style.textAlign = this.value;
            }
        });
        
        // 粗体
        document.getElementById('text-bold').addEventListener('click', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                if (selectedElement.style.fontWeight === 'bold') {
                    selectedElement.style.fontWeight = 'normal';
                    this.classList.remove('active');
                } else {
                    selectedElement.style.fontWeight = 'bold';
                    this.classList.add('active');
                }
            }
        });
        
        // 斜体
        document.getElementById('text-italic').addEventListener('click', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                if (selectedElement.style.fontStyle === 'italic') {
                    selectedElement.style.fontStyle = 'normal';
                    this.classList.remove('active');
                } else {
                    selectedElement.style.fontStyle = 'italic';
                    this.classList.add('active');
                }
            }
        });
        
        // 下划线
        document.getElementById('text-underline').addEventListener('click', function() {
            if (selectedElement && selectedElement.classList.contains('text-element')) {
                if (selectedElement.style.textDecoration === 'underline') {
                    selectedElement.style.textDecoration = 'none';
                    this.classList.remove('active');
                } else {
                    selectedElement.style.textDecoration = 'underline';
                    this.classList.add('active');
                }
            }
        });
    }

    // 设置元素操作按钮事件监听
    function setupElementActions() {
        // 复制元素
        document.getElementById('copy-element').addEventListener('click', function() {
            if (selectedElement) {
                const clone = selectedElement.cloneNode(true);
                clone.id = `element-${nextElementId++}`;
                
                // 稍微偏移位置
                const left = parseInt(selectedElement.style.left) || 0;
                const top = parseInt(selectedElement.style.top) || 0;
                clone.style.left = (left + 20) + 'px';
                clone.style.top = (top + 20) + 'px';
                
                canvas.appendChild(clone);
                addElementEventListeners(clone);
                selectElement(clone);
            }
        });
        
        // 删除元素
        document.getElementById('delete-element').addEventListener('click', function() {
            if (selectedElement) {
                selectedElement.remove();
                selectedElement = null;
                hideElementEditor();
                
                // 如果画布为空，显示提示
                if (canvas.querySelectorAll('.poster-element').length === 0) {
                    emptyMessage.style.display = 'flex';
                }
            }
        });
        
        // 前移元素
        document.getElementById('forward-element').addEventListener('click', function() {
            if (selectedElement) {
                const zIndex = parseInt(selectedElement.style.zIndex) || 0;
                selectedElement.style.zIndex = zIndex + 1;
            }
        });
        
        // 后移元素
        document.getElementById('backward-element').addEventListener('click', function() {
            if (selectedElement) {
                const zIndex = parseInt(selectedElement.style.zIndex) || 0;
                selectedElement.style.zIndex = Math.max(0, zIndex - 1);
            }
        });
    }

    // 下载海报
    function downloadPoster() {
        const format = document.getElementById('download-format').value;
        const quality = document.getElementById('download-quality').value / 10;
        const filename = document.getElementById('download-filename').value || '海报设计';
        
        // 隐藏选择和调整手柄
        deselectAllElements();
        
        // 使用html2canvas将画布转换为图像
        html2canvas(canvas, {
            scale: 2, // 提高输出质量
            backgroundColor: null
        }).then(function(canvas) {
            let dataURL;
            
            if (format === 'svg') {
                // SVG导出需要更复杂的处理，这里简化实现
                alert('SVG导出功能即将推出');
                return;
            } else {
                dataURL = canvas.toDataURL(`image/${format}`, quality);
            }
            
            // 创建下载链接
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = `${filename}.${format}`;
            link.click();
            
            // 隐藏模态框
            hideModal(downloadModal);
        });
    }

    // 添加文本、形状和图片添加按钮事件监听
    document.getElementById('add-heading').addEventListener('click', function() {
        addTextElement('heading-text', '标题文本');
    });

    document.getElementById('add-subheading').addEventListener('click', function() {
        addTextElement('subheading-text', '副标题文本');
    });

    document.getElementById('add-body-text').addEventListener('click', function() {
        addTextElement('body-text', '正文文本内容，在此编辑您的内容。');
    });

    document.getElementById('add-shape').addEventListener('click', function() {
        showModal(shapeModal);
    });

    document.querySelectorAll('.shape-item').forEach(item => {
        item.addEventListener('click', function() {
            const shapeType = this.getAttribute('data-shape');
            addShapeElement(shapeType);
            hideModal(shapeModal);
        });
    });

    document.getElementById('add-image').addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = function(e) {
            if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    addImageElement(event.target.result);
                };
                reader.readAsDataURL(e.target.files[0]);
            }
        };
        input.click();
    });

    document.getElementById('add-icon').addEventListener('click', function() {
        showModal(iconModal);
    });

    document.getElementById('download-btn').addEventListener('click', function() {
        showModal(downloadModal);
    });

    document.getElementById('confirm-download').addEventListener('click', downloadPoster);

    // 初始化编辑器和操作按钮
    setupTextEditor();
    setupElementActions();

    // 在窗口大小变化时重新调整画布尺寸
    window.addEventListener('resize', updateCanvasSize);

    // 初始化
    initializePosterMaker();
});

// 添加文本元素
function addTextElement(className, content) {
    const textElement = document.createElement('div');
    textElement.className = `poster-element text-element ${className}`;
    textElement.id = `element-${nextElementId++}`;
    textElement.textContent = content;
    textElement.contentEditable = true;
    
    // 设置初始样式
    textElement.style.position = 'absolute';
    textElement.style.left = '50%';
    textElement.style.top = '50%';
    textElement.style.transform = 'translate(-50%, -50%)';
    textElement.style.color = '#333333';
    textElement.style.minWidth = '100px';
    
    // 根据文本类型设置样式
    if (className === 'heading-text') {
        textElement.style.fontSize = '28px';
        textElement.style.fontWeight = 'bold';
    } else if (className === 'subheading-text') {
        textElement.style.fontSize = '20px';
        textElement.style.fontWeight = '500';
    } else {
        textElement.style.fontSize = '16px';
    }
    
    canvas.appendChild(textElement);
    emptyMessage.style.display = 'none';
    
    // 添加事件监听
    addElementEventListeners(textElement);
    
    // 选中新添加的元素
    selectElement(textElement);
}

// 添加形状元素
function addShapeElement(shapeType) {
    const shapeElement = document.createElement('div');
    shapeElement.className = `poster-element shape-element shape-${shapeType}`;
    shapeElement.id = `element-${nextElementId++}`;
    
    // 设置初始样式
    shapeElement.style.position = 'absolute';
    shapeElement.style.left = '50%';
    shapeElement.style.top = '50%';
    shapeElement.style.transform = 'translate(-50%, -50%)';
    shapeElement.style.width = '100px';
    shapeElement.style.height = '100px';
    shapeElement.style.backgroundColor = '#4169E1';
    
    // 根据形状类型设置特殊样式
    switch (shapeType) {
        case 'rectangle':
            shapeElement.style.borderRadius = '0';
            break;
        case 'circle':
            shapeElement.style.borderRadius = '50%';
            break;
        case 'triangle':
            shapeElement.style.width = '0';
            shapeElement.style.height = '0';
            shapeElement.style.backgroundColor = 'transparent';
            shapeElement.style.borderLeft = '50px solid transparent';
            shapeElement.style.borderRight = '50px solid transparent';
            shapeElement.style.borderBottom = '100px solid #4169E1';
            break;
        case 'star':
            // 使用background-image模拟星形
            shapeElement.style.backgroundColor = 'transparent';
            shapeElement.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 51 48'%3E%3Cpath fill='%234169E1' d='M25,1 L32,17 L49,17 L35,29 L40,45 L25,36 L10,45 L15,29 L1,17 L18,17 Z'/%3E%3C/svg%3E\")";
            shapeElement.style.backgroundSize = 'contain';
            shapeElement.style.backgroundRepeat = 'no-repeat';
            break;
        case 'hexagon':
            // 使用background-image模拟六边形
            shapeElement.style.backgroundColor = 'transparent';
            shapeElement.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpolygon fill='%234169E1' points='50,0 100,25 100,75 50,100 0,75 0,25'/%3E%3C/svg%3E\")";
            shapeElement.style.backgroundSize = 'contain';
            shapeElement.style.backgroundRepeat = 'no-repeat';
            break;
        case 'heart':
            // 使用background-image模拟心形
            shapeElement.style.backgroundColor = 'transparent';
            shapeElement.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%234169E1' d='M50,90 C100,65 90,20 50,40 C10,20 0,65 50,90 Z'/%3E%3C/svg%3E\")";
            shapeElement.style.backgroundSize = 'contain';
            shapeElement.style.backgroundRepeat = 'no-repeat';
            break;
        case 'speech-bubble':
            // 使用background-image模拟对话框
            shapeElement.style.backgroundColor = 'transparent';
            shapeElement.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath fill='%234169E1' d='M80,0 C90,0 100,10 100,20 L100,60 C100,70 90,80 80,80 L40,80 L20,100 L20,80 L20,80 C10,80 0,70 0,60 L0,20 C0,10 10,0 20,0 Z'/%3E%3C/svg%3E\")";
            shapeElement.style.backgroundSize = 'contain';
            shapeElement.style.backgroundRepeat = 'no-repeat';
            break;
        case 'arrow':
            // 使用background-image模拟箭头
            shapeElement.style.backgroundColor = 'transparent';
            shapeElement.style.backgroundImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 50'%3E%3Cpath fill='%234169E1' d='M0,20 L70,20 L70,0 L100,25 L70,50 L70,30 L0,30 Z'/%3E%3C/svg%3E\")";
            shapeElement.style.backgroundSize = 'contain';
            shapeElement.style.backgroundRepeat = 'no-repeat';
            break;
    }
    
    canvas.appendChild(shapeElement);
    emptyMessage.style.display = 'none';
    
    // 添加事件监听
    addElementEventListeners(shapeElement);
    
    // 选中新添加的元素
    selectElement(shapeElement);
}

// 添加图片元素
function addImageElement(imgSrc) {
    const imageElement = document.createElement('div');
    imageElement.className = 'poster-element image-element';
    imageElement.id = `element-${nextElementId++}`;
    
    const img = document.createElement('img');
    img.src = imgSrc;
    imageElement.appendChild(img);
    
    // 设置初始样式
    imageElement.style.position = 'absolute';
    imageElement.style.left = '50%';
    imageElement.style.top = '50%';
    imageElement.style.transform = 'translate(-50%, -50%)';
    imageElement.style.width = '200px';
    imageElement.style.height = 'auto';
    
    canvas.appendChild(imageElement);
    emptyMessage.style.display = 'none';
    
    // 添加事件监听
    addElementEventListeners(imageElement);
    
    // 选中新添加的元素
    selectElement(imageElement);
    
    // 等待图片加载完成后调整高度
    img.onload = function() {
        if (img.naturalWidth > 0) {
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            imageElement.style.height = (parseInt(imageElement.style.width) * aspectRatio) + 'px';
        }
    };
}

// 添加图标元素
function addIconElement(iconClass) {
    const iconElement = document.createElement('div');
    iconElement.className = 'poster-element icon-element';
    iconElement.id = `element-${nextElementId++}`;
    
    const icon = document.createElement('i');
    icon.className = iconClass;
    iconElement.appendChild(icon);
    
    // 设置初始样式
    iconElement.style.position = 'absolute';
    iconElement.style.left = '50%';
    iconElement.style.top = '50%';
    iconElement.style.transform = 'translate(-50%, -50%)';
    iconElement.style.fontSize = '48px';
    iconElement.style.color = '#4169E1';
    icon.style.display = 'block';
    
    canvas.appendChild(iconElement);
    emptyMessage.style.display = 'none';
    
    // 添加事件监听
    addElementEventListeners(iconElement);
    
    // 选中新添加的元素
    selectElement(iconElement);
}

// 为元素添加事件监听器
function addElementEventListeners(element) {
    // 点击选择
    element.addEventListener('mousedown', function(e) {
        if (e.target === element || element.contains(e.target)) {
            e.stopPropagation();
            selectElement(element);
            
            // 开始拖动
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(element.style.left) || 0;
            startTop = parseInt(element.style.top) || 0;
            
            // 检查是否点击了调整大小的手柄
            if (e.target.classList.contains('resize-handle')) {
                isDragging = false;
                isResizing = true;
                resizeHandle = e.target.className.split(' ')[1]; // 获取手柄位置(top-left, top-right等)
                startWidth = parseInt(element.style.width) || element.offsetWidth;
                startHeight = parseInt(element.style.height) || element.offsetHeight;
            }
        }
    });
    
    // 文本编辑结束后更新内容
    if (element.classList.contains('text-element')) {
        element.addEventListener('blur', function() {
            element.contentEditable = false;
        });
        
        element.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            element.contentEditable = true;
            element.focus();
        });
    }
}

// 选择元素
function selectElement(element) {
    // 首先取消选择所有元素
    deselectAllElements();
    
    // 选择当前元素
    selectedElement = element;
    element.classList.add('selected');
    
    // 添加调整大小的手柄
    addResizeHandles(element);
    
    // 显示元素编辑器
    if (element.classList.contains('text-element')) {
        showElementEditor('text');
        updateTextEditor(element);
    } else if (element.classList.contains('shape-element')) {
        showElementEditor('shape');
        updateShapeEditor(element);
    } else if (element.classList.contains('image-element')) {
        showElementEditor('image');
        updateImageEditor(element);
    }
}

// 添加调整大小的手柄
function addResizeHandles(element) {
    // 创建四个角落的调整手柄
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    
    positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${pos}`;
        element.appendChild(handle);
    });
}

// 更新文本编辑器
function updateTextEditor(element) {
    document.getElementById('text-content').value = element.textContent;
    document.getElementById('text-font').value = element.style.fontFamily || 'Arial, sans-serif';
    
    const fontSize = parseInt(element.style.fontSize) || 16;
    document.getElementById('text-size').value = fontSize;
    document.getElementById('text-size-value').textContent = fontSize + 'px';
    
    document.getElementById('text-color').value = rgbToHex(element.style.color || '#333333');
    document.getElementById('text-align').value = element.style.textAlign || 'left';
    
    // 更新粗体、斜体、下划线按钮状态
    document.getElementById('text-bold').classList.toggle('active', element.style.fontWeight === 'bold');
    document.getElementById('text-italic').classList.toggle('active', element.style.fontStyle === 'italic');
    document.getElementById('text-underline').classList.toggle('active', element.style.textDecoration === 'underline');
}

// 更新形状编辑器
function updateShapeEditor(element) {
    // 获取背景颜色(可能是background-color或SVG中的fill)
    let bgColor = element.style.backgroundColor;
    if (bgColor === 'transparent' && element.style.backgroundImage) {
        // 尝试从SVG提取fill颜色
        const svgMatch = element.style.backgroundImage.match(/fill='([^']+)'/);
        if (svgMatch && svgMatch[1]) {
            bgColor = svgMatch[1];
        }
    }
    
    document.getElementById('shape-color').value = rgbToHex(bgColor || '#4169E1');
    
    const opacity = parseFloat(element.style.opacity) || 1;
    document.getElementById('shape-opacity').value = opacity * 100;
    document.getElementById('shape-opacity-value').textContent = Math.round(opacity * 100) + '%';
    
    const borderWidth = parseInt(element.style.borderWidth) || 0;
    document.getElementById('shape-border-width').value = borderWidth;
    document.getElementById('shape-border-width-value').textContent = borderWidth + 'px';
    
    document.getElementById('shape-border-color').value = rgbToHex(element.style.borderColor || '#000000');
    
    const borderRadius = parseInt(element.style.borderRadius) || 0;
    document.getElementById('shape-border-radius').value = borderRadius;
    document.getElementById('shape-border-radius-value').textContent = borderRadius + 'px';
}

// 更新图片编辑器
function updateImageEditor(element) {
    const opacity = parseFloat(element.querySelector('img').style.opacity) || 1;
    document.getElementById('image-opacity').value = opacity * 100;
    document.getElementById('image-opacity-value').textContent = Math.round(opacity * 100) + '%';
    
    const borderWidth = parseInt(element.style.borderWidth) || 0;
    document.getElementById('image-border-width').value = borderWidth;
    document.getElementById('image-border-width-value').textContent = borderWidth + 'px';
    
    document.getElementById('image-border-color').value = rgbToHex(element.style.borderColor || '#000000');
    
    const borderRadius = parseInt(element.style.borderRadius) || 0;
    document.getElementById('image-border-radius').value = borderRadius;
    document.getElementById('image-border-radius-value').textContent = borderRadius + 'px';
}

// RGB转换为HEX
function rgbToHex(rgb) {
    // 检查是否已经是十六进制格式
    if (rgb.startsWith('#')) {
        return rgb;
    }
    
    // 提取RGB值
    const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!rgbMatch) {
        return '#333333'; // 默认颜色
    }
    
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
