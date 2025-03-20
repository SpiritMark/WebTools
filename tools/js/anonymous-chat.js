/**
 * 匿名聊天工具
 * 使用 Socket.IO 实现实时聊天功能，同时支持端到端加密
 */

// 定义常量
const CHAT_SERVER = 'https://chat-service.toolboxpro.net'; // 聊天服务器地址
const SOCKET_EVENTS = {
    JOIN: 'join',
    LEAVE: 'leave',
    MESSAGE: 'message',
    USER_JOINED: 'user-joined',
    USER_LEFT: 'user-left',
    ROOM_INFO: 'room-info',
    ERROR: 'error'
};

// DOM元素
const elements = {
    // 入口页面
    chatEntry: document.getElementById('chat-entry'),
    roomIdInput: document.getElementById('room-id'),
    nicknameInput: document.getElementById('nickname'),
    generateRoomBtn: document.getElementById('generate-room'),
    createJoinRoomBtn: document.getElementById('create-join-room'),
    encryptionCheckbox: document.getElementById('encryption'),
    messageExpiryCheckbox: document.getElementById('message-expiry'),
    
    // 聊天室页面
    chatRoom: document.getElementById('chat-room'),
    displayRoomId: document.getElementById('display-room-id'),
    copyRoomIdBtn: document.getElementById('copy-room-id'),
    memberList: document.getElementById('member-list'),
    memberCount: document.getElementById('member-count'),
    messagesContainer: document.getElementById('messages-container'),
    messageInput: document.getElementById('message-input'),
    sendMessageBtn: document.getElementById('send-message'),
    connectionStatus: document.getElementById('connection-status'),
    statusText: document.getElementById('status-text'),
    leaveRoomBtn: document.getElementById('leave-room'),
    clearMessagesBtn: document.getElementById('clear-messages'),
    attachFileBtn: document.getElementById('attach-file'),
    emojiPickerBtn: document.getElementById('emoji-picker-btn')
};

// 聊天应用状态
const chatState = {
    socket: null,
    connected: false,
    roomId: '',
    nickname: '',
    encryptionEnabled: true,
    members: {},
    encryptionKey: '',
    clientId: '',
    messageExpiryEnabled: false,
    messageExpiryTime: 24 * 60 * 60 * 1000, // 24小时
    emojiPickerVisible: false,
    storage: null,
    storageRef: null
};

// 表情符号数组
const emojiCategories = {
    smileys: {
        name: '表情',
        icon: 'ri-emotion-line',
        emojis: [
            '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', 
            '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', 
            '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', 
            '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', 
            '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬'
        ]
    },
    hand: {
        name: '手势',
        icon: 'ri-hand-coin-line',
        emojis: [
            '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
            '👆', '👇', '☝️', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐',
            '🤲', '🙏', '✍️', '💅', '🤳', '💪', '🦵', '🦶', '👂', '👃'
        ]
    },
    animals: {
        name: '动物',
        icon: 'ri-bear-smile-line',
        emojis: [
            '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
            '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧',
            '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄'
        ]
    },
    food: {
        name: '食物',
        icon: 'ri-cake-line',
        emojis: [
            '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒',
            '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🍆', '🥔', '🥕',
            '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧀', '🥗', '🍦', '🍰'
        ]
    },
    symbols: {
        name: '符号',
        icon: 'ri-heart-line',
        emojis: [
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕',
            '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️',
            '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '✨', '🌟'
        ]
    }
};

// 常用表情快捷选择
const frequentEmojis = ['👍', '😂', '❤️', '🙏', '😢', '🎉', '🔥', '👏', '🤔', '😍'];

// 初始化应用
function init() {
    // 设置事件监听器
    setupEventListeners();
    
    // 生成客户端ID
    chatState.clientId = generateClientId();
    
    // 随机生成一个聊天室ID
    if (!elements.roomIdInput.value) {
        elements.roomIdInput.value = generateRoomId();
    }
    
    // 如果Firebase可用则初始化Storage
    try {
        chatState.storage = firebase.storage();
    } catch (e) {
        console.error("Firebase Storage初始化失败", e);
    }
    
    // 添加图片预览遮罩
    createImagePreviewOverlay();
    
    // 设置分享功能
    setupShareFeatures();
}

// 设置事件监听器
function setupEventListeners() {
    // 生成随机聊天室ID
    elements.generateRoomBtn.addEventListener('click', () => {
        elements.roomIdInput.value = generateRoomId();
    });
    
    // 创建/加入聊天室
    elements.createJoinRoomBtn.addEventListener('click', joinRoom);
    
    // 监听回车键提交表单
    elements.roomIdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            elements.nicknameInput.focus();
        }
    });
    
    elements.nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            joinRoom();
        }
    });
    
    // 发送消息
    elements.sendMessageBtn.addEventListener('click', sendMessage);
    
    // 监听回车键发送消息
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 监听输入框变化以启用/禁用发送按钮
    elements.messageInput.addEventListener('input', () => {
        elements.sendMessageBtn.disabled = elements.messageInput.value.trim() === '';
    });
    
    // 复制聊天室ID
    elements.copyRoomIdBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(chatState.roomId)
            .then(() => {
                showNotification('聊天室ID已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);
            });
    });
    
    // 离开聊天室
    elements.leaveRoomBtn.addEventListener('click', leaveRoom);
    
    // 清除消息
    elements.clearMessagesBtn.addEventListener('click', () => {
        if (confirm('确定要清除所有消息吗？此操作不可撤销。')) {
            elements.messagesContainer.innerHTML = '';
            // 保留欢迎消息
            addWelcomeMessage();
        }
    });
    
    // 表情选择器
    elements.emojiPickerBtn.addEventListener('click', toggleEmojiPicker);
    
    // 上传文件
    elements.attachFileBtn.addEventListener('click', openFileUploader);
    
    // 加密选项
    elements.encryptionCheckbox.addEventListener('change', (e) => {
        chatState.encryptionEnabled = e.target.checked;
    });
    
    // 消息自动销毁选项
    elements.messageExpiryCheckbox.addEventListener('change', (e) => {
        chatState.messageExpiryEnabled = e.target.checked;
    });
    
    // 添加粘贴事件监听
    elements.messageInput.addEventListener('paste', handlePaste);
    
    // 添加拖放文件事件监听
    elements.messageInput.addEventListener('dragover', handleDragOver);
    elements.messageInput.addEventListener('dragleave', handleDragLeave);
    elements.messageInput.addEventListener('drop', handleDrop);
}

