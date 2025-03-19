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
    
    if (!messageText || !chatState.connected) {
        return;
    }
    
    const messageId = generateMessageId();
    
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
    chatState.messagesRef.push().set(message);
    
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
function showNotification(message) {
    // 实现简单的通知
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// 切换表情选择器
function toggleEmojiPicker() {
    if (chatState.emojiPickerVisible) {
        const emojiPicker = document.querySelector('.emoji-picker');
        if (emojiPicker) {
            emojiPicker.remove();
        }
        chatState.emojiPickerVisible = false;
    } else {
        showEmojiPicker();
        chatState.emojiPickerVisible = true;
    }
}

// 显示表情选择器
function showEmojiPicker() {
    const emojiPicker = document.createElement('div');
    emojiPicker.className = 'emoji-picker';
    
    // 创建表情分类标签
    const emojiTabs = document.createElement('div');
    emojiTabs.className = 'emoji-tabs';
    
    // 创建表情内容容器
    const emojiContent = document.createElement('div');
    emojiContent.className = 'emoji-content';
    
    // 创建搜索栏
    const searchContainer = document.createElement('div');
    searchContainer.className = 'emoji-search-container';
    searchContainer.innerHTML = `
        <div class="emoji-search-box">
            <i class="ri-search-line"></i>
            <input type="text" class="emoji-search" placeholder="搜索表情...">
        </div>
        <div class="frequent-emojis">
            ${frequentEmojis.map(emoji => `<span class="freq-emoji">${emoji}</span>`).join('')}
        </div>
    `;
    
    // 将搜索栏添加到选择器
    emojiPicker.appendChild(searchContainer);
    
    // 添加表情分类标签
    let isFirst = true;
    Object.keys(emojiCategories).forEach(category => {
        const categoryData = emojiCategories[category];
        
        // 创建分类标签按钮
        const tabButton = document.createElement('button');
        tabButton.className = `emoji-tab ${isFirst ? 'active' : ''}`;
        tabButton.setAttribute('data-category', category);
        tabButton.innerHTML = `<i class="${categoryData.icon}"></i>`;
        tabButton.title = categoryData.name;
        
        // 点击分类标签时切换内容
        tabButton.addEventListener('click', () => {
            // 更新标签状态
            document.querySelectorAll('.emoji-tab').forEach(tab => tab.classList.remove('active'));
            tabButton.classList.add('active');
            
            // 更新内容
            loadEmojiCategory(emojiContent, category);
        });
        
        emojiTabs.appendChild(tabButton);
        
        // 如果是第一个分类，加载其内容
        if (isFirst) {
            loadEmojiCategory(emojiContent, category);
            isFirst = false;
        }
    });
    
    // 添加分类标签和内容到选择器
    emojiPicker.appendChild(emojiTabs);
    emojiPicker.appendChild(emojiContent);
    
    // 搜索功能
    const searchInput = emojiPicker.querySelector('.emoji-search');
    searchInput.addEventListener('input', () => {
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
    
    // 常用表情点击
    const freqEmojis = emojiPicker.querySelectorAll('.freq-emoji');
    freqEmojis.forEach(emoji => {
        emoji.addEventListener('click', () => {
            insertEmoji(emoji.textContent);
        });
    });
    
    const composerActions = document.querySelector('.composer-actions');
    composerActions.appendChild(emojiPicker);
    
    // 点击外部关闭表情选择器
    document.addEventListener('click', closeEmojiPickerOnClickOutside);
}

// 加载特定分类的表情
function loadEmojiCategory(container, category) {
    const emojis = emojiCategories[category].emojis;
    container.innerHTML = '';
    
    emojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.addEventListener('click', () => {
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
    Object.keys(emojiCategories).forEach(category => {
        const emojis = emojiCategories[category].emojis;
        
        // 简单的模糊匹配（实际应用中可以使用更复杂的搜索算法）
        emojis.forEach(emoji => {
            if (results.includes(emoji)) return; // 避免重复
            results.push(emoji);
        });
    });
    
    // 限制结果数量
    results = results.slice(0, 30);
    
    if (results.length === 0) {
        container.innerHTML = '<div class="emoji-no-results">没有找到相关表情</div>';
        return;
    }
    
    // 显示结果
    results.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.addEventListener('click', () => {
            insertEmoji(emoji);
        });
        
        container.appendChild(emojiItem);
    });
}

// 插入表情到输入框
function insertEmoji(emoji) {
    elements.messageInput.value += emoji;
    elements.messageInput.focus();
    elements.sendMessageBtn.disabled = false;
    toggleEmojiPicker();
}

// 点击外部关闭表情选择器
function closeEmojiPickerOnClickOutside(e) {
    const emojiPicker = document.querySelector('.emoji-picker');
    const emojiBtn = elements.emojiPickerBtn;
    
    if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.remove();
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
    if (!chatState.connected || !chatState.storageRef) {
        showError('连接状态异常，无法上传图片');
        return;
    }
    
    // 显示上传中的消息
    const loadingMessageId = Date.now().toString();
    addSystemMessage(`正在上传图片...`);
    
    // 创建一个唯一文件名
    const fileName = `${Date.now()}_${chatState.clientId}_${file.name}`;
    const fileRef = chatState.storageRef.child(fileName);
    
    // 上传文件
    const uploadTask = fileRef.put(file);
    
    // 监听上传状态
    uploadTask.on('state_changed', 
        // 进度处理
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('上传进度: ' + progress.toFixed(2) + '%');
        },
        // 错误处理
        (error) => {
            console.error('图片上传失败:', error);
            showError('图片上传失败');
        },
        // 上传完成处理
        () => {
            // 获取图片URL
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                // 发送图片消息
                sendImageMessage(downloadURL, file.name);
            });
        }
    );
}

// 发送图片消息
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
    chatState.messagesRef.push().set(message);
    
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

// 添加图片消息到聊天界面
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

// 初始化应用
document.addEventListener('DOMContentLoaded', init); 