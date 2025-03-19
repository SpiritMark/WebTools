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
            supportedFormats: '支持格式: JPG, PNG, GIF, BMP, WEBP',
            apply: '应用',
            cancel: '取消',
            upload: '选择图片',
            dragAndDrop: '拖放图片到此处，或'
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
            webpageSnapshot: '网页快照工具',
            anonymousChat: '匿名聊天'
        },
        anonymousChat: {
            title: '匿名聊天',
            description: '创建或加入聊天室，与他人进行安全匿名的交流，无需注册账号',
            joinOrCreate: '加入或创建聊天室',
            roomId: '聊天室ID',
            roomIdPlaceholder: '输入或自动生成聊天室ID',
            generateRandom: '生成随机ID',
            roomIdHint: '分享该ID给好友以便他们加入同一聊天室',
            nickname: '昵称',
            nicknamePlaceholder: '输入您的昵称',
            encryption: '端到端加密',
            messageExpiry: '消息自动销毁',
            joinChat: '进入聊天室',
            privacyNote: '所有消息均在浏览器端加密，我们不存储任何聊天内容，确保您的隐私安全',
            members: '成员',
            leaveRoom: '离开聊天室',
            connected: '已连接',
            welcomeTitle: '欢迎来到加密聊天室',
            welcomeMessage: '此聊天室中的所有消息均已加密，刷新页面或关闭浏览器后聊天记录将被清除。',
            messagePlaceholder: '输入消息...',
            addText: '添加文本',
            clearDrawing: '清除绘图',
            downloadImage: '下载图片',
            resetImage: '重置图片'
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
            supportedFormats: 'Supported formats: JPG, PNG, GIF, BMP, WEBP',
            apply: 'Apply',
            cancel: 'Cancel',
            upload: 'Select Image',
            dragAndDrop: 'Drag and drop image here, or'
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
            webpageSnapshot: 'Webpage Snapshot',
            anonymousChat: 'Anonymous Chat'
        },
        anonymousChat: {
            title: 'Anonymous Chat',
            description: 'Create or join chat rooms for secure, anonymous communication with others, no registration required',
            joinOrCreate: 'Join or Create a Chat Room',
            roomId: 'Room ID',
            roomIdPlaceholder: 'Enter or auto-generate Room ID',
            generateRandom: 'Generate Random ID',
            roomIdHint: 'Share this ID with friends so they can join the same chat room',
            nickname: 'Nickname',
            nicknamePlaceholder: 'Enter your nickname',
            encryption: 'End-to-end encryption',
            messageExpiry: 'Auto-delete messages',
            joinChat: 'Enter Chat Room',
            privacyNote: 'All messages are encrypted in your browser. We don\'t store any chat content, ensuring your privacy',
            members: 'Members',
            leaveRoom: 'Leave Room',
            connected: 'Connected',
            welcomeTitle: 'Welcome to Encrypted Chat Room',
            welcomeMessage: 'All messages in this chat room are encrypted. Chat history will be deleted after refreshing the page or closing the browser.',
            messagePlaceholder: 'Type a message...',
            addText: 'Add Text',
            clearDrawing: 'Clear Drawing',
            downloadImage: 'Download Image',
            resetImage: 'Reset Image'
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
            supportedFormats: '対応フォーマット: JPG, PNG, GIF, BMP, WEBP',
            apply: '適用',
            cancel: 'キャンセル',
            upload: '画像を選択',
            dragAndDrop: '画像をここにドラッグ＆ドロップ、または'
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
            webpageSnapshot: 'ウェブページスナップショット',
            anonymousChat: '匿名チャット'
        },
        anonymousChat: {
            title: '匿名チャット',
            description: 'チャットルームを作成または参加し、安全に匿名で通信できます。登録不要',
            joinOrCreate: 'チャットルームに参加または作成',
            roomId: 'ルームID',
            roomIdPlaceholder: 'ルームIDを入力または自動生成',
            generateRandom: 'ランダムID生成',
            roomIdHint: '友達と同じチャットルームに参加できるように、このIDを共有してください',
            nickname: 'ニックネーム',
            nicknamePlaceholder: 'ニックネームを入力',
            encryption: 'エンドツーエンド暗号化',
            messageExpiry: 'メッセージ自動削除',
            joinChat: 'チャットルームに入る',
            privacyNote: 'すべてのメッセージはブラウザ内で暗号化されます。チャット内容は保存されず、プライバシーが確保されます',
            members: 'メンバー',
            leaveRoom: 'ルームを退出',
            connected: '接続済み',
            welcomeTitle: '暗号化チャットルームへようこそ',
            welcomeMessage: 'このチャットルームのすべてのメッセージは暗号化されています。ページを更新したりブラウザを閉じたりすると、チャット履歴は削除されます。',
            messagePlaceholder: 'メッセージを入力...',
            addText: 'テキストを追加',
            clearDrawing: '描画をクリア',
            downloadImage: '画像をダウンロード',
            resetImage: '画像をリセット'
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
        updateDynamicElements(lang);
        
        // 更新页面标题
        const titleElement = document.querySelector('title');
        if (titleElement && titleElement.hasAttribute('data-i18n')) {
            const key = titleElement.getAttribute('data-i18n').split('.');
            const namespace = key[0];
            const term = key[1];
            
            if (translations[lang] && translations[lang][namespace] && translations[lang][namespace][term]) {
                titleElement.textContent = translations[lang][namespace][term];
            }
        }
    } else {
        console.error(`Language ${lang} is not supported.`);
    }
}

// 获取特定文本
function getText(key, lang = currentLanguage) {
    const keyParts = key.split('.');
    const namespace = keyParts[0];
    const term = keyParts[1];
    
    if (translations[lang] && translations[lang][namespace] && translations[lang][namespace][term]) {
        return translations[lang][namespace][term];
    }
    
    return key; // 如果找不到翻译，返回键名
}

// 初始化多语言支持
function initI18n() {
    // 确定使用哪种语言
    currentLanguage = determineLanguage();
    
    // 应用翻译
    translateElements(currentLanguage);
    updateLanguageIndicator(currentLanguage);
    
    // 绑定语言切换事件
    const switchButtons = document.querySelectorAll('[onclick^="switchLanguage"]');
    switchButtons.forEach(button => {
        const match = button.getAttribute('onclick').match(/switchLanguage\(['"]([^'"]+)['"]\)/);
        if (match && match[1]) {
            const lang = match[1];
            button.addEventListener('click', function(e) {
                e.preventDefault();
                changeLanguage(lang);
            });
            // 移除内联onclick属性
            button.removeAttribute('onclick');
        }
    });
    
    // 更新页面标题
    const titleElement = document.querySelector('title');
    if (titleElement && titleElement.hasAttribute('data-i18n')) {
        const key = titleElement.getAttribute('data-i18n').split('.');
        const namespace = key[0];
        const term = key[1];
        
        if (translations[currentLanguage] && translations[currentLanguage][namespace] && translations[currentLanguage][namespace][term]) {
            titleElement.textContent = translations[currentLanguage][namespace][term];
        }
    }
}

// 公开的语言切换函数
function switchLanguage(lang) {
    changeLanguage(lang);
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', initI18n);