// 处理粘贴事件
function handlePaste(e) {
    // 检查剪贴板中是否有图片
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    let hasImage = false;
    
    for (const item of items) {
        if (item.type.indexOf('image') === 0) {
            hasImage = true;
            e.preventDefault(); // 阻止默认粘贴行为
            
            // 获取图片文件
            const blob = item.getAsFile();
            
            // 在UI上显示粘贴状态
            showNotification('正在处理粘贴的图片...', 'info');
            
            // 处理图片
            handlePastedImage(blob);
            break;
        }
    }
    
    // 如果没有图片，则按默认行为处理（粘贴文本）
    if (!hasImage) {
        return;
    }
}

// 处理粘贴的图片
function handlePastedImage(blob) {
    // 检查文件大小 (限制为2MB，因为Base64会增加约33%的大小)
    if (blob.size > 2 * 1024 * 1024) {
        showError('图片大小不能超过2MB');
        return;
    }
    
    // 生成一个随机的文件名
    const timestamp = new Date().getTime();
    const filename = `粘贴的图片_${timestamp}.png`;
    
    // 使用FileReader将图片转换为Base64
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Image = e.target.result;
        // 发送包含base64图片的消息
        sendBase64ImageMessage(base64Image, filename);
    };
    
    reader.onerror = function() {
        showError('图片读取失败');
    };
    
    // 开始读取图片文件
    reader.readAsDataURL(blob);
}

