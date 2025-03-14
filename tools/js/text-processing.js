document.addEventListener('DOMContentLoaded', function() {
    // 切换标签页
    const tabs = document.querySelectorAll('.tool-tab');
    const tabContents = document.querySelectorAll('.tool-tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // 切换活动标签样式
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // 显示相应内容
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });
    
    // 创建提示消息函数
    function showToast(message) {
        // 检查是否已存在toast元素
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
        
        // 3秒后隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
        }, 3000);
    }
    
    // 文本转换功能
    const transformButtons = document.querySelectorAll('.transform-actions .tool-btn');
    const inputText = document.getElementById('input-text');
    const transformResult = document.getElementById('transform-result');
    
    transformButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            const text = inputText.value;
            
            switch(action) {
                case 'uppercase':
                    transformResult.value = text.toUpperCase();
                    break;
                case 'lowercase':
                    transformResult.value = text.toLowerCase();
                    break;
                case 'capitalize':
                    transformResult.value = text.replace(/\b\w/g, char => char.toUpperCase());
                    break;
                case 'reverse':
                    transformResult.value = text.split('').reverse().join('');
                    break;
                case 'trim':
                    transformResult.value = text.replace(/\s+/g, ' ').trim();
                    break;
                case 'clear':
                    inputText.value = '';
                    transformResult.value = '';
                    break;
            }
        });
    });
    
    // 复制转换结果
    document.getElementById('copy-transform').addEventListener('click', () => {
        transformResult.select();
        document.execCommand('copy');
        showToast('已复制到剪贴板');
    });
    
    // 排序去重功能
    const sortInput = document.getElementById('sort-input');
    const sortResult = document.getElementById('sort-result');
    
    document.getElementById('process-sort').addEventListener('click', () => {
        const lines = sortInput.value.split('\n');
        let result = lines;
        
        // 去除每行首尾空白
        if (document.getElementById('trim-lines').checked) {
            result = result.map(line => line.trim());
        }
        
        // 去除重复行
        if (document.getElementById('remove-duplicates').checked) {
            if (document.getElementById('ignore-case').checked) {
                const uniqueLines = new Map();
                result.forEach(line => {
                    const lowerLine = line.toLowerCase();
                    if (!uniqueLines.has(lowerLine)) {
                        uniqueLines.set(lowerLine, line);
                    }
                });
                result = Array.from(uniqueLines.values());
            } else {
                result = [...new Set(result)];
            }
        }
        
        // 排序
        if (document.getElementById('ignore-case').checked) {
            result.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        } else {
            result.sort();
        }
        
        // 降序
        if (!document.getElementById('sort-ascending').checked) {
            result.reverse();
        }
        
        sortResult.value = result.join('\n');
    });
    
    // 清空排序输入
    document.getElementById('clear-sort').addEventListener('click', () => {
        sortInput.value = '';
        sortResult.value = '';
    });
    
    // 复制排序结果
    document.getElementById('copy-sort').addEventListener('click', () => {
        sortResult.select();
        document.execCommand('copy');
        showToast('已复制到剪贴板');
    });
    
    // 文本比较功能
    const compareText1 = document.getElementById('compare-text-1');
    const compareText2 = document.getElementById('compare-text-2');
    const comparisonDiff = document.getElementById('comparison-diff');
    
    document.getElementById('compare-text').addEventListener('click', () => {
        let text1 = compareText1.value;
        let text2 = compareText2.value;
        
        // 处理选项
        if (document.getElementById('ignore-case-compare').checked) {
            text1 = text1.toLowerCase();
            text2 = text2.toLowerCase();
        }
        
        if (document.getElementById('ignore-whitespace').checked) {
            text1 = text1.replace(/\s+/g, '');
            text2 = text2.replace(/\s+/g, '');
        }
        
        // 计算相似度
        let sameChars = 0;
        let diffChars = 0;
        const longerTextLength = Math.max(text1.length, text2.length);
        const shorterTextLength = Math.min(text1.length, text2.length);
        
        for (let i = 0; i < shorterTextLength; i++) {
            if (text1[i] === text2[i]) {
                sameChars++;
            } else {
                diffChars++;
            }
        }
        
        // 加上长度差
        diffChars += longerTextLength - shorterTextLength;
        
        const similarityPercentage = longerTextLength > 0 
            ? Math.round((sameChars / longerTextLength) * 100) 
            : 100;
        
        // 显示统计结果
        document.getElementById('similarity-percentage').textContent = similarityPercentage + '%';
        document.getElementById('same-chars').textContent = sameChars;
        document.getElementById('diff-chars').textContent = diffChars;
        
        // 生成差异显示
        const originalText1 = compareText1.value;
        const originalText2 = compareText2.value;
        
        // 简单差异显示算法
        let diffHtml = '';
        const maxLen = Math.max(originalText1.length, originalText2.length);
        
        for (let i = 0; i < maxLen; i++) {
            const char1 = i < originalText1.length ? originalText1[i] : '';
            const char2 = i < originalText2.length ? originalText2[i] : '';
            
            if (char1 === char2) {
                diffHtml += char1;
            } else {
                if (char1) {
                    diffHtml += `<span class="diff-removed">${char1}</span>`;
                }
                if (char2) {
                    diffHtml += `<span class="diff-added">${char2}</span>`;
                }
            }
        }
        
        // 转换换行符为HTML
        diffHtml = diffHtml.replace(/\n/g, '<br>');
        comparisonDiff.innerHTML = diffHtml;
    });
    
    // 清空比较输入
    document.getElementById('clear-compare').addEventListener('click', () => {
        compareText1.value = '';
        compareText2.value = '';
        comparisonDiff.innerHTML = '';
        document.getElementById('similarity-percentage').textContent = '-';
        document.getElementById('same-chars').textContent = '-';
        document.getElementById('diff-chars').textContent = '-';
    });
    
    // 文本统计功能
    const statsInput = document.getElementById('stats-input');
    
    document.getElementById('calculate-stats').addEventListener('click', () => {
        const text = statsInput.value;
        
        // 基本统计
        const charCount = text.length;
        const charNoSpaces = text.replace(/\s/g, '').length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lineCount = text.split('\n').length;
        const paragraphCount = text.trim() ? text.trim().split(/\n\s*\n/).length : 0;
        const readTime = Math.ceil(wordCount / 200); // 假设阅读速度为200字/分钟
        
        // 更新统计结果
        document.getElementById('char-count').textContent = charCount;
        document.getElementById('char-no-spaces').textContent = charNoSpaces;
        document.getElementById('word-count').textContent = wordCount;
        document.getElementById('line-count').textContent = lineCount;
        document.getElementById('paragraph-count').textContent = paragraphCount;
        document.getElementById('read-time').textContent = readTime;
        
        // 字符频率分析
        const charFrequency = {};
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char in charFrequency) {
                charFrequency[char]++;
            } else {
                charFrequency[char] = 1;
            }
        }
        
        // 排序字符频率
        const sortedChars = Object.keys(charFrequency).sort((a, b) => {
            return charFrequency[b] - charFrequency[a];
        });
        
        // 限制显示前30个最常见的字符
        const frequencyLimit = 30;
        const charFrequencyDisplay = document.getElementById('char-frequency');
        charFrequencyDisplay.innerHTML = '';
        
        for (let i = 0; i < Math.min(frequencyLimit, sortedChars.length); i++) {
            const char = sortedChars[i];
            const frequency = charFrequency[char];
            const percentage = ((frequency / text.length) * 100).toFixed(2);
            
            const charElement = document.createElement('div');
            charElement.className = 'char-freq-item';
            
            let displayChar = char;
            if (char === ' ') displayChar = '空格';
            else if (char === '\n') displayChar = '换行';
            else if (char === '\t') displayChar = '制表符';
            
            charElement.innerHTML = `
                <span>${displayChar}</span>
                <span>${frequency} (${percentage}%)</span>
            `;
            
            charFrequencyDisplay.appendChild(charElement);
        }
    });
    
    // 清空统计输入
    document.getElementById('clear-stats').addEventListener('click', () => {
        statsInput.value = '';
        document.getElementById('char-count').textContent = '0';
        document.getElementById('char-no-spaces').textContent = '0';
        document.getElementById('word-count').textContent = '0';
        document.getElementById('line-count').textContent = '0';
        document.getElementById('paragraph-count').textContent = '0';
        document.getElementById('read-time').textContent = '0';
        document.getElementById('char-frequency').innerHTML = '';
    });
});
