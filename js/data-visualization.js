/**
 * 数据可视化工具
 * 实现数据解析、图表配置与渲染功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    const dataVisualization = new DataVisualization();
    dataVisualization.init();
});

/**
 * 数据可视化应用类
 */
class DataVisualization {
    constructor() {
        // 应用状态
        this.state = {
            data: null,
            dataColumns: [],
            currentTab: 'file-upload',
            selectedChartType: null,
            chartInstance: null,
            dataFormat: 'csv',
            originalDataString: null
        };

        // DOM元素缓存
        this.elements = {
            // 标签页相关
            tabButtons: document.querySelectorAll('.tab-btn'),
            tabContents: document.querySelectorAll('.tab-content'),
            
            // 文件上传相关
            uploadArea: document.getElementById('uploadArea'),
            dataFileInput: document.getElementById('dataFileInput'),
            uploadBtn: document.getElementById('uploadBtn'),
            uploadedFileInfo: document.getElementById('uploadedFileInfo'),
            fileName: document.getElementById('fileName'),
            fileSize: document.getElementById('fileSize'),
            removeFileBtn: document.getElementById('removeFileBtn'),
            
            // 粘贴数据相关
            dataTextarea: document.getElementById('dataTextarea'),
            dataFormat: document.getElementById('dataFormat'),
            parseDataBtn: document.getElementById('parseDataBtn'),
            clearDataBtn: document.getElementById('clearDataBtn'),
            
            // 示例数据相关
            sampleCards: document.querySelectorAll('.sample-card'),
            
            // 数据预览相关
            dataPreviewPanel: document.getElementById('dataPreviewPanel'),
            dataGrid: document.getElementById('dataGrid'),
            dataSummary: document.getElementById('dataSummary'),
            refreshDataBtn: document.getElementById('refreshDataBtn'),
            editDataBtn: document.getElementById('editDataBtn'),
            
            // 图表类型相关
            chartTypeCards: document.querySelectorAll('.chart-type-card'),
            
            // 数据映射相关
            mappingFields: document.getElementById('mappingFields'),
            
            // 图表样式相关
            accordionItems: document.querySelectorAll('.accordion-item'),
            accordionHeaders: document.querySelectorAll('.accordion-header'),
            chartTitle: document.getElementById('chartTitle'),
            chartTheme: document.getElementById('chartTheme'),
            chartBackground: document.getElementById('chartBackground'),
            xAxisName: document.getElementById('xAxisName'),
            yAxisName: document.getElementById('yAxisName'),
            showGrid: document.getElementById('showGrid'),
            showLegend: document.getElementById('showLegend'),
            labelRotation: document.getElementById('labelRotation'),
            labelRotationValue: document.getElementById('labelRotationValue'),
            fontSize: document.getElementById('fontSize'),
            fontSizeValue: document.getElementById('fontSizeValue'),
            showDataLabels: document.getElementById('showDataLabels'),
            enableAnimation: document.getElementById('enableAnimation'),
            animationDuration: document.getElementById('animationDuration'),
            enableZoom: document.getElementById('enableZoom'),
            
            // 生成按钮相关
            generateChartBtn: document.getElementById('generateChartBtn'),
            resetConfigBtn: document.getElementById('resetConfigBtn'),
            
            // 图表预览相关
            chartPreviewPanel: document.getElementById('chartPreviewPanel'),
            chartContainer: document.getElementById('chartContainer'),
            downloadChartBtn: document.getElementById('downloadChartBtn'),
            copyChartBtn: document.getElementById('copyChartBtn'),
            downloadFormat: document.getElementById('downloadFormat'),
            
            // 模态框相关
            dataEditModal: document.getElementById('dataEditModal'),
            editDataTextarea: document.getElementById('editDataTextarea'),
            closeDataEditModal: document.getElementById('closeDataEditModal'),
            cancelEditBtn: document.getElementById('cancelEditBtn'),
            applyEditBtn: document.getElementById('applyEditBtn')
        };
        
        // 示例数据配置
        this.sampleDataConfig = {
            sales: {
                name: '月度销售数据',
                format: 'csv',
                data: `月份,实际销售额,销售目标,去年同期
1月,12500,15000,10200
2月,15300,15000,11500
3月,18600,17000,14300
4月,21200,20000,18500
5月,22400,20000,19800
6月,24500,22000,21300
7月,28600,24000,22800
8月,30100,27000,23500
9月,31200,30000,25800
10月,29800,32000,27200
11月,32300,35000,29500
12月,38900,40000,33600`
            },
            population: {
                name: '人口分布数据',
                format: 'csv',
                data: `年龄段,男性,女性
0-9岁,5623892,5315724
10-19岁,6234567,5987345
20-29岁,8745632,8563214
30-39岁,9853214,9762154
40-49岁,8562347,8745632
50-59岁,7458963,7689542
60-69岁,5896321,6235489
70-79岁,3568974,4125698
80岁以上,1532648,2356987`
            },
            weather: {
                name: '年度天气数据',
                format: 'csv',
                data: `月份,平均温度(°C),降水量(mm),湿度(%),日照时间(小时)
1月,2.3,45.2,68,148
2月,3.5,48.7,65,160
3月,8.2,53.4,62,186
4月,12.8,62.3,60,210
5月,18.5,78.6,55,246
6月,22.3,95.8,53,268
7月,25.6,112.4,58,280
8月,24.8,105.2,60,265
9月,20.3,85.6,62,220
10月,14.2,68.3,65,185
11月,8.1,55.2,70,150
12月,3.6,48.9,72,130`
            },
            finance: {
                name: '财务季度报表',
                format: 'csv',
                data: `季度,收入(万元),支出(万元),净利润(万元),增长率(%)
Q1 2023,1250.35,875.42,374.93,12.5
Q2 2023,1425.68,962.33,463.35,23.6
Q3 2023,1385.42,1042.67,342.75,-26.0
Q4 2023,1680.25,1125.18,555.07,62.0
Q1 2024,1520.75,1050.28,470.47,-15.2
Q2 2024,1785.32,1190.45,594.87,26.4`
            }
        };
        
        // 绑定方法的this上下文
        this.bindMethods();
    }
    
    /**
     * 绑定方法的this上下文
     */
    bindMethods() {
        // 标签页切换
        this.handleTabChange = this.handleTabChange.bind(this);
        
        // 文件上传
        this.handleFileUploadClick = this.handleFileUploadClick.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleRemoveFile = this.handleRemoveFile.bind(this);
        
        // 粘贴数据
        this.handleParseData = this.handleParseData.bind(this);
        this.handleClearData = this.handleClearData.bind(this);
        
        // 示例数据
        this.handleSampleDataClick = this.handleSampleDataClick.bind(this);
        
        // 编辑数据
        this.handleEditData = this.handleEditData.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
        this.handleCancelEdit = this.handleCancelEdit.bind(this);
        this.handleApplyEdit = this.handleApplyEdit.bind(this);
        
        // 图表类型选择
        this.handleChartTypeSelect = this.handleChartTypeSelect.bind(this);
        
        // 手风琴面板
        this.handleAccordionToggle = this.handleAccordionToggle.bind(this);
        
        // 滑块值更新
        this.handleRangeSliderChange = this.handleRangeSliderChange.bind(this);
        
        // 生成图表
        this.handleGenerateChart = this.handleGenerateChart.bind(this);
        this.handleResetConfig = this.handleResetConfig.bind(this);
        
        // 导出图表
        this.handleDownloadChart = this.handleDownloadChart.bind(this);
        this.handleCopyChart = this.handleCopyChart.bind(this);
    }
    
    /**
     * 初始化应用
     */
    init() {
        this.attachEventListeners();
        this.initAccordion();
    }
    
    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // 标签页切换
        this.elements.tabButtons.forEach(button => {
            button.addEventListener('click', this.handleTabChange);
        });
        
        // 文件上传
        this.elements.uploadArea.addEventListener('click', this.handleFileUploadClick);
        this.elements.uploadBtn.addEventListener('click', this.handleFileUploadClick);
        this.elements.dataFileInput.addEventListener('change', this.handleFileChange);
        this.elements.removeFileBtn.addEventListener('click', this.handleRemoveFile);
        
        // 粘贴数据
        this.elements.parseDataBtn.addEventListener('click', this.handleParseData);
        this.elements.clearDataBtn.addEventListener('click', this.handleClearData);
        
        // 示例数据
        this.elements.sampleCards.forEach(card => {
            card.addEventListener('click', this.handleSampleDataClick);
        });
        
        // 编辑数据
        this.elements.editDataBtn.addEventListener('click', this.handleEditData);
        this.elements.closeDataEditModal.addEventListener('click', this.handleCloseModal);
        this.elements.cancelEditBtn.addEventListener('click', this.handleCancelEdit);
        this.elements.applyEditBtn.addEventListener('click', this.handleApplyEdit);
        
        // 图表类型选择
        this.elements.chartTypeCards.forEach(card => {
            card.addEventListener('click', this.handleChartTypeSelect);
        });
        
        // 手风琴面板
        this.elements.accordionHeaders.forEach(header => {
            header.addEventListener('click', this.handleAccordionToggle);
        });
        
        // 滑块值更新
        this.elements.labelRotation.addEventListener('input', this.handleRangeSliderChange);
        this.elements.fontSize.addEventListener('input', this.handleRangeSliderChange);
        