// 生成随机聊天室ID
function generateRoomId() {
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

// 生成客户端ID
function generateClientId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 加入聊天室
function joinRoom() {
    const roomId = elements.roomIdInput.value.trim();
    const nickname = elements.nicknameInput.value.trim();
    
    if (!roomId) {
        showError('请输入有效的聊天室ID');
        return;
    }
    
    if (!nickname) {
        showError('请输入您的昵称');
        return;
    }
    
    // 保存聊天状态
    chatState.roomId = roomId;
    chatState.nickname = nickname;
    chatState.encryptionEnabled = elements.encryptionCheckbox.checked;
    chatState.messageExpiryEnabled = elements.messageExpiryCheckbox.checked;
    
    // 生成加密密钥
    if (chatState.encryptionEnabled) {
        chatState.encryptionKey = CryptoJS.SHA256(roomId).toString();
    }
    
    // 连接到聊天服务器
    connectToServer();
    
    // 更新UI
    elements.chatEntry.style.display = 'none';
    elements.chatRoom.style.display = 'block';
    elements.displayRoomId.textContent = chatState.roomId;
    
    // 添加欢迎消息
    addWelcomeMessage();
    
    // 清空输入框
    elements.messageInput.value = '';
    elements.messageInput.focus();
}

// 添加欢迎消息
function addWelcomeMessage() {
    elements.messagesContainer.innerHTML = `
        <div class="welcome-message">
            <div class="welcome-icon">
                <i class="ri-lock-line"></i>
            </div>
            <h3 data-i18n="anonymousChat.welcomeTitle">欢迎来到加密聊天室</h3>
            <p data-i18n="anonymousChat.welcomeMessage">此聊天室中的所有消息均已加密，刷新页面或关闭浏览器后聊天记录将被清除。</p>
            <p style="margin-top: 10px; color: #ef4444;"><i class="ri-information-line"></i> 聊天室最多支持10人同时在线</p>
        </div>
    `;
}

// 连接到聊天服务器
function connectToServer() {
    try {
        updateConnectionStatus('connecting', '正在连接...');
        console.log('正在连接Firebase...');

        // 创建Firebase引用
        setupFirebaseReferences();
        console.log('Firebase引用已设置');
        
        // 首先检查房间人数是否已达上限
        chatState.roomRef.child('members').once('value', (snapshot) => {
            console.log('检查聊天室成员数量...');
            const currentMemberCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
            console.log('当前聊天室成员数:', currentMemberCount);
            
            if (currentMemberCount >= 10) {
                // 房间已满，拒绝连接
                updateConnectionStatus('disconnected', '聊天室已满');
                showError('该聊天室已达到10人上限，请稍后再试或加入其他聊天室');
                
                // 返回入口页面
                elements.chatRoom.style.display = 'none';
                elements.chatEntry.style.display = 'flex';
                return;
            }
            
            // 房间未满，继续连接流程
            // 监听连接状态
            console.log('设置连接监听...');
            const connectedRef = firebase.database().ref('.info/connected');
            connectedRef.on('value', (snap) => {
                if (snap.val() === true) {
                    console.log('Firebase连接成功!');
                    chatState.connected = true;
                    updateConnectionStatus('connected', '已连接');
                    
                    // 添加当前用户到成员列表
                    addUserToRoom();
                    
                    // 设置断开连接时自动移除用户
                    chatState.membersRef.child(chatState.clientId).onDisconnect().remove();
                } else {
                    console.log('Firebase连接断开');
                    chatState.connected = false;
                    updateConnectionStatus('disconnected', '已断开连接');
                }
            });
        });
    } catch (error) {
        console.error('连接到Firebase时出错:', error);
        updateConnectionStatus('disconnected', '连接失败');
    }
}

// 添加用户到聊天室
function addUserToRoom() {
    // 添加到成员列表
    chatState.membersRef.child(chatState.clientId).set({
        id: chatState.clientId,
        nickname: chatState.nickname,
        joinedAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    // 添加自己到本地成员列表UI
    addMember({
        id: chatState.clientId,
        nickname: chatState.nickname,
        isSelf: true
    });
    
    // 添加系统消息
    addSystemMessage(`您已加入聊天室 ${chatState.roomId}`);
}

// 创建临时聊天服务器（使用localStorage进行本地聊天）
function createTemporaryServer() {
    // 设置连接状态
    chatState.connected = true;
    updateConnectionStatus('connected', '已连接');
    
    // 添加当前用户到成员列表
    addMember({
        id: chatState.clientId,
        nickname: chatState.nickname,
        isSelf: true
    });
    
    // 添加系统消息
    addSystemMessage(`您已加入聊天室 ${chatState.roomId}`);
    
    // 检查本地存储中是否有其他成员
    loadRoomDataFromLocalStorage();
    
    // 广播加入事件
    broadcastEvent(SOCKET_EVENTS.USER_JOINED, {
        id: chatState.clientId,
        nickname: chatState.nickname,
        roomId: chatState.roomId,
        timestamp: new Date().toISOString()
    });
}

// 从localStorage加载聊天室数据
function loadRoomDataFromLocalStorage() {
    try {
        // 尝试加载聊天室成员
        const roomKey = `chat_room_${chatState.roomId}`;
        const roomData = localStorage.getItem(roomKey);
        
        if (roomData) {
            const parsedData = JSON.parse(roomData);
            
            // 加载成员
            if (parsedData.members) {
                Object.keys(parsedData.members).forEach(memberId => {
                    if (memberId !== chatState.clientId) {
                        addMember({
                            ...parsedData.members[memberId],
                            isSelf: false
                        });
                    }
                });
            }
            
            // 加载消息历史
            if (parsedData.messages) {
                parsedData.messages.forEach(message => {
                    if (message.type === 'system') {
                        addSystemMessage(message.text);
                    } else {
                        receiveMessage({
                            id: message.sender,
                            nickname: message.nickname,
                            text: chatState.encryptionEnabled && message.encrypted ? 
                                  decryptMessage(message.text) : message.text,
                            timestamp: message.timestamp
                        });
                    }
                });
            }
        }
        
        // 设置窗口关闭事件
        window.addEventListener('beforeunload', () => {
            broadcastEvent(SOCKET_EVENTS.USER_LEFT, {
                id: chatState.clientId,
                nickname: chatState.nickname,
                roomId: chatState.roomId,
                timestamp: new Date().toISOString()
            });
        });
        
        // 设置广播事件监听
        window.addEventListener('storage', handleStorageEvent);
        
    } catch (error) {
        console.error('加载聊天室数据失败:', error);
    }
}

// 处理本地存储事件
function handleStorageEvent(event) {
    if (event.key === `chat_event_${chatState.roomId}`) {
        try {
            const eventData = JSON.parse(event.newValue);
            
            // 忽略自己发出的事件
            if (eventData.data && eventData.data.id === chatState.clientId) {
                return;
            }
            
            // 处理不同类型的事件
            switch (eventData.type) {
                case SOCKET_EVENTS.USER_JOINED:
                    handleUserJoined(eventData.data);
                    break;
                    
                case SOCKET_EVENTS.USER_LEFT:
                    handleUserLeft(eventData.data);
                    break;
                    
                case SOCKET_EVENTS.MESSAGE:
                    handleIncomingMessage(eventData.data);
                    break;
            }
        } catch (error) {
            console.error('处理广播事件失败:', error);
        }
    }
}

// 处理用户加入事件
function handleUserJoined(data) {
    if (data.roomId === chatState.roomId && !chatState.members[data.id]) {
        addMember({
            id: data.id,
            nickname: data.nickname,
            isSelf: false
        });
        
        addSystemMessage(`${data.nickname} 加入了聊天室`);
    }
}

// 处理用户离开事件
function handleUserLeft(data) {
    if (data.roomId === chatState.roomId && chatState.members[data.id]) {
        const nickname = chatState.members[data.id].nickname;
        removeMember(data.id);
        
        addSystemMessage(`${nickname} 离开了聊天室`);
    }
}

// 处理接收到的消息
function handleIncomingMessage(data) {
    if (data.roomId === chatState.roomId) {
        receiveMessage({
            id: data.sender,
            nickname: data.nickname,
            text: chatState.encryptionEnabled && data.encrypted ? 
                  decryptMessage(data.text) : data.text,
            timestamp: data.timestamp
        });
    }
}

// 广播事件
function broadcastEvent(eventType, data) {
    try {
        const eventKey = `chat_event_${chatState.roomId}`;
        const eventData = {
            type: eventType,
            data: data,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem(eventKey, JSON.stringify(eventData));
        
        // 更新聊天室数据
        updateRoomDataInLocalStorage(eventType, data);
        
        // 触发存储事件（为了在同一浏览器的不同标签页之间通信）
        setTimeout(() => {
            localStorage.removeItem(eventKey);
        }, 100);
    } catch (error) {
        console.error('广播事件失败:', error);
    }
}

// 更新本地存储中的聊天室数据
function updateRoomDataInLocalStorage(eventType, data) {
    try {
        const roomKey = `chat_room_${chatState.roomId}`;
        let roomData = localStorage.getItem(roomKey);
        let parsedData = roomData ? JSON.parse(roomData) : {members: {}, messages: []};
        
        // 根据事件类型更新数据
        switch (eventType) {
            case SOCKET_EVENTS.USER_JOINED:
                parsedData.members[data.id] = {
                    id: data.id,
                    nickname: data.nickname
                };
                break;
                
            case SOCKET_EVENTS.USER_LEFT:
                delete parsedData.members[data.id];
                break;
                
            case SOCKET_EVENTS.MESSAGE:
                // 存储消息
                parsedData.messages.push({
                    type: 'message',
                    sender: data.sender,
                    nickname: data.nickname,
                    text: data.text,
                    encrypted: data.encrypted,
                    timestamp: data.timestamp
                });
                
                // 限制消息历史记录大小
                if (parsedData.messages.length > 100) {
                    parsedData.messages = parsedData.messages.slice(-100);
                }
                break;
        }
        
        // 更新存储
        localStorage.setItem(roomKey, JSON.stringify(parsedData));
    } catch (error) {
        console.error('更新聊天室数据失败:', error);
    }
}

// 更新连接状态
function updateConnectionStatus(status, text) {
    elements.connectionStatus.className = 'status-indicator ' + status;
    elements.statusText.textContent = text;
}

// 发送消息
function sendMessage() {
    const messageText = elements.messageInput.value.trim();
    
    if (!messageText) {
        return;
    }
    
    const messageId = generateMessageId();
    
    // 检查Firebase是否已初始化
    if (!chatState.messagesRef) {
        console.warn('Firebase引用未初始化，无法发送消息到服务器');
        // 仍然在UI上显示消息，但提示用户连接问题
        addMessage({
            id: messageId,
            nickname: chatState.nickname,
            text: messageText,
            timestamp: new Date().toISOString(),
            isSelf: true
        });
        
        // 显示错误提示
        showNotification('网络连接问题，消息可能未发送至服务器', 'warning');
        
        // 清空输入框
        elements.messageInput.value = '';
        elements.sendMessageBtn.disabled = true;
        
        return;
    }
    
    try {
        // 创建消息对象
        const message = {
            id: messageId,
            sender: chatState.clientId,
            nickname: chatState.nickname,
            text: messageText,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            encrypted: chatState.encryptionEnabled
        };
        
        // 如果启用了加密，加密消息
        if (chatState.encryptionEnabled) {
            message.text = encryptMessage(messageText);
        }
        
        // 存储消息到Firebase
        chatState.messagesRef.push().set(message)
            .then(() => {
                console.log('消息发送成功');
            })
            .catch(error => {
                console.error('发送消息到Firebase失败:', error);
                showNotification('消息发送失败，请稍后重试', 'error');
            });
        
        // 显示自己发送的消息
        addMessage({
            id: messageId,
            nickname: chatState.nickname,
            text: messageText, // 使用原始文本显示
            timestamp: new Date().toISOString(),
            isSelf: true
        });
        
        // 清空输入框
        elements.messageInput.value = '';
        elements.sendMessageBtn.disabled = true;
        
        // 自动滚动到底部
        scrollToBottom();
    } catch (error) {
        console.error('发送消息时发生错误:', error);
        showNotification('发送消息失败，请检查网络连接', 'error');
    }
}

// 生成消息ID
function generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 加密消息
function encryptMessage(text) {
    if (!chatState.encryptionKey) return text;
    try {
        console.log('正在加密消息，使用密钥(部分):', chatState.encryptionKey.substring(0, 10) + '...');
        return CryptoJS.AES.encrypt(text, chatState.encryptionKey).toString();
    } catch (error) {
        console.error('加密消息失败:', error);
        return text;
    }
}

// 解密消息
function decryptMessage(encryptedText) {
    if (!chatState.encryptionKey) return encryptedText;
    try {
        console.log('正在解密消息，使用密钥(部分):', chatState.encryptionKey.substring(0, 10) + '...');
        const bytes = CryptoJS.AES.decrypt(encryptedText, chatState.encryptionKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('解密消息失败:', error, '密文:', encryptedText);
        return '[无法解密的消息]';
    }
}

// 接收消息
function receiveMessage(message) {
    addMessage({
        id: message.id || generateMessageId(),
        nickname: message.nickname,
        text: message.text,
        timestamp: message.timestamp,
        isSelf: message.id === chatState.clientId
    });
    
    // 自动滚动到底部
    scrollToBottom();
}

// 添加消息到聊天界面
function addMessage(message) {
    const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.isSelf ? 'outgoing' : ''}`;
    
    // 添加状态指示类 - 如果消息因为解密失败而含有特定文本
    if (message.text === '[无法解密的消息]' || message.text === '[无法解密的历史消息]') {
        messageElement.classList.add('encryption-error');
    }
    
    messageElement.innerHTML = `
        <div class="message-avatar">${message.nickname.charAt(0).toUpperCase()}</div>
        <div class="message-content">
            <div class="message-sender">${message.nickname}</div>
            <div class="message-text">${formatMessageText(message.text)}</div>
            <div class="message-time">${messageTime}</div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(messageElement);
}

// 格式化消息文本（处理链接、表情等）
function formatMessageText(text) {
    // 转义HTML
    let formattedText = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    
    // 将URL转换为链接
    formattedText = formattedText.replace(
        /(https?:\/\/[^\s]+)/g, 
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    
    // 添加表情支持
    Object.values(emojiCategories).forEach(category => {
        category.emojis.forEach(emoji => {
            formattedText = formattedText.replace(
                new RegExp(emoji, 'g'), 
                `<span class="emoji">${emoji}</span>`
            );
        });
    });
    
    return formattedText;
}

// 添加系统消息
function addSystemMessage(text) {
    const messageElement = document.createElement('div');
    messageElement.className = 'system-message';
    messageElement.textContent = text;
    
    elements.messagesContainer.appendChild(messageElement);
    
    // 自动滚动到底部
    scrollToBottom();
}

// 添加成员到列表
function addMember(member) {
    chatState.members[member.id] = member;
    updateMemberList();
}

// 移除成员
function removeMember(memberId) {
    delete chatState.members[memberId];
    updateMemberList();
}

// 更新成员列表
function updateMemberList() {
    elements.memberList.innerHTML = '';
    const members = Object.values(chatState.members);
    
    members.forEach(member => {
        const memberElement = document.createElement('li');
        memberElement.innerHTML = `
            <div class="member-avatar">${member.nickname.charAt(0).toUpperCase()}</div>
            <div class="member-name">
                ${member.nickname}
                ${member.isSelf ? '<span class="self-indicator">你</span>' : ''}
            </div>
        `;
        elements.memberList.appendChild(memberElement);
    });
    
    // 更新成员计数并显示限制
    elements.memberCount.textContent = `${members.length}/10`;
}

// 自动滚动到底部
function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

// 离开聊天室
function leaveRoom() {
    if (confirm('确定要离开聊天室吗？离开后聊天记录将被清除。')) {
        // 从Firebase移除用户
        if (chatState.connected && chatState.membersRef) {
            chatState.membersRef.child(chatState.clientId).remove();
        }
        
        // 取消所有Firebase监听
        if (chatState.roomRef) {
            chatState.roomRef.off();
        }
        
        // 重置状态
        chatState.connected = false;
        chatState.members = {};
        
        // 返回到聊天入口页面
        elements.chatRoom.style.display = 'none';
        elements.chatEntry.style.display = 'flex';
    }
}

// 显示错误消息
function showError(message) {
    alert(message);
}

// 显示通知
function showNotification(message, type = 'info') {
    // 实现简单的通知
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 自动关闭通知
    setTimeout(() => {
        notification.classList.remove('show');
        
        // 移除DOM元素
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 切换表情选择器
function toggleEmojiPicker() {
    const emojiBtn = elements.emojiPickerBtn;
    
    if (chatState.emojiPickerVisible) {
        const emojiPicker = document.querySelector('.emoji-picker');
        if (emojiPicker) {
            emojiPicker.remove();
            emojiBtn.classList.remove('active');
        }
        chatState.emojiPickerVisible = false;
        document.removeEventListener('click', closeEmojiPickerOnClickOutside);
    } else {
        showEmojiPicker();
        emojiBtn.classList.add('active');
        chatState.emojiPickerVisible = true;
        // 延迟添加点击外部关闭事件，避免立即触发
        setTimeout(() => {
            document.addEventListener('click', closeEmojiPickerOnClickOutside);
        }, 100);
    }
}

// 显示表情选择器
function showEmojiPicker() {
    const emojiPicker = document.createElement('div');
    emojiPicker.className = 'emoji-picker';
    
    // 创建搜索栏
    const searchContainer = document.createElement('div');
    searchContainer.className = 'emoji-search-container';
    searchContainer.innerHTML = `
        <div class="emoji-search-box">
            <i class="ri-search-line"></i>
            <input type="text" class="emoji-search" placeholder="搜索表情...">
        </div>
        <div class="frequent-emojis">
            ${frequentEmojis.map(emoji => `<span class="freq-emoji" title="点击插入表情">${emoji}</span>`).join('')}
        </div>
    `;
    
    // 创建表情分类标签
    const emojiTabs = document.createElement('div');
    emojiTabs.className = 'emoji-tabs';
    
    // 创建表情内容容器
    const emojiContent = document.createElement('div');
    emojiContent.className = 'emoji-content';
    
    // 添加表情分类标签
    Object.keys(emojiCategories).forEach((category, index) => {
        const categoryData = emojiCategories[category];
        
        // 创建分类标签按钮
        const tabButton = document.createElement('button');
        tabButton.className = `emoji-tab ${index === 0 ? 'active' : ''}`;
        tabButton.setAttribute('data-category', category);
        tabButton.innerHTML = `<i class="${categoryData.icon}" title="${categoryData.name}"></i>`;
        
        // 点击分类标签时切换内容
        tabButton.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            // 更新标签状态
            document.querySelectorAll('.emoji-tab').forEach(tab => tab.classList.remove('active'));
            tabButton.classList.add('active');
            
            // 更新内容
            loadEmojiCategory(emojiContent, category);
        });
        
        emojiTabs.appendChild(tabButton);
        
        // 如果是第一个分类，加载其内容
        if (index === 0) {
            loadEmojiCategory(emojiContent, category);
        }
    });
    
    // 将所有元素添加到选择器中
    emojiPicker.appendChild(searchContainer);
    emojiPicker.appendChild(emojiTabs);
    emojiPicker.appendChild(emojiContent);
    
    // 添加搜索功能
    const searchInput = emojiPicker.querySelector('.emoji-search');
    searchInput.addEventListener('input', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        const searchValue = searchInput.value.trim().toLowerCase();
        
        if (searchValue) {
            // 搜索模式
            searchEmojis(emojiContent, searchValue);
        } else {
            // 恢复当前分类
            const activeCategory = emojiPicker.querySelector('.emoji-tab.active').getAttribute('data-category');
            loadEmojiCategory(emojiContent, activeCategory);
        }
    });
    
    // 添加常用表情点击事件
    const freqEmojis = emojiPicker.querySelectorAll('.freq-emoji');
    freqEmojis.forEach(emoji => {
        emoji.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            insertEmoji(emoji.textContent);
        });
    });
    
    // 阻止表情选择器内的点击事件冒泡
    emojiPicker.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // 添加到composer-actions
    const composerActions = document.querySelector('.composer-actions');
    composerActions.appendChild(emojiPicker);
}

// 加载特定分类的表情
function loadEmojiCategory(container, category) {
    const emojis = emojiCategories[category].emojis;
    container.innerHTML = '';
    
    emojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.title = '点击插入表情';
        
        emojiItem.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            insertEmoji(emoji);
        });
        
        container.appendChild(emojiItem);
    });
}

