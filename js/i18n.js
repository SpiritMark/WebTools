/**
 * 国际化支持库
 * Internationalization support library
 */

// 当前语言设置
let currentLanguage = localStorage.getItem('language') || 'zh';

// 翻译文本库
const translations = {
  // 通用
  common: {
    zh: {
      home: '首页',
      tools: '工具',
      about: '关于',
      termsOfUse: '使用条款',
      privacyPolicy: '隐私政策',
      contactUs: '联系我们',
      allRightsReserved: '版权所有',
      download: '下载',
      reset: '重置',
      apply: '应用',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      upload: '上传',
      dragAndDrop: '点击或拖拽图片到此处',
      supportedFormats: '支持格式: JPG, PNG, GIF, BMP, WEBP',
      switchToEnglish: 'English',
      switchToChinese: '中文'
    },
    en: {
      home: 'Home',
      tools: 'Tools',
      about: 'About',
      termsOfUse: 'Terms of Use',
      privacyPolicy: 'Privacy Policy',
      contactUs: 'Contact Us',
      allRightsReserved: 'All rights reserved',
      download: 'Download',
      reset: 'Reset',
      apply: 'Apply',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      upload: 'Upload',
      dragAndDrop: 'Click or drag image here',
      supportedFormats: 'Supported formats: JPG, PNG, GIF, BMP, WEBP',
      switchToEnglish: 'English',
      switchToChinese: '中文'
    }
  },
  
  // 首页
  index: {
    zh: {
      title: '在线工具箱 - 一站式在线工具集合',
      heroTitle: '多功能在线工具箱',
      heroSubtitle: '简单、快捷、高效的在线工具，满足您的各种需求',
      exploreTools: '探索工具',
      popularTools: '热门工具',
      recentlyAdded: '最近添加',
      aboutUs: '关于我们',
      aboutDescription: '工具箱Pro是一个为用户提供各种实用工具的平台，我们致力于开发简单易用的在线工具，帮助用户提高工作效率。'
    },
    en: {
      title: 'Online Toolbox - All-in-one Online Tools Collection',
      heroTitle: 'Versatile Online Toolbox',
      heroSubtitle: 'Simple, fast, and efficient online tools to meet your various needs',
      exploreTools: 'Explore Tools',
      popularTools: 'Popular Tools',
      recentlyAdded: 'Recently Added',
      aboutUs: 'About Us',
      aboutDescription: 'Toolbox Pro is a platform providing various practical tools for users. We are committed to developing simple and easy-to-use online tools to help users improve work efficiency.'
    }
  },
  
  // 图片编辑工具
  imageEditor: {
    zh: {
      title: '图片编辑器 | 工具箱Pro',
      description: '轻松编辑您的图片，调整大小，添加滤镜和效果，完全在浏览器中处理',
      adjustments: '调整',
      crop: '裁剪',
      filters: '滤镜',
      text: '文本',
      draw: '绘图',
      stickers: '贴纸',
      brightness: '亮度',
      contrast: '对比度',
      saturation: '饱和度',
      rotateLeft: '向左旋转',
      rotateRight: '向右旋转',
      flipHorizontal: '水平翻转',
      flipVertical: '垂直翻转',
      addText: '添加文本',
      textPlaceholder: '输入文本',
      fontFamily: '字体',
      fontSize: '字号',
      textColor: '颜色',
      bold: '粗体',
      italic: '斜体',
      underline: '下划线',
      brushSize: '画笔大小',
      brushColor: '画笔颜色',
      clearDrawing: '清除绘图',
      downloadImage: '下载图片',
      resetImage: '重置图片',
      applyChanges: '应用更改',
      strength: '强度'
    },
    en: {
      title: 'Image Editor | Toolbox Pro',
      description: 'Easily edit your images, resize, add filters and effects, all processed in your browser',
      adjustments: 'Adjustments',
      crop: 'Crop',
      filters: 'Filters',
      text: 'Text',
      draw: 'Draw',
      stickers: 'Stickers',
      brightness: 'Brightness',
      contrast: 'Contrast',
      saturation: 'Saturation',
      rotateLeft: 'Rotate Left',
      rotateRight: 'Rotate Right',
      flipHorizontal: 'Flip Horizontal',
      flipVertical: 'Flip Vertical',
      addText: 'Add Text',
      textPlaceholder: 'Enter text',
      fontFamily: 'Font',
      fontSize: 'Size',
      textColor: 'Color',
      bold: 'Bold',
      italic: 'Italic',
      underline: 'Underline',
      brushSize: 'Brush Size',
      brushColor: 'Brush Color',
      clearDrawing: 'Clear Drawing',
      downloadImage: 'Download Image',
      resetImage: 'Reset Image',
      applyChanges: 'Apply Changes',
      strength: 'Strength'
    }
  },
  
  // 证件照制作工具
  idPhoto: {
    zh: {
      title: '证件照制作 | 工具箱Pro',
      description: '快速制作各种尺寸的证件照，支持自定义背景颜色和尺寸',
      size: '尺寸',
      background: '背景',
      adjust: '调整',
      selectSize: '选择尺寸',
      oneInch: '一寸',
      twoInch: '二寸',
      smallTwoInch: '小二寸',
      passport: '护照',
      custom: '自定义',
      width: '宽度(mm)',
      height: '高度(mm)',
      resolution: '分辨率(DPI)',
      backgroundColor: '背景颜色',
      customColor: '自定义颜色',
      imageAdjustment: '图片调整',
      brightness: '亮度',
      contrast: '对比度',
      saturation: '饱和度',
      rotation: '旋转',
      downloadPhoto: '下载证件照',
      resetPhoto: '重置'
    },
    en: {
      title: 'ID Photo Maker | Toolbox Pro',
      description: 'Quickly create ID photos of various sizes, supporting custom background colors and dimensions',
      size: 'Size',
      background: 'Background',
      adjust: 'Adjust',
      selectSize: 'Select Size',
      oneInch: 'One Inch',
      twoInch: 'Two Inch',
      smallTwoInch: 'Small Two Inch',
      passport: 'Passport',
      custom: 'Custom',
      width: 'Width(mm)',
      height: 'Height(mm)',
      resolution: 'Resolution(DPI)',
      backgroundColor: 'Background Color',
      customColor: 'Custom Color',
      imageAdjustment: 'Image Adjustment',
      brightness: 'Brightness',
      contrast: 'Contrast',
      saturation: 'Saturation',
      rotation: 'Rotation',
      downloadPhoto: 'Download ID Photo',
      resetPhoto: 'Reset'
    }
  },
  
  // 图片拼图工具
  imageCollage: {
    zh: {
      title: '照片拼图 | 工具箱Pro',
      description: '将多张图片拼接成一张精美的拼图，支持多种布局和自定义设置',
      layout: '布局',
      style: '样式',
      adjust: '调整',
      selectLayout: '选择布局',
      spacing: '图片间距',
      borderRadius: '圆角大小',
      backgroundColor: '背景颜色',
      imageAdjustment: '图片调整',
      downloadCollage: '下载拼图',
      resetCollage: '重置',
      supportMultiUpload: '支持多张图片上传'
    },
    en: {
      title: 'Photo Collage | Toolbox Pro',
      description: 'Combine multiple images into a beautiful collage, supporting various layouts and custom settings',
      layout: 'Layout',
      style: 'Style',
      adjust: 'Adjust',
      selectLayout: 'Select Layout',
      spacing: 'Image Spacing',
      borderRadius: 'Border Radius',
      backgroundColor: 'Background Color',
      imageAdjustment: 'Image Adjustment',
      downloadCollage: 'Download Collage',
      resetCollage: 'Reset',
      supportMultiUpload: 'Support multiple image uploads'
    }
  },
  
  // 图片特效工具
  imageEffects: {
    zh: {
      title: '图片特效 | 工具箱Pro',
      description: '为图片添加各种精美的特效，让您的图片更具艺术感',
      effects: '特效',
      adjust: '调整',
      selectEffect: '选择特效',
      vintage: '复古',
      blur: '模糊',
      sharpen: '锐化',
      emboss: '浮雕',
      edge: '边缘',
      pixelate: '像素化',
      noise: '噪点',
      sepia: '复古',
      grayscale: '黑白',
      invert: '反色',
      posterize: '海报',
      solarize: '曝光',
      strength: '强度',
      brightness: '亮度',
      contrast: '对比度',
      saturation: '饱和度',
      downloadImage: '下载图片',
      resetImage: '重置'
    },
    en: {
      title: 'Image Effects | Toolbox Pro',
      description: 'Add various beautiful effects to your images, making them more artistic',
      effects: 'Effects',
      adjust: 'Adjust',
      selectEffect: 'Select Effect',
      vintage: 'Vintage',
      blur: 'Blur',
      sharpen: 'Sharpen',
      emboss: 'Emboss',
      edge: 'Edge',
      pixelate: 'Pixelate',
      noise: 'Noise',
      sepia: 'Sepia',
      grayscale: 'Grayscale',
      invert: 'Invert',
      posterize: 'Posterize',
      solarize: 'Solarize',
      strength: 'Strength',
      brightness: 'Brightness',
      contrast: 'Contrast',
      saturation: 'Saturation',
      downloadImage: 'Download Image',
      resetImage: 'Reset'
    }
  },
  
  // 背景擦除工具
  bgRemove: {
    zh: {
      title: '抠图去背景 | 工具箱Pro',
      description: '智能擦除图片背景,让您的图片更加突出',
      brush: '画笔',
      adjust: '调整',
      brushSettings: '画笔设置',
      brushSize: '画笔大小',
      brushHardness: '画笔硬度',
      brushMode: '画笔模式',
      erase: '擦除',
      restore: '恢复',
      parameterAdjustment: '参数调整',
      edgeSmooth: '边缘平滑',
      backgroundColor: '背景颜色',
      downloadImage: '下载图片',
      resetImage: '重置'
    },
    en: {
      title: 'Background Remover | Toolbox Pro',
      description: 'Intelligently erase image backgrounds to make your images stand out',
      brush: 'Brush',
      adjust: 'Adjust',
      brushSettings: 'Brush Settings',
      brushSize: 'Brush Size',
      brushHardness: 'Brush Hardness',
      brushMode: 'Brush Mode',
      erase: 'Erase',
      restore: 'Restore',
      parameterAdjustment: 'Parameter Adjustment',
      edgeSmooth: 'Edge Smoothing',
      backgroundColor: 'Background Color',
      downloadImage: 'Download Image',
      resetImage: 'Reset'
    }
  },
  
  // 海报制作工具
  posterMaker: {
    zh: {
      title: '海报制作 | 工具箱Pro',
      description: '使用我们的在线海报设计工具，轻松制作各种尺寸的精美海报、横幅和社交媒体图片',
      templates: '模板',
      background: '背景',
      text: '文本',
      elements: '元素',
      images: '图片',
      size: '尺寸',
      socialMedia: '社交媒体',
      webBanner: '网页横幅',
      presentation: '演示文稿',
      advertisement: '广告',
      event: '活动',
      custom: '自定义',
      width: '宽度',
      height: '高度',
      color: '颜色',
      gradient: '渐变',
      image: '图片',
      direction: '方向',
      uploadImage: '上传图片',
      addHeading: '添加标题',
      addSubheading: '添加副标题',
      addBodyText: '添加正文',
      shapes: '形状',
      icons: '图标',
      download: '下载',
      save: '保存',
      clear: '清除',
      editText: '编辑文本',
      content: '内容',
      font: '字体',
      size: '大小',
      style: '样式',
      alignment: '对齐',
      opacity: '不透明度',
      downloadPoster: '下载海报',
      fileFormat: '文件格式',
      quality: '质量'
    },
    en: {
      title: 'Poster Maker | Toolbox Pro',
      description: 'Use our online poster design tool to easily create beautiful posters, banners, and social media images of various sizes',
      templates: 'Templates',
      background: 'Background',
      text: 'Text',
      elements: 'Elements',
      images: 'Images',
      size: 'Size',
      socialMedia: 'Social Media',
      webBanner: 'Web Banner',
      presentation: 'Presentation',
      advertisement: 'Advertisement',
      event: 'Event',
      custom: 'Custom',
      width: 'Width',
      height: 'Height',
      color: 'Color',
      gradient: 'Gradient',
      image: 'Image',
      direction: 'Direction',
      uploadImage: 'Upload Image',
      addHeading: 'Add Heading',
      addSubheading: 'Add Subheading',
      addBodyText: 'Add Body Text',
      shapes: 'Shapes',
      icons: 'Icons',
      download: 'Download',
      save: 'Save',
      clear: 'Clear',
      editText: 'Edit Text',
      content: 'Content',
      font: 'Font',
      size: 'Size',
      style: 'Style',
      alignment: 'Alignment',
      opacity: 'Opacity',
      downloadPoster: 'Download Poster',
      fileFormat: 'File Format',
      quality: 'Quality'
    }
  }
};

