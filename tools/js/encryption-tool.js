document.addEventListener('DOMContentLoaded', function() {
    // 选项卡切换
    const tabs = document.querySelectorAll('.tool-tab');
    const tabContents = document.querySelectorAll('.tool-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 加密相关元素
    const encryptAlgorithm = document.getElementById('encrypt-algorithm');
    const encryptKey = document.getElementById('encrypt-key');
    const caesarShift = document.getElementById('caesar-shift');
    const caesarShiftContainer = document.getElementById('caesar-shift-container');
    const encryptKeyContainer = document.getElementById('encrypt-key-container');
    const plaintext = document.getElementById('plaintext');
    const encryptedResult = document.getElementById('encrypted-result');
    const encryptBtn = document.getElementById('encrypt-btn');
    const clearEncryptBtn = document.getElementById('clear-encrypt');
    const generateKeyBtn = document.getElementById('generate-key');
    const copyEncryptedBtn = document.getElementById('copy-encrypted-result');
    
    // 解密相关元素
    const decryptAlgorithm = document.getElementById('decrypt-algorithm');
    const decryptKey = document.getElementById('decrypt-key');
    const decryptCaesarShift = document.getElementById('decrypt-caesar-shift');
    const decryptCaesarShiftContainer = document.getElementById('decrypt-caesar-shift-container');
    const decryptKeyContainer = document.getElementById('decrypt-key-container');
    const ciphertext = document.getElementById('ciphertext');
    const decryptedResult = document.getElementById('decrypted-result');
    const decryptBtn = document.getElementById('decrypt-btn');
    const clearDecryptBtn = document.getElementById('clear-decrypt');
    const copyDecryptedBtn = document.getElementById('copy-decrypted-result');
    
    // 哈希相关元素
    const hashInput = document.getElementById('hash-input');
    const hashAlgorithm = document.getElementById('hash-algorithm');
    const hashBtn = document.getElementById('hash-btn');
    const clearHashBtn = document.getElementById('clear-hash');
    const hashResult = document.getElementById('hash-result');
    const hashResultLabel = document.getElementById('hash-result-label');
    const copyHashBtn = document.getElementById('copy-hash-result');
    
    // 算法选择变化处理
    encryptAlgorithm.addEventListener('change', function() {
        toggleKeyVisibility(this.value, encryptKeyContainer, caesarShiftContainer);
    });
    
    decryptAlgorithm.addEventListener('change', function() {
        toggleKeyVisibility(this.value, decryptKeyContainer, decryptCaesarShiftContainer);
    });
    
    function toggleKeyVisibility(algorithm, keyContainer, shiftContainer) {
        if (algorithm === 'caesar') {
            keyContainer.style.display = 'none';
            shiftContainer.style.display = 'block';
        } else if (algorithm === 'base64') {
            keyContainer.style.display = 'none';
            shiftContainer.style.display = 'none';
        } else {
            keyContainer.style.display = 'block';
            shiftContainer.style.display = 'none';
        }
    }
    
    // 生成随机密钥
    generateKeyBtn.addEventListener('click', function() {
        const algorithm = encryptAlgorithm.value;
        let keyLength = 16; // 默认长度
        
        switch (algorithm) {
            case 'aes':
                keyLength = 16; // 128位
                break;
            case 'des':
                keyLength = 8; // 64位
                break;
            case 'rabbit':
            case 'rc4':
                keyLength = 16;
                break;
        }
        
        const key = generateRandomKey(keyLength);
        encryptKey.value = key;
        encryptKey.classList.add('highlight-animation');
        
        setTimeout(() => {
            encryptKey.classList.remove('highlight-animation');
        }, 1500);
        
        // 自动同步到解密密钥
        decryptKey.value = key;
    });
    
    // 生成指定长度的随机密钥
    function generateRandomKey(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    
    // 加密按钮点击事件
    encryptBtn.addEventListener('click', function() {
        const text = plaintext.value.trim();
        if (!text) {
            showToast('请输入需要加密的文本');
            return;
        }
        
        const algorithm = encryptAlgorithm.value;
        let encrypted = '';
        
        try {
            switch (algorithm) {
                case 'aes':
                    if (!encryptKey.value) {
                        showToast('请输入AES加密密钥');
                        return;
                    }
                    encrypted = CryptoJS.AES.encrypt(text, encryptKey.value).toString();
                    break;
                case 'des':
                    if (!encryptKey.value) {
                        showToast('请输入DES加密密钥');
                        return;
                    }
                    encrypted = CryptoJS.DES.encrypt(text, encryptKey.value).toString();
                    break;
                case 'rabbit':
                    if (!encryptKey.value) {
                        showToast('请输入Rabbit加密密钥');
                        return;
                    }
                    encrypted = CryptoJS.Rabbit.encrypt(text, encryptKey.value).toString();
                    break;
                case 'rc4':
                    if (!encryptKey.value) {
                        showToast('请输入RC4加密密钥');
                        return;
                    }
                    encrypted = CryptoJS.RC4.encrypt(text, encryptKey.value).toString();
                    break;
                case 'base64':
                    encrypted = btoa(unescape(encodeURIComponent(text)));
                    break;
                case 'caesar':
                    const shift = parseInt(caesarShift.value);
                    encrypted = caesarEncrypt(text, shift);
                    break;
            }
            
            encryptedResult.value = encrypted;
            showToast('加密成功');
        } catch (error) {
            showToast('加密失败: ' + error.message);
            console.error(error);
        }
    });
    
    // 解密按钮点击事件
    decryptBtn.addEventListener('click', function() {
        const text = ciphertext.value.trim();
        if (!text) {
            showToast('请输入需要解密的文本');
            return;
        }
        
        const algorithm = decryptAlgorithm.value;
        let decrypted = '';
        
        try {
            switch (algorithm) {
                case 'aes':
                    if (!decryptKey.value) {
                        showToast('请输入AES解密密钥');
                        return;
                    }
                    const bytes = CryptoJS.AES.decrypt(text, decryptKey.value);
                    decrypted = bytes.toString(CryptoJS.enc.Utf8);
                    break;
                case 'des':
                    if (!decryptKey.value) {
                        showToast('请输入DES解密密钥');
                        return;
                    }
                    const desBytes = CryptoJS.DES.decrypt(text, decryptKey.value);
                    decrypted = desBytes.toString(CryptoJS.enc.Utf8);
                    break;
                case 'rabbit':
                    if (!decryptKey.value) {
                        showToast('请输入Rabbit解密密钥');
                        return;
                    }
                    const rabbitBytes = CryptoJS.Rabbit.decrypt(text, decryptKey.value);
                    decrypted = rabbitBytes.toString(CryptoJS.enc.Utf8);
                    break;
                case 'rc4':
                    if (!decryptKey.value) {
                        showToast('请输入RC4解密密钥');
                        return;
                    }
                    const rc4Bytes = CryptoJS.RC4.decrypt(text, decryptKey.value);
                    decrypted = rc4Bytes.toString(CryptoJS.enc.Utf8);
                    break;
                case 'base64':
                    try {
                        decrypted = decodeURIComponent(escape(atob(text)));
                    } catch (e) {
                        throw new Error('无效的Base64编码');
                    }
                    break;
                case 'caesar':
                    const shift = parseInt(decryptCaesarShift.value);
                    decrypted = caesarDecrypt(text, shift);
                    break;
            }
            
            if (!decrypted && algorithm !== 'base64' && algorithm !== 'caesar') {
                throw new Error('解密结果为空，可能是密钥错误');
            }
            
            decryptedResult.value = decrypted;
            showToast('解密成功');
        } catch (error) {
            showToast('解密失败: ' + error.message);
            console.error(error);
        }
    });
    
    // 哈希计算按钮点击事件
    hashBtn.addEventListener('click', function() {
        const text = hashInput.value.trim();
        if (!text) {
            showToast('请输入需要计算哈希的文本');
            return;
        }
        
        const algorithm = hashAlgorithm.value;
        let hashValue = '';
        
        try {
            switch (algorithm) {
                case 'md5':
                    hashValue = CryptoJS.MD5(text).toString();
                    break;
                case 'sha1':
                    hashValue = CryptoJS.SHA1(text).toString();
                    break;
                case 'sha256':
                    hashValue = CryptoJS.SHA256(text).toString();
                    break;
                case 'sha512':
                    hashValue = CryptoJS.SHA512(text).toString();
                    break;
                case 'sha3':
                    hashValue = CryptoJS.SHA3(text).toString();
                    break;
                case 'ripemd160':
                    hashValue = CryptoJS.RIPEMD160(text).toString();
                    break;
            }
            
            hashResult.textContent = hashValue;
            hashResultLabel.textContent = `${algorithm.toUpperCase()} 哈希值`;
            showToast('哈希计算成功');
        } catch (error) {
            showToast('哈希计算失败: ' + error.message);
            console.error(error);
        }
    });
    
    // 清空按钮事件
    clearEncryptBtn.addEventListener('click', function() {
        plaintext.value = '';
        encryptedResult.value = '';
        showToast('已清空');
    });
    
    clearDecryptBtn.addEventListener('click', function() {
        ciphertext.value = '';
        decryptedResult.value = '';
        showToast('已清空');
    });
    
    clearHashBtn.addEventListener('click', function() {
        hashInput.value = '';
        hashResult.textContent = '';
        showToast('已清空');
    });
    
    // 复制按钮事件
    copyEncryptedBtn.addEventListener('click', function() {
        copyToClipboard(encryptedResult.value);
    });
    
    copyDecryptedBtn.addEventListener('click', function() {
        copyToClipboard(decryptedResult.value);
    });
    
    copyHashBtn.addEventListener('click', function() {
        copyToClipboard(hashResult.textContent);
    });
    
    // 复制到剪贴板函数
    function copyToClipboard(text) {
        if (!text) {
            showToast('没有内容可复制');
            return;
        }
        
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successful) {
                showToast('已复制到剪贴板');
            } else {
                showToast('复制失败');
            }
        } catch (err) {
            document.body.removeChild(textarea);
            showToast('复制失败: ' + err);
        }
    }
    
    // 凯撒密码加密函数
    function caesarEncrypt(text, shift) {
        return text.split('').map(char => {
            if (char.match(/[a-z]/i)) {
                const code = char.charCodeAt(0);
                
                // 大写字母
                if (code >= 65 && code <= 90) {
                    return String.fromCharCode(((code - 65 + shift) % 26) + 65);
                }
                
                // 小写字母
                else if (code >= 97 && code <= 122) {
                    return String.fromCharCode(((code - 97 + shift) % 26) + 97);
                }
            }
            return char;
        }).join('');
    }
    
    // 凯撒密码解密函数
    function caesarDecrypt(text, shift) {
        return caesarEncrypt(text, 26 - shift);
    }
    
    // 提示消息函数
    function showToast(message) {
        let toast = document.getElementById('custom-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'custom-toast';
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = 'rgba(74, 108, 247, 0.9)';
            toast.style.color = 'white';
            toast.style.padding = '12px 25px';
            toast.style.borderRadius = '8px';
            toast.style.zIndex = '1000';
            toast.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
            toast.style.transition = 'opacity 0.3s ease';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.style.opacity = '1';
        
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }
    
    // 初始化显示/隐藏密钥输入框
    toggleKeyVisibility(encryptAlgorithm.value, encryptKeyContainer, caesarShiftContainer);
    toggleKeyVisibility(decryptAlgorithm.value, decryptKeyContainer, decryptCaesarShiftContainer);
    
    // 设置哈希算法标签
    hashAlgorithm.addEventListener('change', function() {
        hashResultLabel.textContent = `${this.value.toUpperCase()} 哈希值`;
    });
}); 