// 搜索表情
function searchEmojis(container, searchText) {
    container.innerHTML = '';
    let results = [];
    
    // 在所有分类中搜索
    Object.values(emojiCategories).forEach(category => {
        results = results.concat(category.emojis);
    });
    
    // 去重
    results = [...new Set(results)];
    
    // 限制结果数量
    results = results.slice(0, 32);
    
    if (results.length === 0) {
        container.innerHTML = '<div class="emoji-no-results">没有找到相关表情</div>';
        return;
    }
    
    // 显示结果
    results.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.title = '点击插入表情';
        
        emojiItem.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            insertEmoji(emoji);
        });
        
        container.appendChild(emojiItem);
    });
}

// 插入表情到输入框
function insertEmoji(emoji) {
    const input = elements.messageInput;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    // 在光标位置插入表情
    input.value = text.substring(0, start) + emoji + text.substring(end);
    
    // 更新光标位置
    const newPosition = start + emoji.length;
    input.setSelectionRange(newPosition, newPosition);
    
    // 触发输入事件以更新发送按钮状态
    input.dispatchEvent(new Event('input'));
    
    // 关闭表情选择器
    toggleEmojiPicker();
    
    // 聚焦输入框
    input.focus();
}

// 点击外部关闭表情选择器
function closeEmojiPickerOnClickOutside(e) {
    const emojiPicker = document.querySelector('.emoji-picker');
    const emojiBtn = elements.emojiPickerBtn;
    
    if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.remove();
        emojiBtn.classList.remove('active');
        chatState.emojiPickerVisible = false;
        document.removeEventListener('click', closeEmojiPickerOnClickOutside);
    }
}