/**
 * 获取当前语言
 * Get current language
 */
function getCurrentLanguage() {
  return currentLanguage;
}

/**
 * 设置语言
 * Set language
 */
function setLanguage(lang) {
  if (lang !== 'zh' && lang !== 'en') {
    console.error('不支持的语言 / Unsupported language:', lang);
    return;
  }
  
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  
  // 触发语言更改事件
  const event = new CustomEvent('languageChanged', { detail: { language: lang } });
  document.dispatchEvent(event);
  
  // 更新页面文本
  updatePageText();
  
  // 更新HTML的lang属性
  document.documentElement.lang = lang;
  
  return currentLanguage;
}

/**
 * 切换语言
 * Toggle language
 */
function toggleLanguage() {
  const newLang = currentLanguage === 'zh' ? 'en' : 'zh';
  return setLanguage(newLang);
}

/**
 * 获取翻译文本
 * Get translated text
 */
function t(category, key) {
  if (!translations[category]) {
    console.warn(`翻译类别不存在 / Translation category does not exist: ${category}`);
    return key;
  }
  
  if (!translations[category][currentLanguage]) {
    console.warn(`当前语言的翻译不存在 / Translation for current language does not exist: ${currentLanguage}`);
    return key;
  }
  
  if (!translations[category][currentLanguage][key]) {
    console.warn(`翻译键不存在 / Translation key does not exist: ${key}`);
    return key;
  }
  
  return translations[category][currentLanguage][key];
}

