/**
 * 国际化支持
 * 支持多语言、自动检测浏览器语言和cookie保存
 */

// 翻译文本库
const translations = {
    'zh-CN': {
  common: {
      home: '首页',
            tools: '工具集',
            categories: '分类',
            about: '关于我们',
            language: '简体中文',
            allRightsReserved: '版权所有',
      termsOfUse: '使用条款',
      privacyPolicy: '隐私政策',
      contactUs: '联系我们',
            downloadApp: '下载App',
            search: '搜索...',
            supportedFormats: '支持格式: JPG, PNG, GIF, BMP, WEBP'
        },
        index: {
            title: '在线工具箱 - 一站式在线工具集合',
            heroTitle: '多功能在线工具箱',
            heroSubtitle: '无需下载安装，直接在浏览器中使用各种实用工具',
            exploreTools: '立即使用',
            aboutDescription: '工具箱Pro是一个为用户提供各种实用工具的平台，我们致力于开发简单易用的在线工具，帮助用户提高工作效率。'
        },
        categories: {
            documents: '文档与文本工具',
            images: '图像处理',
            videos: '视频与音频',
            data: '数据处理',
            utility: '实用工具',
            design: '设计与创意',
            security: '安全与隐私',
            development: '开发工具',
            toolAvailable: '个工具可用'
        },
        tools: {
            pdfTools: 'PDF工具',
            textProcessing: '文本处理',
            encryption: '文本加密解密',
            markdownEditor: 'Markdown编辑器',
            codeFormatter: '代码格式化',
            richTextEditor: '富文本编辑器',
            imageEditor: '图片编辑',
            idPhoto: '证件照制作',
            imageCollage: '图片拼接',
            imageEffects: '图片特效',
            batchImage: '批量图片处理',
            bgRemove: '图片背景去除',
            webpageSnapshot: '网页快照工具'
        }
    },
    'en': {
        common: {
      home: 'Home',
      tools: 'Tools',
            categories: 'Categories',
      about: 'About',
            language: 'English',
            allRightsReserved: 'All Rights Reserved',
      termsOfUse: 'Terms of Use',
      privacyPolicy: 'Privacy Policy',
      contactUs: 'Contact Us',
            downloadApp: 'Download App',
            search: 'Search...',
            supportedFormats: 'Supported formats: JPG, PNG, GIF, BMP, WEBP'
        },
  index: {
            title: 'Online Toolbox - All-in-One Online Tools Collection',
            heroTitle: 'Multi-functional Online Toolbox',
            heroSubtitle: 'Use various practical tools directly in your browser without downloading or installing',
            exploreTools: 'Get Started',
            aboutDescription: 'Toolbox Pro is a platform that provides users with various practical tools. We are committed to developing simple and easy-to-use online tools to help users improve work efficiency.'
        },
        categories: {
            documents: 'Documents & Text',
            images: 'Image Processing',
            videos: 'Video & Audio',
            data: 'Data Processing',
            utility: 'Utility Tools',
            design: 'Design & Creative',
            security: 'Security & Privacy',
            development: 'Developer Tools',
            toolAvailable: 'tools available'
        },
        tools: {
            pdfTools: 'PDF Tools',
            textProcessing: 'Text Processing',
            encryption: 'Text Encryption',
            markdownEditor: 'Markdown Editor',
            codeFormatter: 'Code Formatter',
            richTextEditor: 'Rich Text Editor',
            imageEditor: 'Image Editor',
            idPhoto: 'ID Photo Maker',
            imageCollage: 'Image Collage',
            imageEffects: 'Image Effects',
            batchImage: 'Batch Image Processing',
            bgRemove: 'Background Remover',
            webpageSnapshot: 'Webpage Snapshot'
        }
    },
    'ja': {
        common: {
            home: 'ホーム',
            tools: 'ツール',
            categories: 'カテゴリー',
            about: '私たちについて',
            language: '日本語',
            allRightsReserved: '無断複写·転載を禁じます',
            termsOfUse: '利用規約',
            privacyPolicy: 'プライバシーポリシー',
            contactUs: 'お問い合わせ',
            downloadApp: 'アプリをダウンロード',
            search: '検索...',
            supportedFormats: '対応フォーマット: JPG, PNG, GIF, BMP, WEBP'
        },
        index: {
            title: 'オンラインツールボックス - オールインワンオンラインツールコレクション',
            heroTitle: '多機能オンラインツールボックス',
            heroSubtitle: 'ダウンロードやインストールなしで、ブラウザで直接様々な実用的なツールを使用できます',
            exploreTools: '使ってみる',
            aboutDescription: 'ツールボックスProは、ユーザーに様々な実用的なツールを提供するプラットフォームです。私たちは、シンプルで使いやすいオンラインツールを開発し、ユーザーの作業効率を向上させることに取り組んでいます。'
        },
        categories: {
            documents: '文書とテキスト',
            images: '画像処理',
            videos: '動画と音声',
            data: 'データ処理',
            utility: '実用ツール',
            design: 'デザインと創造',
            security: 'セキュリティとプライバシー',
            development: '開発ツール',
            toolAvailable: 'のツールが利用可能'
        },
        tools: {
            pdfTools: 'PDFツール',
            textProcessing: 'テキスト処理',
            encryption: 'テキスト暗号化',
            markdownEditor: 'Markdownエディタ',
            codeFormatter: 'コードフォーマッタ',
            richTextEditor: 'リッチテキストエディタ',
            imageEditor: '画像エディタ',
            idPhoto: '証明写真作成',
            imageCollage: '画像コラージュ',
            imageEffects: '画像エフェクト',
            batchImage: '一括画像処理',
            bgRemove: '背景削除',
            webpageSnapshot: 'ウェブページスナップショット'
        }
    }
};