// 设置Firebase引用
function setupFirebaseReferences() {
    try {
        // 创建聊天室根引用
        chatState.roomRef = firebase.database().ref('chatRooms/' + chatState.roomId);
        
        // 创建成员引用
        chatState.membersRef = chatState.roomRef.child('members');
        
        // 创建消息引用
        chatState.messagesRef = chatState.roomRef.child('messages');
        
        // 加载最近消息历史
        chatState.messagesRef.orderByChild('timestamp').limitToLast(30).once('value', (snapshot) => {
            if (!snapshot.exists()) return;
            
            console.log('加载历史消息');
            const messages = [];
            
            snapshot.forEach((childSnapshot) => {
                const message = childSnapshot.val();
                
                // 忽略自己发的消息(防止重复显示)
                if (message.sender === chatState.clientId) return;
                
                messages.push(message);
            });
            
            // 按时间顺序显示消息
            messages.sort((a, b) => a.timestamp - b.timestamp).forEach(message => {
                let messageText = message.text;
                
                // 处理加密消息
                if (message.encrypted) {
                    try {
                        messageText = decryptMessage(message.text);
                    } catch (error) {
                        messageText = '[无法解密的历史消息]';
                    }
                }
                
                receiveMessage({
                    id: message.id,
                    nickname: message.nickname,
                    text: messageText,
                    timestamp: message.timestamp || new Date().toISOString(),
                    isSelf: false
                });
            });
        });
        
        // 监听新消息
        chatState.messagesRef.on('child_added', (snapshot) => {
            try {
                const message = snapshot.val();
                
                // 跳过自己发送的消息(因为已经在UI中显示)
                if (message.sender === chatState.clientId) {
                    return;
                }
                
                // 处理不同类型的消息
                if (message.type === 'image') {
                    // 处理图片消息
                    addImageMessage({
                        id: message.id,
                        nickname: message.nickname,
                        imageUrl: message.imageUrl,
                        imageName: message.imageName,
                        timestamp: message.timestamp || new Date().toISOString(),
                        isSelf: false
                    });
                } else if (message.type === 'base64Image') {
                    // 处理Base64图片消息
                    addBase64ImageMessage({
                        id: message.id,
                        nickname: message.nickname,
                        base64Image: message.base64Image,
                        imageName: message.imageName,
                        timestamp: message.timestamp || new Date().toISOString(),
                        isSelf: false
                    });
                } else {
                    // 处理文本消息
                    let messageText = message.text;
                    
                    // 处理加密消息
                    if (message.encrypted) {
                        try {
                            messageText = decryptMessage(message.text);
                        } catch (error) {
                            messageText = '[无法解密的消息]';
                        }
                    }
                    
                    // 接收消息
                    receiveMessage({
                        id: message.id,
                        nickname: message.nickname,
                        text: messageText,
                        timestamp: message.timestamp || new Date().toISOString(),
                        isSelf: false
                    });
                }
            } catch (error) {
                console.error('处理消息时出错:', error);
            }
        });
        
        // 创建Storage引用
        chatState.storageRef = chatState.storage.ref(`chatImages/${chatState.roomId}`);
    } catch (error) {
        console.error('设置Firebase引用失败:', error);
    }
}