/**
 * 更新页面文本
 * Update page text
 */
function updatePageText() {
  // 获取所有带有 data-i18n 属性的元素
  const elements = document.querySelectorAll('[data-i18n]');
  
  elements.forEach(element => {
    const fullKey = element.getAttribute('data-i18n');
    const [category, key] = fullKey.split('.');
    
    if (category && key) {
      const text = t(category, key);
      
      // 根据元素类型设置内容
      if (element.tagName === 'INPUT' && 
          (element.type === 'text' || element.type === 'search' || element.type === 'email' || element.type === 'password')) {
        if (element.getAttribute('placeholder')) {
          element.setAttribute('placeholder', text);
        } else {
          element.value = text;
        }
      } else if (element.tagName === 'TEXTAREA') {
        if (element.getAttribute('placeholder')) {
          element.setAttribute('placeholder', text);
        } else {
          element.value = text;
        }
      } else if (element.tagName === 'IMG') {
        if (element.getAttribute('alt')) {
          element.setAttribute('alt', text);
        }
      } else {
        element.textContent = text;
      }
    }
  });
  
  // 更新页面标题
  const pageTitleElement = document.querySelector('title[data-i18n]');
  if (pageTitleElement) {
    const [category, key] = pageTitleElement.getAttribute('data-i18n').split('.');
    if (category && key) {
      document.title = t(category, key);
    }
  }
}

