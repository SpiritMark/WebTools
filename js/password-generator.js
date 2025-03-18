/**
 * 随机密码生成器脚本
 * 实现密码生成、密码强度检测、复制等功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const passwordLengthSlider = document.getElementById('passwordLength');
    const lengthValue = document.getElementById('lengthValue');
    const uppercaseCharsCheckbox = document.getElementById('uppercaseChars');
    const lowercaseCharsCheckbox = document.getElementById('lowercaseChars');
    const numberCharsCheckbox = document.getElementById('numberChars');
    const symbolCharsCheckbox = document.getElementById('symbolChars');
    const excludeSimilarCharsCheckbox = document.getElementById('excludeSimilarChars');
    const excludeAmbiguousCharsCheckbox = document.getElementById('excludeAmbiguousChars');
    const requireOneOfEachCheckbox = document.getElementById('requireOneOfEach');
    const generatePasswordBtn = document.getElementById('generatePasswordBtn');
    const refreshPasswordBtn = document.getElementById('refreshPasswordBtn');
    const passwordOutput = document.getElementById('passwordOutput');
    const copyPasswordBtn = document.getElementById('copyPasswordBtn');
    const copyNotification = document.getElementById('copyNotification');
    const clearPasswordBtn = document.getElementById('clearPasswordBtn');
    const savePasswordBtn = document.getElementById('savePasswordBtn');
    const strengthLabel = document.getElementById('strengthLabel');
    const strengthBar = document.getElementById('strengthBar');
    
    // 字符集定义
    const charSets = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+{}[]|:;<>,.?/~`-='
    };
    
    const similarChars = 'iIlL1oO0';
    const ambiguousChars = '{}[]()/\\\'"`~,;:.<>';
    
    // 密码历史记录
    let passwordHistory = loadPasswordHistory();
    
    // 初始化密码长度显示
    updateLengthValue();
    
    // 事件监听器
    passwordLengthSlider.addEventListener('input', updateLengthValue);
    generatePasswordBtn.addEventListener('click', generatePassword);
    refreshPasswordBtn.addEventListener('click', generatePassword);
    copyPasswordBtn.addEventListener('click', copyPasswordToClipboard);
    clearPasswordBtn.addEventListener('click', clearPassword);
    savePasswordBtn.addEventListener('click', savePasswordToHistory);
    
    // 至少选中一个字符集
    [uppercaseCharsCheckbox, lowercaseCharsCheckbox, numberCharsCheckbox, symbolCharsCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            ensureAtLeastOneSelected(checkbox);
        });
    });
    
    // 密码变化时更新保存按钮状态
    passwordOutput.addEventListener('input', function() {
        savePasswordBtn.disabled = !passwordOutput.value;
    });
    
    // 创建密码历史模态框
    createPasswordHistoryModal();
    
    // 初始生成一个密码
    generatePassword();
    
    /**
     * 更新密码长度显示
     */
    function updateLengthValue() {
        lengthValue.textContent = passwordLengthSlider.value;
    }
    
    /**
     * 确保至少有一个字符类型被选中
     */
    function ensureAtLeastOneSelected(changedCheckbox) {
        const allChecked = [
            uppercaseCharsCheckbox.checked,
            lowercaseCharsCheckbox.checked,
            numberCharsCheckbox.checked,
            symbolCharsCheckbox.checked
        ];
        
        // 如果当前没有任何选项被选中，则重新选中刚刚被取消选中的选项
        if (!allChecked.includes(true)) {
            changedCheckbox.checked = true;
        }
    }
    
    /**
     * 生成随机密码
     */
    function generatePassword() {
        const length = passwordLengthSlider.value;
        let charset = '';
        const requiredChars = [];
        
        // 构建字符集
        if (uppercaseCharsCheckbox.checked) {
            charset += getFilteredCharset(charSets.uppercase);
            if (requireOneOfEachCheckbox.checked) {
                requiredChars.push(getRandomChar(getFilteredCharset(charSets.uppercase)));
            }
        }
        
        if (lowercaseCharsCheckbox.checked) {
            charset += getFilteredCharset(charSets.lowercase);
            if (requireOneOfEachCheckbox.checked) {
                requiredChars.push(getRandomChar(getFilteredCharset(charSets.lowercase)));
            }
        }
        
        if (numberCharsCheckbox.checked) {
            charset += getFilteredCharset(charSets.numbers);
            if (requireOneOfEachCheckbox.checked) {
                requiredChars.push(getRandomChar(getFilteredCharset(charSets.numbers)));
            }
        }
        
        if (symbolCharsCheckbox.checked) {
            charset += getFilteredCharset(charSets.symbols);
            if (requireOneOfEachCheckbox.checked) {
                requiredChars.push(getRandomChar(getFilteredCharset(charSets.symbols)));
            }
        }
        
        // 如果没有选择任何字符集，默认使用小写字母
        if (!charset) {
            charset = charSets.lowercase;
            lowercaseCharsCheckbox.checked = true;
        }
        
        let password = '';
        
        // 如果需要包含每种类型的字符，先添加必需的字符
        if (requireOneOfEachCheckbox.checked && requiredChars.length > 0) {
            password = requiredChars.join('');
            
            // 生成剩余字符
            for (let i = password.length; i < length; i++) {
                password += getRandomChar(charset);
            }
            
            // 打乱顺序
            password = shuffleString(password);
        } else {
            // 常规密码生成
            for (let i = 0; i < length; i++) {
                password += getRandomChar(charset);
            }
        }
        
        // 更新UI
        passwordOutput.value = password;
        passwordOutput.classList.add('password-generated');
        
        // 300ms后移除动画类
        setTimeout(() => {
            passwordOutput.classList.remove('password-generated');
        }, 300);
        
        // 评估密码强度
        evaluatePasswordStrength(password);
        
        // 更新保存按钮状态
        savePasswordBtn.disabled = !password;
    }
    
    /**
     * 根据过滤条件获取过滤后的字符集
     */
    function getFilteredCharset(baseCharset) {
        let filteredSet = baseCharset;
        
        if (excludeSimilarCharsCheckbox.checked) {
            // 过滤掉相似字符
            for (const char of similarChars) {
                filteredSet = filteredSet.replace(char, '');
            }
        }
        
        if (excludeAmbiguousCharsCheckbox.checked) {
            // 过滤掉歧义字符
            for (const char of ambiguousChars) {
                filteredSet = filteredSet.replace(char, '');
            }
        }
        
        return filteredSet;
    }
    
    /**
     * 从字符集中获取随机字符
     */
    function getRandomChar(charset) {
        return charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    /**
     * 打乱字符串
     */
    function shuffleString(string) {
        const array = string.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }
    
    /**
     * 评估密码强度
     */
    function evaluatePasswordStrength(password) {
        // 0-100的强度评分
        let score = 0;
        const length = password.length;
        
        // 根据长度给分
        if (length >= 8) score += 10;
        if (length >= 12) score += 10;
        if (length >= 16) score += 10;
        if (length >= 20) score += 10;
        
        // 根据字符种类给分
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumbers = /[0-9]/.test(password);
        const hasSymbols = /[^A-Za-z0-9]/.test(password);
        
        if (hasUppercase) score += 10;
        if (hasLowercase) score += 10;
        if (hasNumbers) score += 10;
        if (hasSymbols) score += 20;
        
        // 如果同时包含四种字符，额外加分
        if (hasUppercase && hasLowercase && hasNumbers && hasSymbols) {
            score += 10;
        }
        
        // 防止超过100分
        score = Math.min(score, 100);
        
        // 显示强度
        let strengthClass = '';
        let strengthText = '';
        
        if (score < 40) {
            strengthClass = 'strength-weak';
            strengthText = '弱';
        } else if (score < 60) {
            strengthClass = 'strength-fair';
            strengthText = '一般';
        } else if (score < 80) {
            strengthClass = 'strength-good';
            strengthText = '良好';
        } else {
            strengthClass = 'strength-strong';
            strengthText = '强';
        }
        
        // 更新UI
        strengthLabel.textContent = strengthText;
        strengthBar.className = 'strength-bar';
        setTimeout(() => {
            strengthBar.classList.add(strengthClass);
        }, 10);
        
        return {
            score: score,
            level: strengthText
        };
    }
    
    /**
     * 复制密码到剪贴板
     */
    function copyPasswordToClipboard() {
        if (!passwordOutput.value) return;
        
        // 选择密码文本
        passwordOutput.select();
        passwordOutput.setSelectionRange(0, 99999);
        
        // 复制到剪贴板
        try {
            navigator.clipboard.writeText(passwordOutput.value).then(() => {
                showCopyNotification();
            }).catch(err => {
                // 如果navigator.clipboard API不可用，使用document.execCommand
                document.execCommand('copy');
                showCopyNotification();
            });
        } catch (err) {
            console.error('无法复制密码:', err);
        }
    }
    
    /**
     * 显示复制成功通知
     */
    function showCopyNotification() {
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 2000);
    }
    
    /**
     * 清除密码
     */
    function clearPassword() {
        passwordOutput.value = '';
        strengthLabel.textContent = '未生成';
        strengthBar.className = 'strength-bar';
        savePasswordBtn.disabled = true;
    }
    
    /**
     * 创建密码历史模态框
     */
    function createPasswordHistoryModal() {
        // 检查是否已经存在模态框
        if (document.getElementById('passwordHistoryModal')) {
            return;
        }
        
        // 创建模态框HTML
        const modalHTML = `
            <div class="modal" id="passwordHistoryModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>已保存的密码</h3>
                        <button class="close-btn" id="closeHistoryModal"><i class="ri-close-line"></i></button>
                    </div>
                    <div class="modal-body">
                        <div class="password-history-list" id="passwordHistoryList">
                            <div class="password-history-empty">没有保存的密码</div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="clearHistoryBtn" class="btn btn-secondary">清空历史</button>
                        <button id="closeHistoryBtn" class="btn btn-primary">关闭</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加模态框到DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 获取模态框元素
        const historyModal = document.getElementById('passwordHistoryModal');
        const closeHistoryModal = document.getElementById('closeHistoryModal');
        const closeHistoryBtn = document.getElementById('closeHistoryBtn');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        
        // 添加事件监听器
        closeHistoryModal.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });
        
        closeHistoryBtn.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });
        
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('确定要清空所有保存的密码吗？')) {
                clearPasswordHistory();
            }
        });
        
        // 为保存按钮添加查看历史的功能
        savePasswordBtn.addEventListener('dblclick', () => {
            showPasswordHistory();
        });
        
        // 更新保存按钮的提示
        savePasswordBtn.setAttribute('title', '保存当前密码');

        // 创建单独的历史记录按钮
        const historyBtn = document.createElement('button');
        historyBtn.id = 'viewHistoryBtn';
        historyBtn.className = 'btn btn-secondary history-btn';
        historyBtn.innerHTML = '<i class="ri-history-line"></i> 历史记录';
        historyBtn.title = '查看已保存的密码';
        historyBtn.addEventListener('click', showPasswordHistory);
        
        // 将历史按钮添加到按钮组
        document.querySelector('.btn-group').appendChild(historyBtn);
    }
    
    /**
     * 显示密码历史
     */
    function showPasswordHistory() {
        // 更新历史列表
        updatePasswordHistoryUI();
        
        // 显示模态框
        const historyModal = document.getElementById('passwordHistoryModal');
        historyModal.style.display = 'flex';
    }
    
    /**
     * 更新密码历史UI
     */
    function updatePasswordHistoryUI() {
        const historyList = document.getElementById('passwordHistoryList');
        historyList.innerHTML = '';
        
        if (passwordHistory.length === 0) {
            historyList.innerHTML = '<div class="password-history-empty">没有保存的密码</div>';
            return;
        }
        
        // 添加每个历史密码
        passwordHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'password-history-item';
            
            // 创建密码显示区域（遮罩处理）
            const passwordText = document.createElement('div');
            passwordText.className = 'password-history-text';
            passwordText.innerHTML = '<span class="masked-password">••••••••••</span>';
            
            // 创建操作按钮区域
            const actionBtns = document.createElement('div');
            actionBtns.className = 'password-history-actions';
            
            // 查看按钮
            const viewBtn = document.createElement('button');
            viewBtn.className = 'history-action-btn';
            viewBtn.innerHTML = '<i class="ri-eye-line"></i>';
            viewBtn.title = '查看';
            
            let isVisible = false;
            viewBtn.addEventListener('click', () => {
                isVisible = !isVisible;
                if (isVisible) {
                    passwordText.innerHTML = item.password;
                    viewBtn.innerHTML = '<i class="ri-eye-off-line"></i>';
                } else {
                    passwordText.innerHTML = '<span class="masked-password">••••••••••</span>';
                    viewBtn.innerHTML = '<i class="ri-eye-line"></i>';
                }
            });
            
            // 使用按钮
            const useBtn = document.createElement('button');
            useBtn.className = 'history-action-btn';
            useBtn.innerHTML = '<i class="ri-arrow-go-back-line"></i>';
            useBtn.title = '使用此密码';
            useBtn.addEventListener('click', () => {
                passwordOutput.value = item.password;
                evaluatePasswordStrength(item.password);
                savePasswordBtn.disabled = false;
                document.getElementById('passwordHistoryModal').style.display = 'none';
            });
            
            // 复制按钮
            const copyBtn = document.createElement('button');
            copyBtn.className = 'history-action-btn';
            copyBtn.innerHTML = '<i class="ri-file-copy-line"></i>';
            copyBtn.title = '复制';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(item.password).then(() => {
                    showCopyNotification();
                });
            });
            
            // 删除按钮
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-action-btn';
            deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
            deleteBtn.title = '删除';
            deleteBtn.addEventListener('click', () => {
                deletePasswordFromHistory(index);
                updatePasswordHistoryUI();
            });
            
            // 添加按钮到操作区域
            actionBtns.appendChild(viewBtn);
            actionBtns.appendChild(useBtn);
            actionBtns.appendChild(copyBtn);
            actionBtns.appendChild(deleteBtn);
            
            // 添加信息区域
            const infoArea = document.createElement('div');
            infoArea.className = 'password-history-info';
            infoArea.innerHTML = `
                <div class="password-history-date">${formatDate(item.date)}</div>
                <div class="password-history-strength ${getStrengthClass(item.strength.level)}">
                    ${item.strength.level}
                </div>
            `;
            
            // 组合所有元素
            historyItem.appendChild(passwordText);
            historyItem.appendChild(infoArea);
            historyItem.appendChild(actionBtns);
            
            // 添加到历史列表
            historyList.appendChild(historyItem);
        });
    }
    
    /**
     * 获取强度对应的CSS类
     */
    function getStrengthClass(level) {
        switch (level) {
            case '弱': return 'strength-weak-text';
            case '一般': return 'strength-fair-text';
            case '良好': return 'strength-good-text';
            case '强': return 'strength-strong-text';
            default: return '';
        }
    }
    
    /**
     * 格式化日期
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    }
    
    /**
     * 数字补零
     */
    function padZero(num) {
        return num.toString().padStart(2, '0');
    }
    
    /**
     * 保存密码到历史记录
     */
    function savePasswordToHistory() {
        const password = passwordOutput.value;
        if (!password) return;
        
        // 检查是否已经存在相同密码
        const exists = passwordHistory.some(item => item.password === password);
        if (exists) {
            alert('此密码已保存在历史记录中');
            return;
        }
        
        // 创建新的密码条目
        const newPasswordEntry = {
            password: password,
            date: new Date().toISOString(),
            strength: evaluatePasswordStrength(password)
        };
        
        // 添加到历史记录
        passwordHistory.unshift(newPasswordEntry);
        
        // 保存到本地存储
        savePasswordHistory();
        
        // 显示提示
        alert('密码已保存到历史记录中');
    }
    
    /**
     * 从历史记录中删除密码
     */
    function deletePasswordFromHistory(index) {
        passwordHistory.splice(index, 1);
        savePasswordHistory();
    }
    
    /**
     * 清空密码历史
     */
    function clearPasswordHistory() {
        passwordHistory = [];
        savePasswordHistory();
        updatePasswordHistoryUI();
    }
    
    /**
     * 保存密码历史到本地存储
     */
    function savePasswordHistory() {
        // 限制历史记录最多保存30条
        if (passwordHistory.length > 30) {
            passwordHistory = passwordHistory.slice(0, 30);
        }
        
        localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    }
    
    /**
     * 从本地存储加载密码历史
     */
    function loadPasswordHistory() {
        const savedHistory = localStorage.getItem('passwordHistory');
        return savedHistory ? JSON.parse(savedHistory) : [];
    }
}); 