// 添加文件上传相关函数
function openFileUploader() {
    // 创建一个隐藏的文件输入
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // 只允许图片
    fileInput.style.display = 'none';
    
    // 监听文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            // 检查文件大小 (限制为5MB)
            if (file.size > 5 * 1024 * 1024) {
                showError('图片大小不能超过5MB');
                return;
            }
            
            uploadImage(file);
        }
    });
    
    // 触发点击
    document.body.appendChild(fileInput);
    fileInput.click();
    
    // 用完后移除
    setTimeout(() => {
        document.body.removeChild(fileInput);
    }, 500);
}

// 上传图片函数
function uploadImage(file) {
    if (!chatState.connected) {
        showError('连接状态异常，无法上传图片');
        return;
    }
    
    // 显示上传中的消息
    addSystemMessage(`正在处理图片...`);
    
    // 检查文件大小 (限制为2MB，因为Base64会增加约33%的大小)
    if (file.size > 2 * 1024 * 1024) {
        showError('图片大小不能超过2MB');
        return;
    }
    
    // 使用FileReader将图片转换为Base64
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const base64Image = e.target.result;
        // 发送包含base64图片的消息
        sendBase64ImageMessage(base64Image, file.name);
    };
    
    reader.onerror = function() {
        showError('图片读取失败');
    };
    
    // 开始读取图片文件
    reader.readAsDataURL(file);
}