        // 生成图表
        this.elements.generateChartBtn.addEventListener('click', this.handleGenerateChart);
        this.elements.resetConfigBtn.addEventListener('click', this.handleResetConfig);
        
        // 导出图表
        this.elements.downloadChartBtn.addEventListener('click', this.handleDownloadChart);
        this.elements.copyChartBtn.addEventListener('click', this.handleCopyChart);
    }
    
    /**
     * 初始化手风琴面板
     */
    initAccordion() {
        // 默认展开第一个面板
        if (this.elements.accordionItems.length > 0) {
            this.elements.accordionItems[0].classList.add('active');
        }
    }
    
    /**
     * 处理标签页切换
     * @param {Event} event - 点击事件
     */
    handleTabChange(event) {
        const tabId = event.currentTarget.dataset.tab;
        
        // 更新激活的标签按钮
        this.elements.tabButtons.forEach(button => {
            button.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // 显示对应的标签内容
        this.elements.tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        // 更新当前标签状态
        this.state.currentTab = tabId;
    }
    
    /**
     * 处理文件上传按钮点击
     */
    handleFileUploadClick() {
        this.elements.dataFileInput.click();
    }
    
    /**
     * 处理文件选择变更
     * @param {Event} event - 文件选择事件
     */
    handleFileChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件大小（最大10MB）
        if (file.size > 10 * 1024 * 1024) {
            alert('文件大小超过限制（最大10MB）');
            return;
        }
        
        // 更新文件信息显示
        this.elements.fileName.textContent = file.name;
        this.elements.fileSize.textContent = this.formatFileSize(file.size);
        this.elements.uploadedFileInfo.style.display = 'flex';
        
        // 根据文件类型解析数据
        const fileType = this.getFileExtension(file.name);
        this.readAndParseFile(file, fileType);
    }
    
    /**
     * 获取文件扩展名
     * @param {string} filename - 文件名
     * @returns {string} 文件扩展名
     */
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
    }
    
    /**
     * 格式化文件大小
     * @param {number} bytes - 文件大小（字节）
     * @returns {string} 格式化后的文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 读取并解析文件
     * @param {File} file - 上传的文件
     * @param {string} fileType - 文件类型
     */
    readAndParseFile(file, fileType) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            this.state.originalDataString = content;
            
            switch (fileType) {
                case 'csv':
                    this.parseCSV(content);
                    break;
                case 'json':
                    this.parseJSON(content);
                    break;
                case 'xls':
                case 'xlsx':
                    this.parseExcel(content);
                    break;
                default:
                    // 尝试自动检测格式
                    if (content.startsWith('{') || content.startsWith('[')) {
                        this.parseJSON(content);
                    } else {
                        // 默认尝试解析为CSV
                        this.parseCSV(content);
                    }
            }
        };
        
        if (fileType === 'xls' || fileType === 'xlsx') {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }
    
    /**
     * 解析CSV数据
     * @param {string} content - CSV内容
     */
    parseCSV(content) {
        // 使用Papa Parse库解析CSV
        Papa.parse(content, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                this.processData(results.data, Object.keys(results.data[0]));
            },
            error: (error) => {
                console.error('CSV解析错误:', error);
                alert('CSV数据解析失败，请检查数据格式');
            }
        });
    }
    
    /**
     * 解析JSON数据
     * @param {string} content - JSON内容
     */
    parseJSON(content) {
        try {
            const jsonData = JSON.parse(content);
            // 检查是否为数组
            if (Array.isArray(jsonData)) {
                if (jsonData.length > 0) {
                    // 如果是对象数组，获取第一个对象的所有键作为列名
                    const columns = Object.keys(jsonData[0]);
                    this.processData(jsonData, columns);
                } else {
                    alert('JSON数据为空数组');
                }
            } else {
                // 尝试处理非数组JSON
                const columns = Object.keys(jsonData);
                const data = [jsonData]; // 转换为数组格式
                this.processData(data, columns);
            }
        } catch (error) {
            console.error('JSON解析错误:', error);
            alert('JSON数据解析失败，请检查数据格式');
        }
    }
    
    /**
     * 解析Excel数据
     * @param {ArrayBuffer} content - Excel文件内容
     */
    parseExcel(content) {
        try {
            // 使用SheetJS库解析Excel
            const workbook = XLSX.read(content, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // 转换为JSON格式
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length > 1) {
                const columns = jsonData[0]; // 第一行作为列名
                const data = jsonData.slice(1).map(row => {
                    const item = {};
                    columns.forEach((col, index) => {
                        item[col] = row[index];
                    });
                    return item;
                });
                
                this.processData(data, columns);
            } else {
                alert('Excel数据为空或格式不正确');
            }
        } catch (error) {
            console.error('Excel解析错误:', error);
            alert('Excel数据解析失败，请检查数据格式');
        }
    }
    
    /**
     * 处理解析后的数据
     * @param {Array} data - 解析后的数据
     * @param {Array} columns - 列名列表
     */
    processData(data, columns) {
        this.state.data = data;
        this.state.dataColumns = columns;
        
        // 更新数据预览
        this.updateDataPreview();
        
        // 显示数据预览面板
        this.elements.dataPreviewPanel.style.display = 'block';
        
        // 更新数据映射字段
        this.updateMappingFields();
    }
    
    /**
     * 处理移除文件
     */
    handleRemoveFile() {
        // 重置文件输入和状态
        this.elements.dataFileInput.value = '';
        this.elements.uploadedFileInfo.style.display = 'none';
        
        // 清除数据状态
        this.state.data = null;
        this.state.dataColumns = [];
        this.state.originalDataString = null;
        
        // 隐藏数据预览面板
        this.elements.dataPreviewPanel.style.display = 'none';
        
        // 重置数据映射字段
        this.resetMappingFields();
    }

    /**
     * 更新数据预览
     */
    updateDataPreview() {
        // 更新数据网格预览
        const dataGrid = this.elements.dataGrid;
        dataGrid.innerHTML = '';
        
        if (!this.state.data || this.state.data.length === 0) {
            dataGrid.innerHTML = '<div class="no-data">无数据可预览</div>';
            return;
        }
        
        // 创建表格
        const table = document.createElement('table');
        table.className = 'data-table';
        
        // 创建表头
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        this.state.dataColumns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // 创建表格内容（最多显示10行）
        const tbody = document.createElement('tbody');
        const maxRows = Math.min(this.state.data.length, 10);
        
        for (let i = 0; i < maxRows; i++) {
            const row = document.createElement('tr');
            const item = this.state.data[i];
            
            this.state.dataColumns.forEach(column => {
                const td = document.createElement('td');
                td.textContent = item[column] !== undefined ? item[column] : '';
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        }
        
        table.appendChild(tbody);
        dataGrid.appendChild(table);
        
        // 如果数据超过10行，显示提示信息
        if (this.state.data.length > 10) {
            const note = document.createElement('div');
            note.className = 'preview-note';
            note.textContent = `显示 10 行数据，共 ${this.state.data.length} 行`;
            dataGrid.appendChild(note);
        }
        
        // 更新数据摘要
        this.updateDataSummary();
    }
    
    /**
     * 更新数据摘要信息
     */
    updateDataSummary() {
        const summary = this.elements.dataSummary;
        summary.innerHTML = '';
        
        if (!this.state.data || this.state.data.length === 0) {
            return;
        }
        
        const totalRows = this.state.data.length;
        const totalColumns = this.state.dataColumns.length;
        
        const summaryText = document.createElement('div');
        summaryText.className = 'summary-item';
        summaryText.innerHTML = `
            <span class="summary-label">数据量:</span>
            <span class="summary-value">${totalRows} 行 × ${totalColumns} 列</span>
        `;
        
        const columnsInfo = document.createElement('div');
        columnsInfo.className = 'summary-item';
        columnsInfo.innerHTML = `
            <span class="summary-label">列名:</span>
            <span class="summary-value">${this.state.dataColumns.join(', ')}</span>
        `;
        
        summary.appendChild(summaryText);
        summary.appendChild(columnsInfo);
    }
    
    /**
     * 处理粘贴数据解析
     */
    handleParseData() {
        const dataStr = this.elements.dataTextarea.value.trim();
        const format = this.elements.dataFormat.value;
        
        if (!dataStr) {
            alert('请输入数据');
            return;
        }
        
        this.state.originalDataString = dataStr;
        this.state.dataFormat = format;
        
        // 根据选择的格式解析数据
        switch (format) {
            case 'csv':
                this.parseCSV(dataStr);
                break;
            case 'json':
                this.parseJSON(dataStr);
                break;
            default:
                alert('不支持的数据格式');
        }
    }
    
    /**
     * 处理清除粘贴的数据
     */
    handleClearData() {
        this.elements.dataTextarea.value = '';
        
        // 清除数据状态
        this.state.data = null;
        this.state.dataColumns = [];
        this.state.originalDataString = null;
        
        // 隐藏数据预览面板
        this.elements.dataPreviewPanel.style.display = 'none';
        
        // 重置数据映射字段
        this.resetMappingFields();
    }
    
    /**
     * 处理示例数据选择
     * @param {Event} event - 点击事件
     */
    handleSampleDataClick(event) {
        const sampleId = event.currentTarget.dataset.sample;
        const sampleData = this.sampleDataConfig[sampleId];
        
        if (!sampleData) return;
        
        this.state.originalDataString = sampleData.data;
        this.state.dataFormat = sampleData.format;
        
        // 根据示例数据格式解析
        switch (sampleData.format) {
            case 'csv':
                this.parseCSV(sampleData.data);
                break;
            case 'json':
                this.parseJSON(sampleData.data);
                break;
            default:
                alert('不支持的示例数据格式');
        }
        
        // 高亮选中的示例数据卡片
        this.elements.sampleCards.forEach(card => {
            card.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
    }
    
    /**
     * 更新数据映射字段
     */
    updateMappingFields() {
        const mappingFields = this.elements.mappingFields;
        mappingFields.innerHTML = '';
        
        if (!this.state.dataColumns || this.state.dataColumns.length === 0) {
            return;
        }
        
        // 根据当前选择的图表类型添加不同的映射选项
        if (this.state.selectedChartType) {
            const chartType = this.state.selectedChartType;
            
            // 创建映射字段容器
            const fieldsets = {};
            const requiredFields = [];
            
            // 根据图表类型定义所需的映射字段
            switch (chartType) {
                case 'bar':
                case 'line':
                case 'area':
                    requiredFields.push(
                        { id: 'x-axis', label: 'X轴 (类别)', type: 'single', required: true },
                        { id: 'y-axis', label: 'Y轴 (数值)', type: 'multiple', required: true }
                    );
                    break;
                case 'stacked-bar':
                    requiredFields.push(
                        { id: 'x-axis', label: 'X轴 (类别)', type: 'single', required: true },
                        { id: 'y-axis', label: 'Y轴 (堆叠数值)', type: 'multiple', required: true },
                        { id: 'group-by', label: '分组依据 (可选)', type: 'single', required: false }
                    );
                    break;
                case 'waterfall':
                    requiredFields.push(
                        { id: 'categories', label: '类别', type: 'single', required: true },
                        { id: 'values', label: '增减值', type: 'single', required: true },
                        { id: 'total', label: '累计字段 (可选)', type: 'single', required: false }
                    );
                    break;
                case 'pie':
                case 'doughnut':
                    requiredFields.push(
                        { id: 'labels', label: '类别标签', type: 'single', required: true },
                        { id: 'values', label: '数值', type: 'single', required: true }
                    );
                    break;
                case 'scatter':
                    requiredFields.push(
                        { id: 'x-axis', label: 'X轴 (数值)', type: 'single', required: true },
                        { id: 'y-axis', label: 'Y轴 (数值)', type: 'single', required: true },
                        { id: 'size', label: '大小 (数值, 可选)', type: 'single', required: false },
                        { id: 'color', label: '颜色分组 (可选)', type: 'single', required: false }
                    );
                    break;
                case 'bubble':
                    requiredFields.push(
                        { id: 'x-axis', label: 'X轴 (数值)', type: 'single', required: true },
                        { id: 'y-axis', label: 'Y轴 (数值)', type: 'single', required: true },
                        { id: 'size', label: '气泡大小 (数值)', type: 'single', required: true },
                        { id: 'color', label: '颜色分组 (可选)', type: 'single', required: false },
                        { id: 'label', label: '气泡标签 (可选)', type: 'single', required: false }
                    );
                    break;
                case 'heatmap':
                    requiredFields.push(
                        { id: 'x-axis', label: 'X轴 (类别)', type: 'single', required: true },
                        { id: 'y-axis', label: 'Y轴 (类别)', type: 'single', required: true },
                        { id: 'value', label: '热力值 (数值)', type: 'single', required: true }
                    );
                    break;
                case 'radar':
                    requiredFields.push(
                        { id: 'categories', label: '类别 (维度)', type: 'single', required: true },
                        { id: 'series', label: '系列', type: 'multiple', required: true }
                    );
                    break;
                case 'polar':
                    requiredFields.push(
                        { id: 'angle', label: '角度 (数值)', type: 'single', required: true },
                        { id: 'radius', label: '半径 (数值)', type: 'single', required: true },
                        { id: 'categories', label: '类别 (可选)', type: 'single', required: false }
                    );
                    break;
                case 'funnel':
                    requiredFields.push(
                        { id: 'stages', label: '阶段名称', type: 'single', required: true },
                        { id: 'values', label: '数值', type: 'single', required: true },
                        { id: 'comparison', label: '对比数值 (可选)', type: 'single', required: false }
                    );
                    break;
                case 'boxplot':
                    requiredFields.push(
                        { id: 'categories', label: '类别', type: 'single', required: true },
                        { id: 'min', label: '最小值', type: 'single', required: true },
                        { id: 'q1', label: '第一四分位数', type: 'single', required: true },
                        { id: 'median', label: '中位数', type: 'single', required: true },
                        { id: 'q3', label: '第三四分位数', type: 'single', required: true },
                        { id: 'max', label: '最大值', type: 'single', required: true },
                        { id: 'outliers', label: '异常值 (可选)', type: 'single', required: false }
                    );
                    // 添加自动计算按钮
                    requiredFields.push({
                        id: 'auto-calculate', 
                        label: '自动计算统计值', 
                        type: 'button', 
                        buttonText: '从数值列自动计算',
                        required: false
                    });
                    break;
            }
            
            // 创建映射字段HTML
            requiredFields.forEach(field => {
                const fieldset = document.createElement('fieldset');
                fieldset.className = 'mapping-fieldset';
                
                const legend = document.createElement('legend');
                legend.textContent = field.label;
                if (field.required) {
                    legend.innerHTML += ' <span class="required">*</span>';
                }
                fieldset.appendChild(legend);
                
                if (field.type === 'single') {
                    // 单选下拉框
                    const select = document.createElement('select');
                    select.id = `map-${field.id}`;
                    select.className = 'mapping-select';
                    select.required = field.required;
                    
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = '-- 选择字段 --';
                    defaultOption.disabled = true;
                    defaultOption.selected = true;
                    select.appendChild(defaultOption);
                    
                    this.state.dataColumns.forEach(column => {
                        const option = document.createElement('option');
                        option.value = column;
                        option.textContent = column;
                        select.appendChild(option);
                    });
                    
                    fieldset.appendChild(select);
                } else if (field.type === 'multiple') {
                    // 多选列表框
                    const multiSelect = document.createElement('div');
                    multiSelect.className = 'multi-select';
                    
                    this.state.dataColumns.forEach(column => {
                        const checkboxContainer = document.createElement('div');
                        checkboxContainer.className = 'checkbox-container';
                        
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.id = `map-${field.id}-${column}`;
                        checkbox.value = column;
                        checkbox.dataset.group = field.id;
                        
                        const label = document.createElement('label');
                        label.htmlFor = `map-${field.id}-${column}`;
                        label.textContent = column;
                        
                        checkboxContainer.appendChild(checkbox);
                        checkboxContainer.appendChild(label);
                        multiSelect.appendChild(checkboxContainer);
                    });
                    
                    fieldset.appendChild(multiSelect);
                } else if (field.type === 'button') {
                    // 添加按钮控件
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.id = `map-${field.id}`;
                    button.className = 'mapping-button';
                    button.textContent = field.buttonText || '执行';
                    button.addEventListener('click', () => {
                        if (field.id === 'auto-calculate') {
                            this.autoCalculateBoxPlotStats();
                        }
                    });
                    
                    fieldset.appendChild(button);
                }
                
                mappingFields.appendChild(fieldset);
                fieldsets[field.id] = fieldset;
            });
            
            // 为一些特殊图表类型添加辅助提示
            if (chartType === 'stacked-bar' || chartType === 'waterfall' || chartType === 'boxplot') {
                const helpTip = document.createElement('div');
                helpTip.className = 'mapping-help-tip';
                
                if (chartType === 'stacked-bar') {
                    helpTip.textContent = '堆叠柱状图会将Y轴系列的值在同一X轴类别上叠加显示。';
                } else if (chartType === 'waterfall') {
                    helpTip.textContent = '瀑布图显示数值的累计变化，增加值向上，减少值向下。';
                } else if (chartType === 'boxplot') {
                    helpTip.textContent = '箱线图显示数据分布情况，您可以选择分别映射各统计值字段，或从一个数值列自动计算。';
                }
                
                mappingFields.appendChild(helpTip);
            }
        } else {
            // 如果未选择图表类型，显示提示信息
            const notice = document.createElement('div');
            notice.className = 'mapping-notice';
            notice.textContent = '请先选择图表类型';
            mappingFields.appendChild(notice);
        }
    }
    
    /**
     * 自动计算箱线图统计值
     * 从用户选择的一个数值列自动计算箱线图所需的统计值
     */
    autoCalculateBoxPlotStats() {
        // 创建临时模态框
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => document.body.removeChild(modal);
        
        const title = document.createElement('h3');
        title.textContent = '自动计算箱线图统计值';
        
        const form = document.createElement('div');
        form.className = 'auto-calc-form';
        
        // 创建数值列选择下拉框
        const selectContainer = document.createElement('div');
        selectContainer.className = 'form-group';
        
        const selectLabel = document.createElement('label');
        selectLabel.textContent = '选择数值列:';
        selectLabel.htmlFor = 'boxplot-value-column';
        
        const select = document.createElement('select');
        select.id = 'boxplot-value-column';
        select.required = true;
        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- 选择数值列 --';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);
        
        // 只添加数值型列
        this.state.dataColumns.forEach(column => {
            // 检查该列的第一个非null值是否为数字
            const isNumeric = this.state.data.some(row => {
                const value = row[column];
                return value !== null && value !== undefined && !isNaN(value);
            });
            
            if (isNumeric) {
                const option = document.createElement('option');
                option.value = column;
                option.textContent = column;
                select.appendChild(option);
            }
        });
        
        selectContainer.appendChild(selectLabel);
        selectContainer.appendChild(select);
        
        // 创建分组依据列选择下拉框
        const groupContainer = document.createElement('div');
        groupContainer.className = 'form-group';
        
        const groupLabel = document.createElement('label');
        groupLabel.textContent = '分组依据 (可选):';
        groupLabel.htmlFor = 'boxplot-group-column';
        
        const groupSelect = document.createElement('select');
        groupSelect.id = 'boxplot-group-column';
        
        const groupDefaultOption = document.createElement('option');
        groupDefaultOption.value = '';
        groupDefaultOption.textContent = '-- 不分组 --';
        groupSelect.appendChild(groupDefaultOption);
        
        this.state.dataColumns.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = column;
            groupSelect.appendChild(option);
        });
        
        groupContainer.appendChild(groupLabel);
        groupContainer.appendChild(groupSelect);
        
        // 创建计算按钮
        const calcBtn = document.createElement('button');
        calcBtn.textContent = '计算并应用';
        calcBtn.onclick = () => {
            const valueColumn = select.value;
            const groupColumn = groupSelect.value;
            
            if (!valueColumn) {
                alert('请选择一个数值列');
                return;
            }
            
            this.calculateBoxPlotStats(valueColumn, groupColumn);
            document.body.removeChild(modal);
        };
        
        // 组装模态框
        form.appendChild(selectContainer);
        form.appendChild(groupContainer);
        form.appendChild(calcBtn);
        
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(form);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
    }
    
    /**
     * 计算箱线图统计值
     * @param {string} valueColumn - 数值列名
     * @param {string} groupColumn - 分组列名（可选）
     */
    calculateBoxPlotStats(valueColumn, groupColumn) {
        // 如果选择了分组列，则为每个分组计算统计值
        if (groupColumn && groupColumn !== '') {
            // 获取所有唯一的分组值
            const groups = [...new Set(this.state.data.map(item => item[groupColumn]))];
            
            // 为每个分组计算统计值
            const groupedStats = groups.map(group => {
                // 过滤出该分组的所有数值
                const values = this.state.data
                    .filter(item => item[groupColumn] === group)
                    .map(item => parseFloat(item[valueColumn]))
                    .filter(val => !isNaN(val))
                    .sort((a, b) => a - b);
                
                if (values.length === 0) return null;
                
                // 计算统计值
                const stats = this.calculateStats(values);
                return {
                    group,
                    ...stats
                };
            }).filter(item => item !== null);
            
            // 创建新的数据集
            const newData = groupedStats.map(item => ({
                [groupColumn]: item.group,
                ['最小值']: item.min,
                ['第一四分位数']: item.q1,
                ['中位数']: item.median,
                ['第三四分位数']: item.q3,
                ['最大值']: item.max,
                ['均值']: item.mean,
                ['异常值']: item.outliers.join(', ')
            }));
            
            // 更新状态
            this.state.data = newData;
            this.state.dataColumns = Object.keys(newData[0]);
            
            // 自动选择映射字段
            this.autoSelectBoxplotFields(groupColumn);
            
            // 更新数据预览
            this.updateDataPreview();
        } else {
            // 获取所有数值
            const values = this.state.data
                .map(item => parseFloat(item[valueColumn]))
                .filter(val => !isNaN(val))
                .sort((a, b) => a - b);
            
            if (values.length === 0) {
                alert('所选列不包含有效数值');
                return;
            }
            
            // 计算统计值
            const stats = this.calculateStats(values);
            
            // 创建一个新的数据项
            const newData = [{
                '类别': valueColumn,
                '最小值': stats.min,
                '第一四分位数': stats.q1,
                '中位数': stats.median,
                '第三四分位数': stats.q3,
                '最大值': stats.max,
                '均值': stats.mean,
                '异常值': stats.outliers.join(', ')
            }];
            
            // 更新状态
            this.state.data = newData;
            this.state.dataColumns = Object.keys(newData[0]);
            
            // 自动选择映射字段
            this.autoSelectBoxplotFields('类别');
            
            // 更新数据预览
            this.updateDataPreview();
        }
    }
    
    /**
     * 自动选择箱线图映射字段
     * @param {string} categoryField - 类别字段名 
     */
    autoSelectBoxplotFields(categoryField) {
        const categorySelect = document.getElementById('map-categories');
        const minSelect = document.getElementById('map-min');
        const q1Select = document.getElementById('map-q1');
        const medianSelect = document.getElementById('map-median');
        const q3Select = document.getElementById('map-q3');
        const maxSelect = document.getElementById('map-max');
        const outliersSelect = document.getElementById('map-outliers');
        
        if (categorySelect) categorySelect.value = categoryField;
        if (minSelect) minSelect.value = '最小值';
        if (q1Select) q1Select.value = '第一四分位数';
        if (medianSelect) medianSelect.value = '中位数';
        if (q3Select) q3Select.value = '第三四分位数';
        if (maxSelect) maxSelect.value = '最大值';
        if (outliersSelect) outliersSelect.value = '异常值';
    }
    
    /**
     * 计算统计值
     * @param {Array<number>} values - 排序后的数值数组
     * @returns {Object} 包含统计值的对象
     */
    calculateStats(values) {
        const n = values.length;
        
        // 计算四分位数
        const getQuantile = (arr, q) => {
            const pos = (arr.length - 1) * q;
            const base = Math.floor(pos);
            const rest = pos - base;
            if (arr[base + 1] !== undefined) {
                return arr[base] + rest * (arr[base + 1] - arr[base]);
            } else {
                return arr[base];
            }
        };
        
        const min = values[0];
        const max = values[n - 1];
        const q1 = getQuantile(values, 0.25);
        const median = getQuantile(values, 0.5);
        const q3 = getQuantile(values, 0.75);
        const iqr = q3 - q1;
        
        // 计算均值
        const mean = values.reduce((sum, val) => sum + val, 0) / n;
        
        // 检测异常值 (超出1.5 * IQR范围的值)
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        const outliers = values.filter(val => val < lowerBound || val > upperBound);
        
        return {
            min: min,
            q1: q1,
            median: median,
            q3: q3,
            max: max,
            mean: mean,
            outliers: outliers
        };
    }
    
    /**
     * 处理图表类型选择
     * @param {Event} event - 点击事件
     */
    handleChartTypeSelect(event) {
        const chartType = event.currentTarget.dataset.chartType;
        
        // 更新选中状态
        this.elements.chartTypeCards.forEach(card => {
            card.classList.remove('active');
        });
        event.currentTarget.classList.add('active');
        
        // 更新状态
        this.state.selectedChartType = chartType;
        
        // 更新数据映射字段
        this.updateMappingFields();
        
        // 初始化图表样式选项
        this.initChartStyleOptions(chartType);
    }
    
    /**
     * 初始化图表样式选项
     * @param {string} chartType - 图表类型
     */
    initChartStyleOptions(chartType) {
        // 根据图表类型启用或禁用某些选项
        switch (chartType) {
            case 'bar':
                this.enableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.enableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'stacked-bar':
                this.enableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.enableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'waterfall':
                this.enableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.enableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'line':
            case 'area':
                this.enableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'pie':
            case 'doughnut':
                this.disableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'scatter':
            case 'bubble':
                this.enableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.disableElement(this.elements.showDataLabels);
                break;
                
            case 'heatmap':
                this.enableElement(this.elements.showGrid);
                this.disableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'radar':
                this.disableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'polar':
                this.disableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'funnel':
                this.disableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
                
            case 'boxplot':
                this.enableElement(this.elements.showGrid);
                this.enableElement(this.elements.showLegend);
                this.disableElement(this.elements.labelRotation);
                this.enableElement(this.elements.showDataLabels);
                break;
        }
    }
    
    /**
     * 启用元素
     * @param {HTMLElement} element - DOM元素
     */
    enableElement(element) {
        if (element) {
            element.disabled = false;
            if (element.parentElement) {
                element.parentElement.classList.remove('disabled');
            }
        }
    }
    
    /**
     * 禁用元素
     * @param {HTMLElement} element - DOM元素
     */
    disableElement(element) {
        if (element) {
            element.disabled = true;
            if (element.parentElement) {
                element.parentElement.classList.add('disabled');
            }
        }
    }
    
    /**
     * 处理手风琴面板切换
     * @param {Event} event - 点击事件
     */
    handleAccordionToggle(event) {
        const header = event.currentTarget;
        const item = header.parentElement;
        
        if (item.classList.contains('active')) {
            item.classList.remove('active');
        } else {
            // 关闭其他面板，只保持一个打开
            this.elements.accordionItems.forEach(accordionItem => {
                accordionItem.classList.remove('active');
            });
            item.classList.add('active');
        }
    }
    
    /**
     * 处理范围滑块值变化
     * @param {Event} event - 输入事件
     */
    handleRangeSliderChange(event) {
        const slider = event.target;
        const valueDisplay = document.getElementById(`${slider.id}Value`);
        
        if (valueDisplay) {
            valueDisplay.textContent = slider.value;
        }
    }
    
    /**
     * 处理数据编辑
     */
    handleEditData() {
        // 显示编辑数据模态框
        this.elements.dataEditModal.style.display = 'block';
        
        // 根据当前数据格式设置编辑区内容
        if (this.state.originalDataString) {
            this.elements.editDataTextarea.value = this.state.originalDataString;
        } else if (this.state.data && this.state.data.length > 0) {
            // 如果没有原始数据字符串，则根据当前格式重新转换
            let dataString = '';
            
            if (this.state.dataFormat === 'csv') {
                // 生成CSV格式字符串
                const header = this.state.dataColumns.join(',');
                const rows = this.state.data.map(item => 
                    this.state.dataColumns.map(col => item[col] !== undefined ? item[col] : '').join(',')
                );
                dataString = [header, ...rows].join('\n');
            } else if (this.state.dataFormat === 'json') {
                // 生成JSON格式字符串
                dataString = JSON.stringify(this.state.data, null, 2);
            }
            
            this.elements.editDataTextarea.value = dataString;
        }
    }
    
    /**
     * 处理关闭模态框
     */
    handleCloseModal() {
        this.elements.dataEditModal.style.display = 'none';
    }
    
    /**
     * 处理取消编辑
     */
    handleCancelEdit() {
        this.elements.dataEditModal.style.display = 'none';
    }
    
    /**
     * 处理应用编辑
     */
    handleApplyEdit() {
        const editedData = this.elements.editDataTextarea.value.trim();
        
        if (!editedData) {
            alert('编辑后的数据不能为空');
            return;
        }
        
        // 更新原始数据字符串
        this.state.originalDataString = editedData;
        
        // 根据当前格式重新解析
        switch (this.state.dataFormat) {
            case 'csv':
                this.parseCSV(editedData);
                break;
            case 'json':
                this.parseJSON(editedData);
                break;
            default:
                alert('不支持的数据格式');
                break;
        }
        
        // 关闭模态框
        this.elements.dataEditModal.style.display = 'none';
    }

    /**
     * 处理生成图表
     */
    handleGenerateChart() {
        // 检查是否有数据和选择了图表类型
        if (!this.state.data || this.state.data.length === 0) {
            alert('请先导入或粘贴数据');
            return;
        }
        
        if (!this.state.selectedChartType) {
            alert('请选择图表类型');
            return;
        }
        
        // 收集数据映射配置
        const mappingConfig = this.collectMappingConfig();
        if (!mappingConfig) {
            return; // 映射配置验证失败
        }
        
        // 收集图表样式配置
        const styleConfig = this.collectStyleConfig();
        
        // 生成图表配置
        const chartConfig = this.generateChartConfig(mappingConfig, styleConfig);
        
        // 渲染图表
        this.renderChart(chartConfig);
        
        // 显示图表预览面板
        this.elements.chartPreviewPanel.style.display = 'block';
        
        // 滚动到图表预览区域
        this.elements.chartPreviewPanel.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * 收集数据映射配置
     * @returns {Object|null} 数据映射配置或失败时返回null
     */
    collectMappingConfig() {
        const config = {};
        const chartType = this.state.selectedChartType;
        
        // 根据图表类型收集必要的映射字段
        switch (chartType) {
            case 'bar':
            case 'line':
            case 'area':
                // 获取X轴字段
                const xAxisField = document.getElementById('map-x-axis');
                if (!xAxisField || !xAxisField.value) {
                    alert('请选择X轴字段');
                    return null;
                }
                config.xAxis = xAxisField.value;
                
                // 获取Y轴字段（可多选）
                const yAxisCheckboxes = document.querySelectorAll('input[data-group="y-axis"]:checked');
                if (yAxisCheckboxes.length === 0) {
                    alert('请选择至少一个Y轴字段');
                    return null;
                }
                config.yAxis = Array.from(yAxisCheckboxes).map(checkbox => checkbox.value);
                break;
                
            case 'pie':
            case 'doughnut':
                // 获取标签字段
                const labelsField = document.getElementById('map-labels');
                if (!labelsField || !labelsField.value) {
                    alert('请选择类别标签字段');
                    return null;
                }
                config.labels = labelsField.value;
                
                // 获取数值字段
                const valuesField = document.getElementById('map-values');
                if (!valuesField || !valuesField.value) {
                    alert('请选择数值字段');
                    return null;
                }
                config.values = valuesField.value;
                break;
                
            case 'scatter':
                // 获取X轴字段
                const scatterXField = document.getElementById('map-x-axis');
                if (!scatterXField || !scatterXField.value) {
                    alert('请选择X轴字段');
                    return null;
                }
                config.xAxis = scatterXField.value;
                
                // 获取Y轴字段
                const scatterYField = document.getElementById('map-y-axis');
                if (!scatterYField || !scatterYField.value) {
                    alert('请选择Y轴字段');
                    return null;
                }
                config.yAxis = scatterYField.value;
                
                // 获取可选字段
                const sizeField = document.getElementById('map-size');
                if (sizeField && sizeField.value) {
                    config.size = sizeField.value;
                }
                
                const colorField = document.getElementById('map-color');
                if (colorField && colorField.value) {
                    config.color = colorField.value;
                }
                break;
                
            case 'heatmap':
                // 获取X轴字段
                const heatmapXField = document.getElementById('map-x-axis');
                if (!heatmapXField || !heatmapXField.value) {
                    alert('请选择X轴字段');
                    return null;
                }
                config.xAxis = heatmapXField.value;
                
                // 获取Y轴字段
                const heatmapYField = document.getElementById('map-y-axis');
                if (!heatmapYField || !heatmapYField.value) {
                    alert('请选择Y轴字段');
                    return null;
                }
                config.yAxis = heatmapYField.value;
                
                // 获取热力值字段
                const valueField = document.getElementById('map-value');
                if (!valueField || !valueField.value) {
                    alert('请选择热力值字段');
                    return null;
                }
                config.value = valueField.value;
                break;
                
            case 'radar':
                // 获取类别字段
                const categoriesField = document.getElementById('map-categories');
                if (!categoriesField || !categoriesField.value) {
                    alert('请选择类别字段');
                    return null;
                }
                config.categories = categoriesField.value;
                
                // 获取系列字段（可多选）
                const seriesCheckboxes = document.querySelectorAll('input[data-group="series"]:checked');
                if (seriesCheckboxes.length === 0) {
                    alert('请选择至少一个系列字段');
                    return null;
                }
                config.series = Array.from(seriesCheckboxes).map(checkbox => checkbox.value);
                break;
        }
        
        return config;
    }
    
    /**
     * 收集图表样式配置
     * @returns {Object} 样式配置对象
     */
    collectStyleConfig() {
        return {
            title: this.elements.chartTitle.value,
            theme: this.elements.chartTheme.value,
            backgroundColor: this.elements.chartBackground.value,
            xAxisName: this.elements.xAxisName.value,
            yAxisName: this.elements.yAxisName.value,
            showGrid: this.elements.showGrid.checked,
            showLegend: this.elements.showLegend.checked,
            labelRotation: parseInt(this.elements.labelRotation.value),
            fontSize: parseInt(this.elements.fontSize.value),
            showDataLabels: this.elements.showDataLabels.checked,
            enableAnimation: this.elements.enableAnimation.checked,
            animationDuration: parseInt(this.elements.animationDuration.value),
            enableZoom: this.elements.enableZoom.checked
        };
    }
    
    /**
     * 生成图表配置
     * @param {Object} mappingConfig - 数据映射配置
     * @param {Object} styleConfig - 样式配置
     * @returns {Object} 图表配置对象
     */
    generateChartConfig(mappingConfig, styleConfig) {
        const chartType = this.state.selectedChartType;
        const data = this.state.data;
        
        // 基础配置
        const config = {
            type: chartType === 'stacked-bar' ? 'bar' : 
                  chartType === 'polar' ? 'polarArea' :
                  chartType === 'bubble' ? 'bubble' :
                  chartType,
            data: {},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: !!styleConfig.title,
                        text: styleConfig.title,
                        font: {
                            size: styleConfig.fontSize + 4
                        }
                    },
                    legend: {
                        display: styleConfig.showLegend,
                        position: 'top',
                        labels: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        bodyFont: {
                            size: styleConfig.fontSize
                        },
                        titleFont: {
                            size: styleConfig.fontSize
                        }
                    },
                    datalabels: {
                        display: styleConfig.showDataLabels,
                        color: 'white',
                        font: {
                            size: styleConfig.fontSize - 2,
                            weight: 'bold'
                        },
                        formatter: (value) => {
                            if (typeof value === 'number') {
                                // 根据数值大小自动格式化
                                if (value >= 1000000) {
                                    return (value / 1000000).toFixed(1) + 'M';
                                } else if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'K';
                                } else if (value % 1 !== 0) {
                                    return value.toFixed(1);
                                }
                                return value;
                            }
                            return value;
                        }
                    }
                },
                animation: {
                    duration: styleConfig.enableAnimation ? styleConfig.animationDuration : 0
                }
            }
        };
        
        // 根据主题设置颜色
        const colorPalettes = {
            default: ['#36a2eb', '#ff6384', '#4bc0c0', '#ff9f40', '#9966ff', '#ffcd56', '#c9cbcf'],
            pastel: ['#83af9b', '#c8c8a9', '#f9cdad', '#fc9d9a', '#fe4365', '#a8e6cf', '#dcedc1'],
            bright: ['#1565c0', '#f44336', '#2e7d32', '#ff9800', '#9c27b0', '#fdd835', '#00acc1'],
            dark: ['#1a237e', '#880e4f', '#004d40', '#e65100', '#311b92', '#bf360c', '#01579b']
        };
        
        const colorPalette = colorPalettes[styleConfig.theme] || colorPalettes.default;
        
        // 背景色
        if (styleConfig.backgroundColor) {
            config.options.plugins.title.color = this.getContrastColor(styleConfig.backgroundColor);
            config.options.plugins.legend.labels.color = this.getContrastColor(styleConfig.backgroundColor);
            config.options.plugins.tooltip.backgroundColor = this.adjustColorOpacity(this.getContrastColor(styleConfig.backgroundColor), 0.8);
            config.options.plugins.tooltip.titleColor = styleConfig.backgroundColor;
            config.options.plugins.tooltip.bodyColor = styleConfig.backgroundColor;
        }
        
        // 根据图表类型设置特定配置
        switch (chartType) {
            case 'bar':
            case 'line':
            case 'area':
                // 设置X轴数据
                const labels = [...new Set(data.map(item => item[mappingConfig.xAxis]))];
                
                // 设置数据集
                const datasets = mappingConfig.yAxis.map((field, index) => {
                    // 计算每个系列的数据
                    const seriesData = labels.map(label => {
                        // 找到匹配X轴值的所有记录
                        const records = data.filter(item => item[mappingConfig.xAxis] === label);
                        
                        if (records.length === 0) return null;
                        
                        // 如果有多条记录，计算平均值
                        if (records.length > 1) {
                            const sum = records.reduce((acc, cur) => {
                                const val = cur[field];
                                return acc + (typeof val === 'number' ? val : 0);
                            }, 0);
                            return sum / records.length;
                        }
                        
                        return records[0][field];
                    });
                    
                    // 创建数据集配置
                    const datasetConfig = {
                        label: field,
                        data: seriesData,
                        backgroundColor: this.adjustColorOpacity(colorPalette[index % colorPalette.length], chartType === 'bar' ? 0.8 : 0.5),
                        borderColor: colorPalette[index % colorPalette.length],
                        borderWidth: chartType === 'bar' ? 1 : 2
                    };
                    
                    // 针对线图和面积图的特定设置
                    if (chartType === 'line') {
                        datasetConfig.fill = false;
                        datasetConfig.tension = 0.3;
                    } else if (chartType === 'area') {
                        datasetConfig.fill = true;
                        datasetConfig.tension = 0.3;
                    }
                    
                    return datasetConfig;
                });
                
                config.data = {
                    labels: labels,
                    datasets: datasets
                };
                
                // 设置坐标轴
                config.options.scales = {
                    x: {
                        title: {
                            display: !!styleConfig.xAxisName,
                            text: styleConfig.xAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            rotation: styleConfig.labelRotation,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    },
                    y: {
                        title: {
                            display: !!styleConfig.yAxisName,
                            text: styleConfig.yAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                
                // 启用缩放
                if (styleConfig.enableZoom) {
                    config.options.plugins.zoom = {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    };
                }
                break;
                
            case 'stacked-bar':
                // 设置X轴数据
                const stackedLabels = [...new Set(data.map(item => item[mappingConfig.xAxis]))];
                
                // 设置数据集
                const stackedDatasets = mappingConfig.yAxis.map((field, index) => {
                    // 计算每个系列的数据
                    const seriesData = stackedLabels.map(label => {
                        // 找到匹配X轴值的所有记录
                        const records = data.filter(item => item[mappingConfig.xAxis] === label);
                        
                        if (records.length === 0) return null;
                        
                        // 如果有多条记录，计算总和
                        if (records.length > 1) {
                            return records.reduce((acc, cur) => {
                                const val = cur[field];
                                return acc + (typeof val === 'number' ? val : 0);
                            }, 0);
                        }
                        
                        return records[0][field];
                    });
                    
                    // 创建数据集配置
                    return {
                        label: field,
                        data: seriesData,
                        backgroundColor: this.adjustColorOpacity(colorPalette[index % colorPalette.length], 0.8),
                        borderColor: colorPalette[index % colorPalette.length],
                        borderWidth: 1
                    };
                });
                
                config.data = {
                    labels: stackedLabels,
                    datasets: stackedDatasets
                };
                
                // 堆叠柱状图特有设置
                config.options.scales = {
                    x: {
                        stacked: true,
                        title: {
                            display: !!styleConfig.xAxisName,
                            text: styleConfig.xAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            rotation: styleConfig.labelRotation,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    },
                    y: {
                        stacked: true,
                        title: {
                            display: !!styleConfig.yAxisName,
                            text: styleConfig.yAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                
                // 启用缩放
                if (styleConfig.enableZoom) {
                    config.options.plugins.zoom = {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    };
                }
                break;
                
            case 'waterfall':
                // 获取分类和数值
                const waterfallCategories = data.map(item => item[mappingConfig.categories]);
                const values = data.map(item => item[mappingConfig.values]);
                
                // 计算累计值
                let cumulative = 0;
                const cumulativeValues = [];
                const positiveValues = [];
                const negativeValues = [];
                
                values.forEach(value => {
                    cumulative += value;
                    cumulativeValues.push(cumulative);
                    
                    if (value >= 0) {
                        positiveValues.push(value);
                        negativeValues.push(null);
                    } else {
                        positiveValues.push(null);
                        negativeValues.push(value);
                    }
                });
                
                config.type = 'bar';
                config.data = {
                    labels: waterfallCategories,
                    datasets: [
                        {
                            label: '增加',
                            data: positiveValues,
                            backgroundColor: this.adjustColorOpacity(colorPalette[1], 0.8),
                            borderColor: colorPalette[1],
                            borderWidth: 1
                        },
                        {
                            label: '减少',
                            data: negativeValues,
                            backgroundColor: this.adjustColorOpacity(colorPalette[0], 0.8),
                            borderColor: colorPalette[0],
                            borderWidth: 1
                        },
                        {
                            label: '累计',
                            data: cumulativeValues,
                            type: 'line',
                            backgroundColor: 'transparent',
                            borderColor: colorPalette[2],
                            borderWidth: 2,
                            pointBackgroundColor: colorPalette[2]
                        }
                    ]
                };
                
                // 瀑布图特有设置
                config.options.scales = {
                    x: {
                        title: {
                            display: !!styleConfig.xAxisName,
                            text: styleConfig.xAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            rotation: styleConfig.labelRotation,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    },
                    y: {
                        title: {
                            display: !!styleConfig.yAxisName,
                            text: styleConfig.yAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                break;
                
            case 'pie':
            case 'doughnut':
                // 获取唯一标签
                const pieLabels = [...new Set(data.map(item => item[mappingConfig.labels]))];
                
                // 对应每个标签的数值
                const pieValues = pieLabels.map(label => {
                    // 找到匹配标签的所有记录
                    const records = data.filter(item => item[mappingConfig.labels] === label);
                    
                    if (records.length === 0) return 0;
                    
                    // 如果有多条记录，计算总和
                    if (records.length > 1) {
                        return records.reduce((acc, cur) => {
                            const val = cur[mappingConfig.values];
                            return acc + (typeof val === 'number' ? val : 0);
                        }, 0);
                    }
                    
                    return records[0][mappingConfig.values] || 0;
                });
                
                // 颜色
                const pieColors = pieLabels.map((_, index) => 
                    colorPalette[index % colorPalette.length]
                );
                
                config.data = {
                    labels: pieLabels,
                    datasets: [{
                        data: pieValues,
                        backgroundColor: pieColors,
                        borderColor: styleConfig.backgroundColor || 'white',
                        borderWidth: 1
                    }]
                };
                
                // 圆环图特殊设置
                if (chartType === 'doughnut') {
                    config.options.cutout = '50%';
                }
                
                // 调整数据标签
                config.options.plugins.datalabels = {
                    display: styleConfig.showDataLabels,
                    color: 'white',
                    font: {
                        size: styleConfig.fontSize - 2,
                        weight: 'bold'
                    },
                    formatter: (value, ctx) => {
                        const label = ctx.chart.data.labels[ctx.dataIndex];
                        const percentage = Math.round((value / pieValues.reduce((a, b) => a + b, 0)) * 100);
                        return `${label}: ${percentage}%`;
                    }
                };
                break;
                
            case 'scatter':
                // 准备数据点
                const scatterData = data.map(item => ({
                    x: item[mappingConfig.xAxis],
                    y: item[mappingConfig.yAxis]
                }));
                
                config.data = {
                    datasets: [{
                        label: '散点',
                        data: scatterData,
                        backgroundColor: colorPalette[0],
                        borderColor: colorPalette[0],
                        pointRadius: 6,
                        pointHoverRadius: 8
                    }]
                };
                
                // 如果指定了颜色分组
                if (mappingConfig.color) {
                    // 获取唯一分组
                    const colorGroups = [...new Set(data.map(item => item[mappingConfig.color]))];
                    
                    // 为每个分组创建数据集
                    config.data.datasets = colorGroups.map((group, index) => {
                        const groupData = data.filter(item => item[mappingConfig.color] === group)
                            .map(item => ({
                                x: item[mappingConfig.xAxis],
                                y: item[mappingConfig.yAxis]
                            }));
                        
                        return {
                            label: group,
                            data: groupData,
                            backgroundColor: colorPalette[index % colorPalette.length],
                            borderColor: colorPalette[index % colorPalette.length],
                            pointRadius: 6,
                            pointHoverRadius: 8
                        };
                    });
                }
                
                // 散点图坐标轴设置
                config.options.scales = {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: !!styleConfig.xAxisName,
                            text: styleConfig.xAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    },
                    y: {
                        title: {
                            display: !!styleConfig.yAxisName,
                            text: styleConfig.yAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                
                // 启用缩放
                if (styleConfig.enableZoom) {
                    config.options.plugins.zoom = {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    };
                }
                break;
                
            case 'bubble':
                // 准备气泡数据
                const bubbleData = data.map(item => ({
                    x: item[mappingConfig.xAxis],
                    y: item[mappingConfig.yAxis],
                    r: this.normalizeRadius(item[mappingConfig.size])
                }));
                
                config.data = {
                    datasets: [{
                        label: '气泡',
                        data: bubbleData,
                        backgroundColor: this.adjustColorOpacity(colorPalette[0], 0.7),
                        borderColor: colorPalette[0],
                        borderWidth: 1
                    }]
                };
                
                // 如果指定了颜色分组
                if (mappingConfig.color) {
                    // 获取唯一分组
                    const colorGroups = [...new Set(data.map(item => item[mappingConfig.color]))];
                    
                    // 为每个分组创建数据集
                    config.data.datasets = colorGroups.map((group, index) => {
                        const groupData = data.filter(item => item[mappingConfig.color] === group)
                            .map(item => ({
                                x: item[mappingConfig.xAxis],
                                y: item[mappingConfig.yAxis],
                                r: this.normalizeRadius(item[mappingConfig.size])
                            }));
                        
                        return {
                            label: group,
                            data: groupData,
                            backgroundColor: this.adjustColorOpacity(colorPalette[index % colorPalette.length], 0.7),
                            borderColor: colorPalette[index % colorPalette.length],
                            borderWidth: 1
                        };
                    });
                }
                
                // 气泡图坐标轴设置
                config.options.scales = {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: {
                            display: !!styleConfig.xAxisName,
                            text: styleConfig.xAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    },
                    y: {
                        title: {
                            display: !!styleConfig.yAxisName,
                            text: styleConfig.yAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                
                // 气泡图标签设置
                if (mappingConfig.label) {
                    config.options.plugins.datalabels = {
                        display: styleConfig.showDataLabels,
                        color: '#333',
                        font: {
                            size: styleConfig.fontSize - 2,
                            weight: 'bold'
                        },
                        formatter: (_, ctx) => {
                            const index = ctx.dataIndex;
                            const item = data[index];
                            return item ? item[mappingConfig.label] : '';
                        },
                        anchor: 'center',
                        align: 'center'
                    };
                }
                
                // 启用缩放
                if (styleConfig.enableZoom) {
                    config.options.plugins.zoom = {
                        pan: {
                            enabled: true,
                            mode: 'xy'
                        },
                        zoom: {
                            wheel: {
                                enabled: true
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy'
                        }
                    };
                }
                break;
                
            case 'polar':
                // 获取数据
                const polarLabels = data.map(item => item[mappingConfig.categories] || '');
                const polarValues = data.map(item => item[mappingConfig.radius]);
                
                config.data = {
                    labels: polarLabels,
                    datasets: [{
                        label: mappingConfig.radius,
                        data: polarValues,
                        backgroundColor: polarLabels.map((_, index) => 
                            this.adjustColorOpacity(colorPalette[index % colorPalette.length], 0.7)
                        ),
                        borderColor: polarLabels.map((_, index) => 
                            colorPalette[index % colorPalette.length]
                        ),
                        borderWidth: 1
                    }]
                };
                
                // 极坐标图设置
                config.options.scales = {
                    r: {
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            },
                            backdropColor: 'transparent'
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                break;
                
            case 'funnel':
                // 获取阶段和值
                const stages = data.map(item => item[mappingConfig.stages]);
                const funnelValues = data.map(item => item[mappingConfig.values]);
                
                // 创建漏斗图 (使用特殊配置的水平柱状图)
                config.type = 'bar';
                config.data = {
                    labels: stages,
                    datasets: [{
                        label: mappingConfig.values,
                        data: funnelValues,
                        backgroundColor: stages.map((_, index) => 
                            this.adjustColorOpacity(colorPalette[index % colorPalette.length], 0.8)
                        ),
                        borderColor: stages.map((_, index) => 
                            colorPalette[index % colorPalette.length]
                        ),
                        borderWidth: 1
                    }]
                };
                
                // 如果有对比数值
                if (mappingConfig.comparison) {
                    const comparisonValues = data.map(item => item[mappingConfig.comparison]);
                    config.data.datasets.push({
                        label: mappingConfig.comparison,
                        data: comparisonValues,
                        backgroundColor: stages.map((_, index) => 
                            this.adjustColorOpacity(colorPalette[(index + 3) % colorPalette.length], 0.5)
                        ),
                        borderColor: stages.map((_, index) => 
                            colorPalette[(index + 3) % colorPalette.length]
                        ),
                        borderWidth: 1
                    });
                }
                
                // 漏斗图特殊设置 (水平柱状图)
                config.options.indexAxis = 'y';
                config.options.scales = {
                    x: {
                        title: {
                            display: !!styleConfig.xAxisName,
                            text: styleConfig.yAxisName, // 交换轴名称
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    },
                    y: {
                        title: {
                            display: !!styleConfig.yAxisName,
                            text: styleConfig.xAxisName, // 交换轴名称
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                break;
                
            case 'boxplot':
                // 设置箱线图数据
                const boxplotCategories = data.map(item => item[mappingConfig.categories]);
                const boxplotData = data.map(item => ({
                    min: item[mappingConfig.min],
                    q1: item[mappingConfig.q1],
                    median: item[mappingConfig.median],
                    q3: item[mappingConfig.q3],
                    max: item[mappingConfig.max],
                    outliers: item[mappingConfig.outliers] ? 
                        item[mappingConfig.outliers].split(',').map(val => parseFloat(val.trim())) : 
                        []
                }));
                
                // 创建箱线图 (这里需要自定义渲染)
                // 由于Chart.js核心不直接支持箱线图，我们使用自定义Multi-type图表
                config.type = 'bar';
                
                // 准备箱线图数据集
                // 我们将箱线图拆分为多个数据集:
                // 1. 箱体 (Q1到Q3的柱状图)
                // 2. 中位线 (中位数的线)
                // 3. 须线 (最小值到Q1, Q3到最大值的线)
                // 4. 异常值 (散点)
                
                const boxBodyData = boxplotCategories.map((_, i) => boxplotData[i].q3 - boxplotData[i].q1);
                const boxBodyBgColors = boxplotCategories.map((_, index) => 
                    this.adjustColorOpacity(colorPalette[index % colorPalette.length], 0.7)
                );
                
                config.data = {
                    labels: boxplotCategories,
                    datasets: [
                        // 箱体
                        {
                            label: '四分位区间',
                            data: boxBodyData,
                            backgroundColor: boxBodyBgColors,
                            borderColor: boxplotCategories.map((_, index) => colorPalette[index % colorPalette.length]),
                            borderWidth: 1,
                            base: boxplotData.map(item => item.q1), // 柱状图基线设为Q1
                            barPercentage: 0.4
                        },
                        // 中位线
                        {
                            label: '中位数',
                            data: boxplotData.map(item => item.median),
                            type: 'line',
                            pointStyle: 'line',
                            pointRadius: 10,
                            pointBorderWidth: 2,
                            pointBorderColor: boxplotCategories.map((_, index) => 
                                this.adjustColorOpacity(colorPalette[index % colorPalette.length], 0.9)
                            ),
                            pointBackgroundColor: 'transparent',
                            borderWidth: 0,
                            borderColor: 'transparent',
                            fill: false,
                            spanGaps: true
                        },
                        // 最小值到最大值线
                        {
                            label: '最小/最大值',
                            data: boxplotData.map(item => [item.min, item.max]),
                            type: 'line',
                            borderColor: boxplotCategories.map((_, index) => colorPalette[index % colorPalette.length]),
                            borderWidth: 1,
                            fill: false,
                            showLine: false
                        }
                    ]
                };
                
                // 如果有异常值，添加一个额外的数据集
                if (boxplotData.some(item => item.outliers && item.outliers.length > 0)) {
                    // 准备异常值数据
                    const outlierData = [];
                    
                    boxplotCategories.forEach((category, index) => {
                        const outliers = boxplotData[index].outliers;
                        if (outliers && outliers.length > 0) {
                            outliers.forEach(outlier => {
                                outlierData.push({
                                    x: index,
                                    y: outlier
                                });
                            });
                        }
                    });
                    
                    config.data.datasets.push({
                        label: '异常值',
                        data: outlierData,
                        type: 'scatter',
                        backgroundColor: 'red',
                        borderColor: 'red',
                        borderWidth: 1,
                        pointRadius: 3,
                        pointHoverRadius: 5
                    });
                }
                
                // 箱线图特殊设置
                config.options.scales = {
                    x: {
                        title: {
                            display: !!styleConfig.xAxisName,
                            text: styleConfig.xAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    },
                    y: {
                        title: {
                            display: !!styleConfig.yAxisName,
                            text: styleConfig.yAxisName,
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        ticks: {
                            font: {
                                size: styleConfig.fontSize
                            }
                        },
                        grid: {
                            display: styleConfig.showGrid
                        }
                    }
                };
                break;
        }
        
        return config;
    }
    
    /**
     * 规范化气泡半径
     * @param {number} value - 原始半径值
     * @returns {number} 规范化后的半径值
     */
    normalizeRadius(value) {
        const minRadius = 5;
        const maxRadius = 30;
        
        // 如果值是数字并且大于0
        if (typeof value === 'number' && value > 0) {
            // 计算所有数据点的大小值范围
            const sizeValues = this.state.data
                .map(item => parseFloat(item[this.collectMappingConfig().size]))
                .filter(val => !isNaN(val) && val > 0);
            
            const minSize = Math.min(...sizeValues);
            const maxSize = Math.max(...sizeValues);
            
            // 如果范围太小或只有一个值
            if (maxSize - minSize < 0.001) {
                return (minRadius + maxRadius) / 2;
            }
            
            // 规范化到指定范围
            return minRadius + (value - minSize) / (maxSize - minSize) * (maxRadius - minRadius);
        }
        
        // 默认半径
        return minRadius;
    }
    
    /**
     * 渲染图表
     * @param {Object} config - 图表配置
     */
    renderChart(config) {
        // 清除现有图表
        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
        }
        
        // 清除画布容器
        const chartContainer = this.elements.chartContainer;
        chartContainer.innerHTML = '';
        
        // 创建新画布
        const canvas = document.createElement('canvas');
        canvas.id = 'chartCanvas';
        chartContainer.appendChild(canvas);
        
        // 设置背景色
        if (config.options.backgroundColor) {
            chartContainer.style.backgroundColor = config.options.backgroundColor;
        } else {
            chartContainer.style.backgroundColor = '';
        }
        
        // 确保插件注册到Chart对象
        if (window.Chart) {
            // 注册数据标签插件
            if (window.ChartDataLabels) {
                Chart.register(ChartDataLabels);
            }
            
            // 注册缩放插件
            if (window.ChartZoom) {
                Chart.register(ChartZoom);
            }
            
            // 创建图表实例
            const ctx = canvas.getContext('2d');
            this.state.chartInstance = new Chart(ctx, config);
        } else {
            // Chart.js未加载，显示错误消息
            const errorMsg = document.createElement('div');
            errorMsg.className = 'chart-error';
            errorMsg.innerHTML = '<i class="ri-error-warning-line"></i> Chart.js库未正确加载，请刷新页面再试。';
            chartContainer.appendChild(errorMsg);
            console.error('Chart.js未定义，请确保已正确加载Chart.js库');
        }
    }
    
    /**
     * 处理重置配置
     */
    handleResetConfig() {
        // 重置图表类型选择
        this.elements.chartTypeCards.forEach(card => {
            card.classList.remove('active');
        });
        this.state.selectedChartType = null;
        
        // 重置数据映射字段
        this.resetMappingFields();
        
        // 重置图表样式表单
        this.elements.chartTitle.value = '';
        this.elements.chartTheme.value = 'default';
        this.elements.chartBackground.value = '';
        this.elements.xAxisName.value = '';
        this.elements.yAxisName.value = '';
        this.elements.showGrid.checked = true;
        this.elements.showLegend.checked = true;
        this.elements.labelRotation.value = 0;
        this.elements.labelRotationValue.textContent = '0';
        this.elements.fontSize.value = 12;
        this.elements.fontSizeValue.textContent = '12';
        this.elements.showDataLabels.checked = false;
        this.elements.enableAnimation.checked = true;
        this.elements.animationDuration.value = 1000;
        this.elements.enableZoom.checked = false;
        
        // 隐藏图表预览面板
        this.elements.chartPreviewPanel.style.display = 'none';
        
        // 清除现有图表
        if (this.state.chartInstance) {
            this.state.chartInstance.destroy();
            this.state.chartInstance = null;
        }
    }
    
    /**
     * 处理下载图表
     */
    handleDownloadChart() {
        if (!this.state.chartInstance) {
            alert('请先生成图表');
            return;
        }
        
        const canvas = document.getElementById('chartCanvas');
        
        if (!canvas) {
            alert('无法获取图表画布');
            return;
        }
        
        // 获取所选格式
        const format = this.elements.downloadFormat.value;
        let mimeType, extension;
        
        switch (format) {
            case 'png':
                mimeType = 'image/png';
                extension = 'png';
                break;
            case 'jpg':
                mimeType = 'image/jpeg';
                extension = 'jpg';
                break;
            case 'svg':
                // SVG导出需要特殊处理
                this.downloadChartAsSVG();
                return;
            default:
                mimeType = 'image/png';
                extension = 'png';
        }
        
        // 创建下载链接
        const downloadLink = document.createElement('a');
        downloadLink.download = `chart.${extension}`;
        
        // 对于PNG和JPG，使用Canvas的toDataURL方法
        try {
            downloadLink.href = canvas.toDataURL(mimeType, 1.0);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        } catch (e) {
            console.error('图表导出失败:', e);
            alert('图表导出失败，请检查浏览器是否支持该功能');
        }
    }
    
    /**
     * 将图表下载为SVG格式
     */
    downloadChartAsSVG() {
        if (!this.state.chartInstance) return;
        
        // 创建SVG容器
        const svgContainer = document.createElement('div');
        document.body.appendChild(svgContainer);
        
        // 使用canvg库将Canvas转换为SVG
        // 注意：实际使用时需要引入canvg库
        if (typeof canvg !== 'undefined') {
            const canvas = document.getElementById('chartCanvas');
            const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + canvas.width + '" height="' + canvas.height + '">' +
                        '<foreignObject width="100%" height="100%">' +
                        '<div xmlns="http://www.w3.org/1999/xhtml">' +
                        '<img src="' + canvas.toDataURL('image/png') + '" width="' + canvas.width + '" height="' + canvas.height + '" />' +
                        '</div></foreignObject></svg>';
            
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = 'chart.svg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // 清理
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
        } else {
            alert('导出SVG功能需要canvg库支持，请确保已引入该库');
        }
        
        document.body.removeChild(svgContainer);
    }
    
    /**
     * 处理复制图表到剪贴板
     */
    handleCopyChart() {
        if (!this.state.chartInstance) {
            alert('请先生成图表');
            return;
        }
        
        const canvas = document.getElementById('chartCanvas');
        
        if (!canvas) {
            alert('无法获取图表画布');
            return;
        }
        
        // 将Canvas转换为Blob
        canvas.toBlob(blob => {
            // 创建ClipboardItem并写入剪贴板
            try {
                const item = new ClipboardItem({ [blob.type]: blob });
                navigator.clipboard.write([item]).then(
                    () => {
                        alert('图表已复制到剪贴板');
                    },
                    error => {
                        console.error('复制失败:', error);
                        alert('复制图表失败，请检查浏览器是否支持该功能');
                    }
                );
            } catch (e) {
                console.error('复制到剪贴板失败:', e);
                alert('当前浏览器不支持复制图表到剪贴板');
            }
        });
    }
    
    /**
     * 调整颜色透明度
     * @param {string} color - 颜色代码
     * @param {number} opacity - 透明度 (0-1)
     * @returns {string} RGBA颜色
     */
    adjustColorOpacity(color, opacity) {
        // 将颜色转换为RGB值
        let r, g, b;
        
        // 处理十六进制颜色代码
        if (color.startsWith('#')) {
            // 处理简写形式
            if (color.length === 4) {
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            } else {
                r = parseInt(color.substring(1, 3), 16);
                g = parseInt(color.substring(3, 5), 16);
                b = parseInt(color.substring(5, 7), 16);
            }
        } 
        // 处理RGB/RGBA颜色字符串
        else if (color.startsWith('rgb')) {
            const matches = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
            r = parseInt(matches[1]);
            g = parseInt(matches[2]);
            b = parseInt(matches[3]);
        }
        // 默认颜色
        else {
            r = 0;
            g = 0;
            b = 0;
        }
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    /**
     * 获取对比色
     * @param {string} color - 背景颜色
     * @returns {string} 对比色
     */
    getContrastColor(color) {
        // 将颜色转换为RGB值
        let r, g, b;
        
        // 处理十六进制颜色代码
        if (color.startsWith('#')) {
            // 处理简写形式
            if (color.length === 4) {
                r = parseInt(color[1] + color[1], 16);
                g = parseInt(color[2] + color[2], 16);
                b = parseInt(color[3] + color[3], 16);
            } else {
                r = parseInt(color.substring(1, 3), 16);
                g = parseInt(color.substring(3, 5), 16);
                b = parseInt(color.substring(5, 7), 16);
            }
        } 
        // 处理RGB/RGBA颜色字符串
        else if (color.startsWith('rgb')) {
            const matches = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
            r = parseInt(matches[1]);
            g = parseInt(matches[2]);
            b = parseInt(matches[3]);
        }
        // 默认颜色
        else {
            return '#333333';
        }
        
        // 计算亮度
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // 根据亮度返回黑色或白色
        return luminance > 0.5 ? '#333333' : '#ffffff';
    }
    
    /**
     * 重置数据映射字段
     */
    resetMappingFields() {
        const mappingFields = this.elements.mappingFields;
        mappingFields.innerHTML = '';
        
        // 添加默认提示
        const notice = document.createElement('div');
        notice.className = 'mapping-notice';
        notice.textContent = '请先导入数据并选择图表类型';
        mappingFields.appendChild(notice);
    }
}

/**
 * 在全局范围内导出DataVisualization类
 */
window.DataVisualization = DataVisualization;