/**
 * 添加语言切换按钮
 * Add language toggle button
 */
function addLanguageToggle() {
  // 检查是否已存在语言切换按钮
  if (document.getElementById('languageToggle')) {
    return;
  }
  
  // 创建语言切换按钮
  const toggleBtn = document.createElement('li');
  toggleBtn.innerHTML = `<a href="#" id="languageToggle">${currentLanguage === 'zh' ? 'English' : '中文'}</a>`;
  
  // 添加点击事件
  const link = toggleBtn.querySelector('a');
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const newLang = toggleLanguage();
    this.textContent = newLang === 'zh' ? 'English' : '中文';
  });
  
  // 添加到导航菜单
  const navList = document.getElementById('navList');
  if (navList) {
    navList.appendChild(toggleBtn);
  } else {
    console.warn('未找到导航菜单元素 #navList');
    
    // 尝试使用其他选择器
    const altNavList = document.querySelector('.nav-list');
    if (altNavList) {
      altNavList.appendChild(toggleBtn);
    } else {
      console.error('无法找到导航菜单元素，语言切换按钮未添加');
    }
  }
}

/**
 * 初始化国际化
 * Initialize internationalization
 */
function initI18n() {
  // 设置文档语言
  document.documentElement.lang = currentLanguage;
  
  // 在DOM加载完成后添加语言切换按钮并更新文本
  document.addEventListener('DOMContentLoaded', function() {
    addLanguageToggle();
    updatePageText();
  });
  
  // 如果DOM已经加载完成，则立即执行
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    addLanguageToggle();
    updatePageText();
  }
}

// 自动初始化
initI18n();

// 导出API
window.i18n = {
  getCurrentLanguage,
  setLanguage,
  toggleLanguage,
  t,
  updatePageText,
  addLanguageToggle
}; 