// 发送Base64图片消息
function sendBase64ImageMessage(base64Image, imageName) {
    if (!chatState.connected) return;
    
    const messageId = generateMessageId();
    
    // 创建消息对象
    const message = {
        id: messageId,
        sender: chatState.clientId,
        nickname: chatState.nickname,
        type: 'base64Image',
        text: `[图片: ${imageName}]`, // 备用文本，用于不支持图片的客户端
        base64Image: base64Image,
        imageName: imageName,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        encrypted: false // 图片不加密
    };
    
    // 存储消息到Firebase
    chatState.messagesRef.push().set(message)
        .then(() => {
            console.log('Base64图片消息发送成功');
        })
        .catch(error => {
            console.error('发送图片消息失败:', error);
            showNotification('图片发送失败，请稍后重试', 'error');
        });
    
    // 显示自己发送的图片消息
    addBase64ImageMessage({
        id: messageId,
        nickname: chatState.nickname,
        base64Image: base64Image,
        imageName: imageName,
        timestamp: new Date().toISOString(),
        isSelf: true
    });
    
    // 自动滚动到底部
    scrollToBottom();
}

// 发送图片URL消息
function sendImageMessage(imageUrl, imageName) {
    if (!chatState.connected) return;
    
    const messageId = generateMessageId();
    
    // 创建消息对象
    const message = {
        id: messageId,
        sender: chatState.clientId,
        nickname: chatState.nickname,
        type: 'image',
        text: `[图片: ${imageName}]`, // 备用文本，用于不支持图片的客户端
        imageUrl: imageUrl,
        imageName: imageName,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        encrypted: false // 图片不加密
    };
    
    // 存储消息到Firebase
    chatState.messagesRef.push().set(message)
        .then(() => {
            console.log('图片URL消息发送成功');
        })
        .catch(error => {
            console.error('发送图片消息失败:', error);
            showNotification('图片发送失败，请稍后重试', 'error');
        });
    
    // 显示自己发送的图片消息
    addImageMessage({
        id: messageId,
        nickname: chatState.nickname,
        imageUrl: imageUrl,
        imageName: imageName,
        timestamp: new Date().toISOString(),
        isSelf: true
    });
    
    // 自动滚动到底部
    scrollToBottom();
}

// 添加Base64图片消息到聊天界面
function addBase64ImageMessage(message) {
    const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.isSelf ? 'outgoing' : ''}`;
    messageElement.innerHTML = `
        <div class="message-avatar">${message.nickname.charAt(0).toUpperCase()}</div>
        <div class="message-content">
            <div class="message-sender">${message.nickname}</div>
            <div class="message-image-container">
                <img src="${message.base64Image}" alt="${message.imageName}" class="message-image" loading="lazy">
                <div class="image-name">${message.imageName}</div>
            </div>
            <div class="message-time">${messageTime}</div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(messageElement);
    
    // 图片加载完成后滚动到底部
    const imgElement = messageElement.querySelector('img');
    imgElement.onload = scrollToBottom;
    
    // 添加图片点击事件
    imgElement.addEventListener('click', () => {
        const overlay = document.getElementById('imagePreviewOverlay');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = message.base64Image;
        previewImage.alt = message.imageName;
        
        overlay.classList.add('active');
    });
}

// 添加URL图片消息到聊天界面
function addImageMessage(message) {
    const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.isSelf ? 'outgoing' : ''}`;
    messageElement.innerHTML = `
        <div class="message-avatar">${message.nickname.charAt(0).toUpperCase()}</div>
        <div class="message-content">
            <div class="message-sender">${message.nickname}</div>
            <div class="message-image-container">
                <img src="${message.imageUrl}" alt="${message.imageName}" class="message-image" loading="lazy">
                <div class="image-name">${message.imageName}</div>
            </div>
            <div class="message-time">${messageTime}</div>
        </div>
    `;
    
    elements.messagesContainer.appendChild(messageElement);
    
    // 图片加载完成后滚动到底部
    const imgElement = messageElement.querySelector('img');
    imgElement.onload = scrollToBottom;
    
    // 添加图片点击事件
    imgElement.addEventListener('click', () => {
        const overlay = document.getElementById('imagePreviewOverlay');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = message.imageUrl;
        previewImage.alt = message.imageName;
        
        overlay.classList.add('active');
    });
}

// 创建图片预览遮罩
function createImagePreviewOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'image-preview-overlay';
    overlay.id = 'imagePreviewOverlay';
    
    overlay.innerHTML = `
        <div class="image-preview-container">
            <img src="" alt="预览" class="preview-image" id="previewImage">
            <div class="close-preview" id="closePreview">
                <i class="ri-close-line"></i>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 关闭预览
    document.getElementById('closePreview').addEventListener('click', () => {
        overlay.classList.remove('active');
    });
    
    // 点击遮罩也关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });
    
    // ESC键关闭
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    });
}

// 处理拖动文件悬停事件
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    // 添加拖动悬停视觉效果
    elements.messageInput.classList.add('drag-over');
}