// 当前语言
let currentLanguage = 'zh-CN';

// 从Cookies中获取语言设置
function getLanguageFromCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith('language=')) {
            return cookie.substring('language='.length, cookie.length);
        }
    }
    return null;
}

// 从浏览器语言设置获取语言
function getLanguageFromBrowser() {
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang.startsWith('zh')) return 'zh-CN';
    if (browserLang.startsWith('ja')) return 'ja';
    return 'en'; // 默认英语
}

// 确定使用的语言
function determineLanguage() {
    // 优先使用Cookie中的语言设置
    const cookieLang = getLanguageFromCookie();
    if (cookieLang && translations[cookieLang]) {
        return cookieLang;
    }
    
    // 否则使用浏览器语言设置
    return getLanguageFromBrowser();
}

// 更新语言指示器
function updateLanguageIndicator(lang) {
    // 更新语言选择器按钮文本
    const langButtons = document.querySelectorAll('.language-selector-btn span[data-i18n="common.language"]');
    langButtons.forEach(button => {
        if (translations[lang] && translations[lang].common && translations[lang].common.language) {
            button.textContent = translations[lang].common.language;
        }
    });
    
    // 更新下拉菜单中的活动状态
    const langItems = document.querySelectorAll('.language-item');
    langItems.forEach(item => {
        // 移除所有item的active类
        item.classList.remove('active');
        
        // 给当前语言的item添加active类
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(`'${lang}'`)) {
            item.classList.add('active');
        }
    });
}

// 翻译元素
function translateElements(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n').split('.');
        const namespace = key[0];
        const term = key[1];
        
        if (translations[lang] && translations[lang][namespace] && translations[lang][namespace][term]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.getAttribute('placeholder')) {
                    el.setAttribute('placeholder', translations[lang][namespace][term]);
        } else {
                    el.value = translations[lang][namespace][term];
        }
        } else {
                el.textContent = translations[lang][namespace][term];
            }
        }
    });
}

// 动态创建的元素翻译函数
function updateDynamicElements(lang) {
    // 此函数用于翻译动态创建的元素，如果需要的话
}

// 切换语言
function changeLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        
        // 设置Cookie
        document.cookie = `language=${lang};path=/;max-age=${60*60*24*30}`;
        
        // 更新UI
        translateElements(lang);
        updateLanguageIndicator(lang);
        
        // 触发自定义事件，通知其他脚本语言已变更
        const event = new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        });
        document.dispatchEvent(event);
        
        console.log(`Language changed to: ${lang}`);
    } else {
        console.error(`Language ${lang} is not supported.`);
    }
}

// 获取翻译文本
function getText(key, lang = currentLanguage) {
    const parts = key.split('.');
    if (parts.length !== 2) return key;
    
    const namespace = parts[0];
    const term = parts[1];
    
    if (translations[lang] && translations[lang][namespace] && translations[lang][namespace][term]) {
        return translations[lang][namespace][term];
    }
    
    return key;
}

// 初始化 i18n
document.addEventListener('DOMContentLoaded', function() {
    // 确定使用的语言
    const initialLang = determineLanguage();
    currentLanguage = initialLang;
    
    // 应用翻译
    translateElements(initialLang);
    updateLanguageIndicator(initialLang);
    
    console.log(`Initialized with language: ${initialLang}`);
    
    // 暴露全局函数
    window.changeLanguage = changeLanguage;
    window.getText = getText;
    window.switchLanguage = changeLanguage; // 别名，兼容旧代码
});
