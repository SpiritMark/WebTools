document.addEventListener('DOMContentLoaded', function() {
    // DOM元素
    const ipInput = document.getElementById('ipInput');
    const lookupBtn = document.getElementById('lookupBtn');
    const myIPBtn = document.getElementById('myIPBtn');
    const showMapCheckbox = document.getElementById('showMap');
    const showWhoisCheckbox = document.getElementById('showWhois');
    const loadingState = document.getElementById('loadingState');
    const resultSection = document.getElementById('resultSection');
    const mapSection = document.getElementById('mapSection');
    const whoisSection = document.getElementById('whoisSection');
    const copyResultBtn = document.getElementById('copyResultBtn');
    const saveResultBtn = document.getElementById('saveResultBtn');
    const shareResultBtn = document.getElementById('shareResultBtn');
    const copyWhoisBtn = document.getElementById('copyWhoisBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const historyList = document.getElementById('historyList');
    
    // API密钥 (请替换为您自己的密钥)
    const ipInfoApiKey = 'YOUR_IPINFO_API_KEY';
    const ipApiKey = 'YOUR_IPAPI_KEY';
    
    // 地图变量
    let map;
    let marker;
    let mapLoaded = false;
    
    // 初始状态
    loadLookupHistory();
    
    // 事件监听
    lookupBtn.addEventListener('click', performLookup);
    myIPBtn.addEventListener('click', lookupMyIP);
    copyResultBtn.addEventListener('click', copyResult);
    saveResultBtn.addEventListener('click', saveResultAsPDF);
    shareResultBtn.addEventListener('click', shareResult);
    copyWhoisBtn.addEventListener('click', copyWhoisInfo);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    showMapCheckbox.addEventListener('change', function() {
        if (resultSection.style.display !== 'none') {
            mapSection.style.display = this.checked ? 'block' : 'none';
        }
    });
    
    showWhoisCheckbox.addEventListener('change', function() {
        if (resultSection.style.display !== 'none') {
            whoisSection.style.display = this.checked ? 'block' : 'none';
        }
    });
    
    // 监听回车键
    ipInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performLookup();
        }
    });
    
    // 地图视图切换
    document.querySelectorAll('.view-option').forEach(option => {
        option.addEventListener('click', function() {
            const mapType = this.getAttribute('data-view');
            changeMapView(mapType);
            
            // 更新按钮激活状态
            document.querySelectorAll('.view-option').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // 执行IP查询
    function performLookup() {
        const ipAddress = ipInput.value.trim();
        if (!ipAddress) {
            showNotification('请输入IP地址或域名', 'error');
            return;
        }
        
        // 显示加载状态
        loadingState.style.display = 'flex';
        resultSection.style.display = 'none';
        
        // 查询IP信息
        fetchIPInfo(ipAddress)
            .then(data => {
                // 填充结果
                fillIPResults(data);
                
                // 加载WHOIS信息
                if (showWhoisCheckbox.checked) {
                    fetchWhoisInfo(data.ip);
                }
                
                // 显示结果
                loadingState.style.display = 'none';
                resultSection.style.display = 'flex';
                
                // 更新地图和WHOIS区域显示状态
                mapSection.style.display = showMapCheckbox.checked ? 'block' : 'none';
                whoisSection.style.display = showWhoisCheckbox.checked ? 'block' : 'none';
                
                // 如果显示地图并且坐标有效，则初始化地图
                if (showMapCheckbox.checked && data.latitude && data.longitude) {
                    initializeMap(data.latitude, data.longitude, data.city);
                }
                
                // 添加到查询历史
                addToHistory(data);
            })
            .catch(error => {
                loadingState.style.display = 'none';
                showNotification('查询IP信息失败: ' + error.message, 'error');
            });
    }
    
    // 查询我的IP
    function lookupMyIP() {
        // 显示加载状态
        loadingState.style.display = 'flex';
        resultSection.style.display = 'none';
        
        // 使用ipify API获取用户的公共IP地址
        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                ipInput.value = data.ip;
                performLookup();
            })
            .catch(error => {
                loadingState.style.display = 'none';
                showNotification('获取您的IP失败: ' + error.message, 'error');
            });
    }
    
    // 获取IP信息
    async function fetchIPInfo(ip) {
        try {
            // 使用免费的IP-API服务获取基本IP信息
            const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,continent,country,regionName,city,district,zip,lat,lon,timezone,isp,org,as,asname,mobile,proxy,hosting,query`);
            const data = await response.json();
            
            if (data.status === 'fail') {
                throw new Error(data.message || '查询失败');
            }
            
            return {
                ip: data.query,
                version: isIPv6(data.query) ? 'IPv6' : 'IPv4',
                type: data.hosting ? '服务器/数据中心' : (data.mobile ? '移动网络' : '固定网络'),
                hostname: await fetchHostname(data.query),
                asn: data.as,
                organization: data.org || data.isp,
                continent: data.continent,
                country: data.country,
                region: data.regionName,
                city: data.city,
                postalCode: data.zip,
                timezone: data.timezone,
                latitude: data.lat,
                longitude: data.lon,
                isp: data.isp,
                network: await fetchNetworkInfo(data.query),
                routingPrefix: await fetchRoutingPrefix(data.query),
                domain: extractDomain(data.isp),
                usageType: determineUsageType(data),
                threatLevel: 'safe',
                isProxy: data.proxy,
                isTor: false,
                isDatacenter: data.hosting,
                blocklists: '未列入黑名单'
            };
        } catch (error) {
            throw new Error(`无法获取IP信息: ${error.message}`);
        }
    }
    
    // 填充IP结果
    function fillIPResults(data) {
        // 更新顶部摘要
        document.getElementById('ipAddress').textContent = data.ip;
        document.getElementById('locationSummary').querySelector('span').textContent = `${data.country}, ${data.region}`;
        
        // 基本信息
        document.getElementById('ipVersion').textContent = data.version;
        document.getElementById('ipType').textContent = data.type;
        document.getElementById('hostname').textContent = data.hostname || 'N/A';
        document.getElementById('asn').textContent = data.asn || 'N/A';
        document.getElementById('organization').textContent = data.organization || 'N/A';
        
        // 位置信息
        document.getElementById('continent').textContent = data.continent || 'N/A';
        document.getElementById('country').textContent = data.country || 'N/A';
        document.getElementById('region').textContent = data.region || 'N/A';
        document.getElementById('city').textContent = data.city || 'N/A';
        document.getElementById('postalCode').textContent = data.postalCode || 'N/A';
        document.getElementById('timezone').textContent = data.timezone || 'N/A';
        document.getElementById('coordinates').textContent = 
            (data.latitude && data.longitude) ? `${data.latitude}, ${data.longitude}` : 'N/A';
        
        // 网络信息
        document.getElementById('isp').textContent = data.isp || 'N/A';
        document.getElementById('network').textContent = data.network || 'N/A';
        document.getElementById('routingPrefix').textContent = data.routingPrefix || 'N/A';
        document.getElementById('domain').textContent = data.domain || 'N/A';
        document.getElementById('usageType').textContent = data.usageType || 'N/A';
        
        // 安全信息
        const threatLevel = document.getElementById('threatLevel');
        threatLevel.innerHTML = `<span class="security-badge safe">安全</span>`;
        
        const isProxy = document.getElementById('isProxy');
        isProxy.innerHTML = `<span class="security-badge ${data.isProxy ? 'warning' : 'neutral'}">${data.isProxy ? '是' : '否'}</span>`;
        
        const isTor = document.getElementById('isTor');
        isTor.innerHTML = `<span class="security-badge ${data.isTor ? 'warning' : 'neutral'}">${data.isTor ? '是' : '否'}</span>`;
        
        const isDatacenter = document.getElementById('isDatacenter');
        isDatacenter.innerHTML = `<span class="security-badge ${data.isDatacenter ? 'info' : 'neutral'}">${data.isDatacenter ? '是' : '否'}</span>`;
        
        document.getElementById('blocklists').textContent = data.blocklists || '未列入黑名单';
    }
    
    // 获取WHOIS信息
    async function fetchWhoisInfo(ip) {
        try {
            // 这里使用模拟数据，实际项目中应使用WHOIS API
            let whoisData = '正在加载WHOIS信息...';
            
            if (isIPv6(ip)) {
                whoisData = `% [WHOIS信息由ARIN提供]
% ARIN WHOIS数据和服务受条款约束
% 请参阅https://www.arin.net/resources/registry/whois/tou/

NetRange:       2001:4860:: - 2001:4860:FFFF:FFFF:FFFF:FFFF:FFFF:FFFF
CIDR:           2001:4860::/32
NetName:        GOOGLE
NetHandle:      NET6-2001-4860-1
Parent:         NET6-2001-0000-0
NetType:        Direct Assignment
OriginAS:       AS15169
Organization:   Google LLC (GOGL)
RegDate:        2012-05-24
Updated:        2012-05-24
Comment:        此块中的IP地址用于Google全球骨干网
Ref:            https://rdap.arin.net/registry/ip/2001:4860::`;
            } else {
                whoisData = `% [WHOIS信息由ARIN提供]
% ARIN WHOIS数据和服务受条款约束
% 请参阅https://www.arin.net/resources/registry/whois/tou/

NetRange:       8.8.8.0 - 8.8.8.255
CIDR:           8.8.8.0/24
NetName:        LVLT-GOGL-8-8-8
NetHandle:      NET-8-8-8-0-1
Parent:         NET8 (NET-8-0-0-0-0)
NetType:        Direct Allocation
OriginAS:       AS15169
Organization:   Google LLC (GOGL)
RegDate:        2014-03-14
Updated:        2018-10-05
Ref:            https://rdap.arin.net/registry/ip/8.8.8.0

OrgName:        Google LLC
OrgId:          GOGL
Address:        1600 Amphitheatre Parkway
City:           Mountain View
StateProv:      CA
PostalCode:     94043
Country:        US
RegDate:        2000-03-30
Updated:        2019-10-31
Comment:        请参阅https://support.google.com/iprange/
Ref:            https://rdap.arin.net/registry/entity/GOGL

OrgTechHandle: ZG39-ARIN
OrgTechName:   Google LLC
OrgTechPhone:  +1-650-253-0000
OrgTechEmail:  arin-contact@google.com
OrgTechRef:    https://rdap.arin.net/registry/entity/ZG39-ARIN`;
            }
            
            // 更新WHOIS数据
            document.getElementById('whoisData').textContent = whoisData;
        } catch (error) {
            document.getElementById('whoisData').textContent = '无法获取WHOIS信息: ' + error.message;
        }
    }
    
    // 初始化地图
    function initializeMap(latitude, longitude, city) {
        const mapContainer = document.getElementById('mapContainer');
        
        // 如果已经初始化过，就更新地图位置
        if (mapLoaded && map) {
            const position = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
            map.setCenter(position);
            marker.setPosition(position);
            return;
        }
        
        // 初始化地图
        try {
            const position = { lat: parseFloat(latitude), lng: parseFloat(longitude) };
            map = new google.maps.Map(mapContainer, {
                center: position,
                zoom: 12,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                mapTypeControl: false,
                fullscreenControl: true,
                streetViewControl: false
            });
            
            // 添加标记
            marker = new google.maps.Marker({
                position: position,
                map: map,
                title: city || 'IP位置',
                animation: google.maps.Animation.DROP
            });
            
            // 添加信息窗口
            const infoWindow = new google.maps.InfoWindow({
                content: `<div style="font-weight:500;">${city || '未知位置'}</div><div>坐标: ${latitude}, ${longitude}</div>`
            });
            
            marker.addListener('click', () => {
                infoWindow.open(map, marker);
            });
            
            mapLoaded = true;
        } catch (error) {
            console.error('初始化地图失败:', error);
            mapContainer.innerHTML = `<div class="map-error">无法加载地图: ${error.message}</div>`;
        }
    }
    
    // 更改地图视图
    function changeMapView(mapType) {
        if (!mapLoaded || !map) return;
        
        switch (mapType) {
            case 'satellite':
                map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
                break;
            case 'standard':
            default:
                map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
                break;
        }
    }
    
    // 复制结果
    function copyResult() {
        try {
            const ipAddress = document.getElementById('ipAddress').textContent;
            const location = document.getElementById('locationSummary').querySelector('span').textContent;
            const coordinates = document.getElementById('coordinates').textContent;
            const isp = document.getElementById('isp').textContent;
            
            const resultText = `IP地址: ${ipAddress}\n位置: ${location}\n坐标: ${coordinates}\nISP: ${isp}`;
            
            navigator.clipboard.writeText(resultText)
                .then(() => showNotification('结果已复制到剪贴板', 'success'))
                .catch(err => showNotification('复制失败: ' + err.message, 'error'));
        } catch (error) {
            showNotification('复制失败: ' + error.message, 'error');
        }
    }
    
    // 保存结果为PDF
    function saveResultAsPDF() {
        showNotification('PDF导出功能尚未完全实现', 'info');
        // 在实际项目中，这里应该集成PDF生成库，例如jsPDF
    }
    
    // 分享结果
    function shareResult() {
        try {
            const ipAddress = document.getElementById('ipAddress').textContent;
            const url = `${window.location.origin}${window.location.pathname}?ip=${encodeURIComponent(ipAddress)}`;
            
            if (navigator.share) {
                navigator.share({
                    title: `IP地址 ${ipAddress} 的信息`,
                    text: `查看IP地址 ${ipAddress} 的详细信息`,
                    url: url
                }).then(() => {
                    showNotification('分享成功', 'success');
                }).catch((error) => {
                    showNotification('分享失败: ' + error.message, 'error');
                });
            } else {
                navigator.clipboard.writeText(url)
                    .then(() => showNotification('链接已复制到剪贴板', 'success'))
                    .catch(err => showNotification('复制失败: ' + err.message, 'error'));
            }
        } catch (error) {
            showNotification('分享失败: ' + error.message, 'error');
        }
    }
    
    // 复制WHOIS信息
    function copyWhoisInfo() {
        try {
            const whoisData = document.getElementById('whoisData').textContent;
            
            navigator.clipboard.writeText(whoisData)
                .then(() => showNotification('WHOIS信息已复制到剪贴板', 'success'))
                .catch(err => showNotification('复制失败: ' + err.message, 'error'));
        } catch (error) {
            showNotification('复制失败: ' + error.message, 'error');
        }
    }
    
    // 添加到查询历史
    function addToHistory(data) {
        // 从本地存储获取历史记录
        const history = getHistory();
        
        // 检查是否已存在
        const existingIndex = history.findIndex(item => item.ip === data.ip);
        if (existingIndex !== -1) {
            // 如果存在，删除旧记录
            history.splice(existingIndex, 1);
        }
        
        // 添加新记录到开头
        history.unshift({
            ip: data.ip,
            location: `${data.country}, ${data.region}`,
            timestamp: new Date().getTime()
        });
        
        // 限制历史记录数量
        if (history.length > 10) {
            history.pop();
        }
        
        // 保存到本地存储
        localStorage.setItem('ipLookupHistory', JSON.stringify(history));
        
        // 更新历史记录显示
        loadLookupHistory();
    }
    
    // 获取查询历史
    function getHistory() {
        const historyData = localStorage.getItem('ipLookupHistory');
        return historyData ? JSON.parse(historyData) : [];
    }
    
    // 加载查询历史
    function loadLookupHistory() {
        const history = getHistory();
        const historyList = document.getElementById('historyList');
        
        // 清空历史列表
        historyList.innerHTML = '';
        
        if (history.length === 0) {
            historyList.innerHTML = '<div class="history-empty" data-i18n="ipLookup.noHistory">暂无查询历史</div>';
            return;
        }
        
        // 添加历史记录
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <span class="history-item-ip">${item.ip}</span>
                <span class="history-item-location">${item.location}</span>
            `;
            
            // 点击加载历史记录
            historyItem.addEventListener('click', () => {
                ipInput.value = item.ip;
                performLookup();
            });
            
            historyList.appendChild(historyItem);
        });
    }
    
    // 清除历史
    function clearHistory() {
        localStorage.removeItem('ipLookupHistory');
        loadLookupHistory();
        showNotification('查询历史已清除', 'success');
    }
    
    // 检查URL参数中是否有IP
    function checkUrlForIP() {
        const urlParams = new URLSearchParams(window.location.search);
        const ipParam = urlParams.get('ip');
        
        if (ipParam) {
            ipInput.value = ipParam;
            performLookup();
        }
    }
    
    // 辅助函数：判断是否是IPv6
    function isIPv6(ip) {
        return ip.includes(':');
    }
    
    // 辅助函数：获取主机名
    async function fetchHostname(ip) {
        // 在实际项目中应使用DNS反向查询API
        // 这里返回模拟数据
        if (ip === '8.8.8.8') {
            return 'dns.google';
        }
        return '';
    }
    
    // 辅助函数：获取网络信息
    async function fetchNetworkInfo(ip) {
        // 在实际项目中应使用IP信息API
        // 这里返回模拟数据
        if (ip === '8.8.8.8') {
            return '8.8.8.0/24';
        }
        return '';
    }
    
    // 辅助函数：获取路由前缀
    async function fetchRoutingPrefix(ip) {
        // 在实际项目中应使用BGP/Routeview API
        // 这里返回模拟数据
        if (ip === '8.8.8.8') {
            return '8.8.8.0/24';
        }
        return '';
    }
    
    // 辅助函数：从ISP信息中提取域名
    function extractDomain(isp) {
        if (!isp) return '';
        
        // 匹配常见公司名称中的域名
        if (isp.includes('Google')) return 'google.com';
        if (isp.includes('Amazon')) return 'amazon.com';
        if (isp.includes('Microsoft')) return 'microsoft.com';
        if (isp.includes('Facebook')) return 'facebook.com';
        
        return '';
    }
    
    // 辅助函数：确定使用类型
    function determineUsageType(data) {
        if (data.hosting) {
            return '数据中心/服务器托管';
        }
        if (data.mobile) {
            return '移动网络';
        }
        if (data.proxy) {
            return '代理/VPN';
        }
        
        // 对特定IP的特殊处理
        if (data.query === '8.8.8.8') {
            return '数据中心/服务器托管/DNS';
        }
        
        return '一般用途';
    }
    
    // 通知函数
    function showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // 检查URL参数
    checkUrlForIP();
    
    // 扩展window对象，使地图回调可用
    window.initMap = function() {
        // 地图API加载完成的回调
        if (resultSection.style.display !== 'none' && showMapCheckbox.checked) {
            const coords = document.getElementById('coordinates').textContent;
            if (coords && coords !== 'N/A') {
                const [lat, lng] = coords.split(',').map(c => parseFloat(c.trim()));
                const city = document.getElementById('city').textContent;
                initializeMap(lat, lng, city);
            }
        }
    };
}); 