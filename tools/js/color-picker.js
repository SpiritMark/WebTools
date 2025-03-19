// 颜色选择器核心功能
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const colorField = document.getElementById('color-field');
    const hueSlider = document.getElementById('hue-slider');
    const alphaSlider = document.getElementById('alpha-slider');
    const colorCursor = document.getElementById('color-cursor');
    const hueCursor = document.getElementById('hue-cursor');
    const alphaCursor = document.getElementById('alpha-cursor');
    
    // 颜色输入框
    const hexInput = document.getElementById('hex-input');
    const rgbInput = document.getElementById('rgb-input');
    const hslInput = document.getElementById('hsl-input');
    const rgbaInput = document.getElementById('rgba-input');
    const hslaInput = document.getElementById('hsla-input');
    
    // 颜色状态
    let currentColor = {
        hue: 0,         // 0-360
        saturation: 1,  // 0-1
        value: 1,       // 0-1
        alpha: 1        // 0-1
    };
    
    // 初始化画布
    const fieldCtx = colorField.getContext('2d');
    const hueCtx = hueSlider.getContext('2d');
    const alphaCtx = alphaSlider.getContext('2d');
    
    // 设置画布尺寸
    function setupCanvases() {
        // 设置色域画布
        colorField.width = colorField.offsetWidth;
        colorField.height = colorField.offsetHeight;
        
        // 设置色相滑块
        hueSlider.width = hueSlider.offsetWidth;
        hueSlider.height = hueSlider.offsetHeight;
        
        // 设置透明度滑块
        alphaSlider.width = alphaSlider.offsetWidth;
        alphaSlider.height = alphaSlider.offsetHeight;
        
        // 绘制初始状态
        drawColorField();
        drawHueSlider();
        drawAlphaSlider();
        updateCursors();
        updateColorInputs();
    }
    
    // 绘制色域
    function drawColorField() {
        const width = colorField.width;
        const height = colorField.height;
        fieldCtx.clearRect(0, 0, width, height);
        
        // 创建色相纯度渐变
        for (let y = 0; y < height; y++) {
            // 计算明度值 (从底部1到顶部0)
            const value = 1 - (y / height);
            
            // 创建从白色到纯色相的水平渐变
            const gradient = fieldCtx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, `hsla(${currentColor.hue}, 0%, ${value * 100}%, ${currentColor.alpha})`);  // 左侧为灰色
            gradient.addColorStop(1, `hsla(${currentColor.hue}, 100%, ${value * 50}%, ${currentColor.alpha})`); // 右侧为纯色相
            
            fieldCtx.fillStyle = gradient;
            fieldCtx.fillRect(0, y, width, 1);
        }
    }
    
    // 绘制色相滑块
    function drawHueSlider() {
        const width = hueSlider.width;
        const height = hueSlider.height;
        const gradient = hueCtx.createLinearGradient(0, 0, width, 0);
        
        // 创建色相渐变 (0-360度)
        for (let i = 0; i <= 360; i += 60) {
            gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
        }
        
        hueCtx.clearRect(0, 0, width, height);
        hueCtx.fillStyle = gradient;
        hueCtx.fillRect(0, 0, width, height);
    }
    
    // 绘制透明度滑块
    function drawAlphaSlider() {
        const width = alphaSlider.width;
        const height = alphaSlider.height;
        
        // 清除画布
        alphaCtx.clearRect(0, 0, width, height);
        
        // 绘制透明度背景格子图案
        const patternSize = 8;
        alphaCtx.fillStyle = '#fff';
        alphaCtx.fillRect(0, 0, width, height);
        alphaCtx.fillStyle = '#ccc';
        
        for (let i = 0; i < width; i += patternSize) {
            for (let j = 0; j < height; j += patternSize) {
                if ((i / patternSize + j / patternSize) % 2 === 0) {
                    alphaCtx.fillRect(i, j, patternSize, patternSize);
                }
            }
        }
        
        // 创建透明度渐变
        const gradient = alphaCtx.createLinearGradient(0, 0, width, 0);
        const rgbColor = hsvToRgb(currentColor.hue, currentColor.saturation, currentColor.value);
        gradient.addColorStop(0, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 0)`);
        gradient.addColorStop(1, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, 1)`);
        
        alphaCtx.fillStyle = gradient;
        alphaCtx.fillRect(0, 0, width, height);
    }
    
    // 更新光标位置
    function updateCursors() {
        // 更新色域光标
        const fieldWidth = colorField.width;
        const fieldHeight = colorField.height;
        
        // 设置色相饱和度光标位置
        const xPos = currentColor.saturation * fieldWidth;
        const yPos = (1 - currentColor.value) * fieldHeight;
        
        colorCursor.style.left = `${xPos}px`;
        colorCursor.style.top = `${yPos}px`;
        
        // 更新色相滑块光标
        const huePos = (currentColor.hue / 360) * hueSlider.width;
        hueCursor.style.left = `${huePos}px`;
        
        // 更新透明度滑块光标
        const alphaPos = currentColor.alpha * alphaSlider.width;
        alphaCursor.style.left = `${alphaPos}px`;
    }
    
    // 更新颜色输入框
    function updateColorInputs() {
        const rgb = hsvToRgb(currentColor.hue, currentColor.saturation, currentColor.value);
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        
        // 更新HEX输入
        if (currentColor.alpha === 1) {
            hexInput.value = rgbToHex(rgb.r, rgb.g, rgb.b);
        } else {
            hexInput.value = rgbToHex(rgb.r, rgb.g, rgb.b, currentColor.alpha);
        }
        
        // 更新RGB输入
        rgbInput.value = `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`;
        
        // 更新HSL输入
        hslInput.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
        
        // 更新RGBA输入
        rgbaInput.value = `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${currentColor.alpha.toFixed(2)})`;
        
        // 更新HSLA输入
        hslaInput.value = `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${currentColor.alpha.toFixed(2)})`;
        
        // 更新对比度测试的颜色预览
        if (document.getElementById('foreground-preview')) {
            document.getElementById('foreground-preview').style.backgroundColor = rgbInput.value;
            document.getElementById('foreground-color').value = hexInput.value;
        }
        
        // 更新颜色和谐面板
        updateHarmonies();
        
        // 保存到历史记录
        addToColorHistory(hexInput.value);
    }
    
    // HSV转RGB
    function hsvToRgb(h, s, v) {
        let r, g, b;
        const i = Math.floor(h / 60);
        const f = h / 60 - i;
        const p = v * (1 - s);
        const q = v * (1 - f * s);
        const t = v * (1 - (1 - f) * s);
        
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    // RGB转HSV
    function rgbToHsv(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        let h, s, v;
        v = max;
        
        if (delta === 0) {
            h = 0;
            s = 0;
        } else {
            s = delta / max;
            
            if (max === r) {
                h = ((g - b) / delta) % 6;
            } else if (max === g) {
                h = (b - r) / delta + 2;
            } else {
                h = (r - g) / delta + 4;
            }
            
            h = Math.round(h * 60);
            if (h < 0) h += 360;
        }
        
        return { h, s, v };
    }
    
    // RGB转HSL
    function rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        let h, s, l = (max + min) / 2;
        
        if (delta === 0) {
            h = 0;
            s = 0;
        } else {
            s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
            
            if (max === r) {
                h = ((g - b) / delta) % 6;
            } else if (max === g) {
                h = (b - r) / delta + 2;
            } else {
                h = (r - g) / delta + 4;
            }
            
            h = Math.round(h * 60);
            if (h < 0) h += 360;
        }
        
        return { 
            h, 
            s: s * 100, 
            l: l * 100 
        };
    }
    
    // RGB转HEX
    function rgbToHex(r, g, b, a) {
        r = Math.round(r);
        g = Math.round(g);
        b = Math.round(b);
        
        const hexR = r.toString(16).padStart(2, '0');
        const hexG = g.toString(16).padStart(2, '0');
        const hexB = b.toString(16).padStart(2, '0');
        
        if (a !== undefined) {
            const hexA = Math.round(a * 255).toString(16).padStart(2, '0');
            return `#${hexR}${hexG}${hexB}${hexA}`;
        }
        
        return `#${hexR}${hexG}${hexB}`.toUpperCase();
    }
    
    // HEX转RGB
    function hexToRgb(hex) {
        // 去除#号
        hex = hex.replace(/^#/, '');
        
        // 处理简写形式 #RGB
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // 处理带透明度的形式 #RGBA或#RRGGBBAA
        let alpha = 1;
        if (hex.length === 8) {
            alpha = parseInt(hex.slice(6, 8), 16) / 255;
            hex = hex.slice(0, 6);
        } else if (hex.length === 4) {
            alpha = parseInt(hex.slice(3, 4) + hex.slice(3, 4), 16) / 255;
            hex = hex.slice(0, 3);
            // 处理简写形式
            if (hex.length === 3) {
                hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            }
        }
        
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        
        return { r, g, b, alpha };
    }
    
    // 设置当前颜色
    function setCurrentColor(color) {
        // 更新当前颜色状态
        currentColor = color;
        
        // 重绘色域和透明度滑块
        drawColorField();
        drawAlphaSlider();
        
        // 更新光标
        updateCursors();
        
        // 更新输入
        updateColorInputs();
    }
    
    // 色域画布点击/拖动事件
    function handleColorFieldChange(e) {
        const rect = colorField.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        
        // 限制在画布范围内
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));
        
        // 计算饱和度和明度值
        const saturation = x / rect.width;
        const value = 1 - (y / rect.height);
        
        // 更新当前颜色
        currentColor.saturation = saturation;
        currentColor.value = value;
        
        // 更新显示
        updateCursors();
        updateColorInputs();
        drawAlphaSlider();
    }
    
    // 色相滑块点击/拖动事件
    function handleHueChange(e) {
        const rect = hueSlider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        
        // 限制在滑块范围内
        x = Math.max(0, Math.min(x, rect.width));
        
        // 计算色相值 (0-360)
        const hue = Math.round((x / rect.width) * 360);
        
        // 更新当前颜色
        currentColor.hue = hue;
        
        // 更新显示
        drawColorField();
        drawAlphaSlider();
        updateCursors();
        updateColorInputs();
    }
    
    // 透明度滑块点击/拖动事件
    function handleAlphaChange(e) {
        const rect = alphaSlider.getBoundingClientRect();
        let x = e.clientX - rect.left;
        
        // 限制在滑块范围内
        x = Math.max(0, Math.min(x, rect.width));
        
        // 计算透明度值 (0-1)
        const alpha = x / rect.width;
        
        // 更新当前颜色
        currentColor.alpha = alpha;
        
        // 更新显示
        updateCursors();
        updateColorInputs();
    }
    
    // 获取或创建全局颜色历史记录
    function getColorHistory() {
        const storedHistory = localStorage.getItem('colorPickerHistory');
        return storedHistory ? JSON.parse(storedHistory) : [];
    }
    
    // 添加颜色到历史记录
    function addToColorHistory(color) {
        // 最多存储16个历史颜色
        const maxHistory = 16;
        const history = getColorHistory();
        
        // 如果颜色已经在历史记录中，不重复添加
        if (history.includes(color)) return;
        
        // 将新颜色添加到历史记录开头
        history.unshift(color);
        
        // 如果历史记录超过最大长度，删除最旧的颜色
        if (history.length > maxHistory) {
            history.pop();
        }
        
        // 保存更新后的历史记录
        localStorage.setItem('colorPickerHistory', JSON.stringify(history));
        
        // 更新历史记录显示
        updateColorHistoryDisplay();
    }
    
    // 更新历史记录显示
    function updateColorHistoryDisplay() {
        const historyContainer = document.getElementById('color-history');
        const history = getColorHistory();
        
        // 清空容器
        historyContainer.innerHTML = '';
        
        // 添加历史颜色
        history.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.addEventListener('click', () => {
                loadColorFromHex(color);
            });
            historyContainer.appendChild(swatch);
        });
    }
    
    // 从HEX加载颜色
    function loadColorFromHex(hex) {
        const rgb = hexToRgb(hex);
        const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
        
        // 设置当前颜色
        setCurrentColor({
            hue: hsv.h,
            saturation: hsv.s,
            value: hsv.v,
            alpha: rgb.alpha || 1
        });
    }
    
    // 初始化色彩预设
    function initColorPresets() {
        const presets = [
            '#FF0000', '#FF8000', '#FFFF00', '#80FF00', 
            '#00FF00', '#00FF80', '#00FFFF', '#0080FF',
            '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
            '#000000', '#808080', '#C0C0C0', '#FFFFFF'
        ];
        
        const presetsContainer = document.getElementById('color-presets');
        presetsContainer.innerHTML = '';
        
        presets.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.title = color;
            swatch.addEventListener('click', () => {
                loadColorFromHex(color);
            });
            presetsContainer.appendChild(swatch);
        });
    }
    
    // 初始化
    function init() {
        // 设置画布尺寸
        setupCanvases();
        
        // 初始化色彩预设
        initColorPresets();
        
        // 显示历史记录
        updateColorHistoryDisplay();
        
        // 初始化和谐色彩
        updateHarmonies();
        
        // 事件监听
        // 色域画布事件
        let colorFieldActive = false;
        colorField.addEventListener('mousedown', (e) => {
            colorFieldActive = true;
            handleColorFieldChange(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (colorFieldActive) {
                handleColorFieldChange(e);
            }
        });
        document.addEventListener('mouseup', () => {
            colorFieldActive = false;
        });
        
        // 色相滑块事件
        let hueActive = false;
        hueSlider.addEventListener('mousedown', (e) => {
            hueActive = true;
            handleHueChange(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (hueActive) {
                handleHueChange(e);
            }
        });
        document.addEventListener('mouseup', () => {
            hueActive = false;
        });
        
        // 透明度滑块事件
        let alphaActive = false;
        alphaSlider.addEventListener('mousedown', (e) => {
            alphaActive = true;
            handleAlphaChange(e);
        });
        document.addEventListener('mousemove', (e) => {
            if (alphaActive) {
                handleAlphaChange(e);
            }
        });
        document.addEventListener('mouseup', () => {
            alphaActive = false;
        });
        
        // 输入框事件
        hexInput.addEventListener('change', () => {
            let hex = hexInput.value.trim();
            if (!/^#/.test(hex)) hex = '#' + hex;
            if (/^#([0-9A-F]{3}){1,2}$/i.test(hex) || /^#([0-9A-F]{4}){1,2}$/i.test(hex)) {
                loadColorFromHex(hex);
            } else {
                // 恢复原始值
                updateColorInputs();
            }
        });
    }
    
    // 初始化
    init();
}); 