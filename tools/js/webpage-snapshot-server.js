/**
 * 网页快照服务端API
 * 提供网页截图功能的Node.js服务
 */

const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 配置CORS
app.use(cors());
app.use(express.json());

// 静态文件目录，用于提供生成的图像
const SNAPSHOTS_DIR = path.join(__dirname, '../../public/snapshots');

// 确保快照目录存在
if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
    console.log(`创建快照存储目录: ${SNAPSHOTS_DIR}`);
}

// 提供静态文件访问
app.use('/snapshots', express.static(SNAPSHOTS_DIR));

// 服务状态API
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        status: 'online',
        version: '1.0.0',
        message: '服务正常运行',
        startTime: new Date().toISOString()
    });
});

// 捕获网页快照API
app.post('/api/capture', async (req, res) => {
    try {
        // 验证请求参数
        const { url, options } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: '缺少URL参数'
            });
        }
        
        // 验证URL格式
        let targetUrl = url;
        try {
            // 如果URL没有协议前缀，添加https://
            if (!targetUrl.match(/^https?:\/\//i)) {
                targetUrl = 'https://' + targetUrl;
            }
            new URL(targetUrl);
        } catch (e) {
            return res.status(400).json({
                success: false,
                error: 'URL格式无效'
            });
        }
        
        console.log(`开始处理URL: ${targetUrl}`);
        
        // 合并默认选项和用户选项
        const snapshotOptions = {
            deviceType: 'desktop',
            width: 1920,
            height: 1080,
            format: 'png',
            fullPage: true,
            delay: 0,
            ...options
        };
        
        console.log('配置选项:', snapshotOptions);
        
        // 捕获网页快照
        const snapshot = await captureWebpage(targetUrl, snapshotOptions);
        
        // 返回结果
        res.json({
            success: true,
            message: '快照生成成功',
            ...snapshot
        });
        
    } catch (error) {
        console.error('捕获快照出错:', error);
        res.status(500).json({
            success: false,
            error: error.message || '服务器处理请求时出错'
        });
    }
});

/**
 * 捕获网页快照
 * @param {string} url - 要捕获的URL
 * @param {Object} options - 捕获选项
 * @returns {Promise<Object>} - 快照数据
 */
async function captureWebpage(url, options) {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    try {
        const page = await browser.newPage();
        
        // 根据设备类型设置视口
        await page.setViewport({
            width: options.width,
            height: options.height,
            deviceScaleFactor: 1
        });
        
        // 根据设备类型设置User-Agent
        if (options.deviceType === 'mobile') {
            await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
        } else if (options.deviceType === 'tablet') {
            await page.setUserAgent('Mozilla/5.0 (iPad; CPU OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');
        }
        
        console.log(`正在导航到: ${url}`);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // 延迟截图
        if (options.delay > 0) {
            console.log(`等待 ${options.delay}ms`);
            await new Promise(resolve => setTimeout(resolve, options.delay));
        }
        
        // 获取页面标题
        const title = await page.title();
        console.log(`页面标题: ${title}`);
        
        // 生成唯一ID和文件名
        const id = uuidv4();
        let filename;
        let imageUrl;
        let width, height;
        
        // 根据格式选择捕获方法
        if (options.format === 'pdf') {
            // PDF截图
            filename = `${id}.pdf`;
            const pdfPath = path.join(SNAPSHOTS_DIR, filename);
            
            await page.pdf({
                path: pdfPath,
                format: 'A4',
                printBackground: true
            });
            
            width = 595; // A4尺寸
            height = 842;
            
        } else {
            // 图像截图 (PNG或JPEG)
            const format = options.format === 'jpeg' ? 'jpeg' : 'png';
            filename = `${id}.${format}`;
            const screenshotPath = path.join(SNAPSHOTS_DIR, filename);
            
            // 获取实际页面尺寸
            const dimensions = await page.evaluate(() => {
                return {
                    width: document.documentElement.clientWidth,
                    height: document.documentElement.scrollHeight
                };
            });
            
            console.log(`页面尺寸: ${dimensions.width}x${dimensions.height}`);
            
            // 截图
            await page.screenshot({
                path: screenshotPath,
                type: format,
                fullPage: options.fullPage,
                quality: format === 'jpeg' ? 90 : undefined
            });
            
            width = dimensions.width;
            height = options.fullPage ? dimensions.height : options.height;
        }
        
        // 构建图像URL
        imageUrl = `/snapshots/${filename}`;
        console.log(`快照已保存: ${imageUrl}`);
        
        // 关闭浏览器
        await browser.close();
        
        // 返回快照数据
        return {
            id,
            url,
            title,
            timestamp: new Date().toISOString(),
            imageUrl,
            width,
            height,
            options
        };
        
    } catch (error) {
        // 确保关闭浏览器
        await browser.close();
        throw error;
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`网页快照API服务已启动: http://localhost:${PORT}`);
    console.log(`快照将保存在: ${SNAPSHOTS_DIR}`);
}); 