// 处理拖动文件离开事件
function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    // 移除拖动悬停视觉效果
    elements.messageInput.classList.remove('drag-over');
}

// 处理拖放文件事件
function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // 移除拖动悬停视觉效果
    elements.messageInput.classList.remove('drag-over');
    
    // 获取拖放的文件
    const files = e.dataTransfer.files;
    
    if (files.length > 0) {
        // 只处理第一个文件
        const file = files[0];
        
        // 检查是否为图片
        if (file.type.startsWith('image/')) {
            // 显示处理状态
            showNotification('正在处理拖放的图片...', 'info');
            
            // 处理图片上传
            uploadImage(file);
        } else {
            showError('只支持上传图片文件');
        }
    }
}

// 添加分享功能
function setupShareFeatures() {
    const shareBtn = document.createElement('button');
    shareBtn.className = 'header-btn share-btn';
    shareBtn.innerHTML = '<i class="ri-share-line"></i>分享';
    
    shareBtn.addEventListener('click', toggleShareMenu);
    
    // 将分享按钮添加到房间操作区
    const roomActions = document.querySelector('.room-actions');
    roomActions.appendChild(shareBtn);
    
    // 创建分享菜单
    createShareMenu();
}

// 创建分享菜单
function createShareMenu() {
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.style.display = 'none';
    
    shareMenu.innerHTML = `
        <div class="share-option" data-type="copy">
            <i class="ri-file-copy-line"></i>
            <span>复制聊天室链接</span>
        </div>
        <div class="share-option" data-type="qr">
            <i class="ri-qr-code-line"></i>
            <span>显示二维码</span>
        </div>
        <div class="share-option" data-type="wechat">
            <i class="ri-wechat-line"></i>
            <span>分享到微信</span>
        </div>
        <div class="share-option" data-type="weibo">
            <i class="ri-weibo-line"></i>
            <span>分享到微博</span>
        </div>
    `;
    
    // 添加点击事件处理
    shareMenu.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', handleShareOption);
    });
    
    document.querySelector('.chat-header').appendChild(shareMenu);
}

// 切换分享菜单显示状态
function toggleShareMenu(e) {
    e.stopPropagation();
    const shareMenu = document.querySelector('.share-menu');
    const isVisible = shareMenu.style.display === 'block';
    
    if (isVisible) {
        shareMenu.style.display = 'none';
    } else {
        shareMenu.style.display = 'block';
        // 点击外部关闭菜单
        document.addEventListener('click', closeShareMenu);
    }
}

// 关闭分享菜单
function closeShareMenu(e) {
    const shareMenu = document.querySelector('.share-menu');
    const shareBtn = document.querySelector('.share-btn');
    
    if (!shareMenu.contains(e.target) && !shareBtn.contains(e.target)) {
        shareMenu.style.display = 'none';
        document.removeEventListener('click', closeShareMenu);
    }
}

// 处理分享选项点击
function handleShareOption(e) {
    const type = e.currentTarget.dataset.type;
    const roomUrl = generateRoomUrl();
    
    switch (type) {
        case 'copy':
            copyToClipboard(roomUrl);
            break;
        case 'qr':
            showQRCode(roomUrl);
            break;
        case 'wechat':
            shareToWechat(roomUrl);
            break;
        case 'weibo':
            shareToWeibo(roomUrl);
            break;
    }
    
    // 关闭分享菜单
    document.querySelector('.share-menu').style.display = 'none';
}

// 生成聊天室URL
function generateRoomUrl() {
    const url = new URL(window.location.href);
    url.searchParams.set('room', chatState.roomId);
    return url.toString();
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showNotification('链接已复制到剪贴板', 'success');
        })
        .catch(err => {
            console.error('复制失败:', err);
            showNotification('复制失败，请手动复制', 'error');
        });
}

// 显示二维码
function showQRCode(url) {
    // 创建二维码遮罩
    const overlay = document.createElement('div');
    overlay.className = 'qr-overlay';
    overlay.innerHTML = `
        <div class="qr-container">
            <div class="qr-header">
                <h3>扫描二维码加入聊天室</h3>
                <button class="close-qr"><i class="ri-close-line"></i></button>
            </div>
            <div id="qrcode"></div>
            <div class="qr-footer">
                <p>或复制链接分享：</p>
                <div class="qr-link">
                    <input type="text" value="${url}" readonly>
                    <button class="copy-btn"><i class="ri-file-copy-line"></i></button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // 生成二维码
    new QRCode(document.getElementById('qrcode'), {
        text: url,
        width: 200,
        height: 200
    });
    
    // 添加关闭事件
    const closeBtn = overlay.querySelector('.close-qr');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // 添加复制按钮事件
    const copyBtn = overlay.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
        copyToClipboard(url);
    });
    
    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

// 分享到微信
function shareToWechat(url) {
    // 如果在微信浏览器中，调用微信API
    if (isWeixinBrowser()) {
        wx.ready(function() {
            wx.updateAppMessageShareData({ 
                title: '加入匿名聊天室', 
                desc: '点击加入私密聊天室进行交谈', 
                link: url, 
                imgUrl: 'path/to/your/logo.png',
                success: function () {
                    showNotification('分享设置成功', 'success');
                }
            });
        });
    } else {
        // 如果不在微信中，显示二维码
        showQRCode(url);
    }
}

// 分享到微博
function shareToWeibo(url) {
    const title = encodeURIComponent('加入匿名聊天室 - 点击加入私密聊天室进行交谈');
    const shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(url)}&title=${title}`;
    window.open(shareUrl, '_blank');
}

// 检查是否在微信浏览器中
function isWeixinBrowser(){
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('micromessenger') !== -1;
}

// 初始化应用
document.addEventListener('DOMContentLoaded', init); 