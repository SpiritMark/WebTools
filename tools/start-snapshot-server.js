/**
 * 网页快照服务启动器
 * 这个脚本用于启动网页快照API服务
 */

// 检查Node.js环境
const requiredNodeVersion = 14;
const currentNodeVersion = process.versions.node;
const currentMajorVersion = parseInt(currentNodeVersion.split('.')[0], 10);

if (currentMajorVersion < requiredNodeVersion) {
    console.error(`
⚠️ 您正在使用的Node.js版本过低: ${currentNodeVersion}
   网页快照工具需要Node.js v${requiredNodeVersion}.0或更高版本。
   请更新您的Node.js版本后再尝试运行此服务。
   下载地址: https://nodejs.org/
`);
    process.exit(1);
}

// 检查必要的包
const checkDependencies = () => {
    const requiredPackages = ['express', 'cors', 'puppeteer', 'uuid'];
    const missingPackages = [];
    
    for (const pkg of requiredPackages) {
        try {
            require.resolve(pkg);
        } catch (e) {
            missingPackages.push(pkg);
        }
    }
    
    if (missingPackages.length > 0) {
        console.log(`
⚠️ 缺少必要的依赖包: ${missingPackages.join(', ')}
   正在尝试自动安装...
`);
        
        const { execSync } = require('child_process');
        try {
            execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit' });
            console.log('✅ 依赖包安装成功！');
        } catch (error) {
            console.error(`
❌ 依赖包安装失败。请手动运行以下命令:
   npm install ${missingPackages.join(' ')}
   
   错误详情: ${error.message}
`);
            process.exit(1);
        }
    }
};

// 检查依赖
try {
    checkDependencies();
} catch (e) {
    console.error('依赖检查失败: ', e);
}

console.log(`
==================================
🚀 正在启动网页快照服务...
==================================
`);

// 启动服务
try {
    // 导入服务器脚本
    const serverPath = require.resolve('./js/webpage-snapshot-server.js');
    
    // 检查目录结构
    const fs = require('fs');
    const path = require('path');
    const publicDir = path.join(__dirname, '../public');
    const snapshotsDir = path.join(publicDir, 'snapshots');
    
    // 确保目录存在
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
    }
    
    if (!fs.existsSync(snapshotsDir)) {
        fs.mkdirSync(snapshotsDir, { recursive: true });
    }
    
    // 启动服务
    require(serverPath);
    
    console.log(`
==================================
💡 使用说明:
   1. 确保服务器正在运行（看到上方的启动消息）
   2. 在浏览器中打开网页快照工具: file://${path.join(__dirname, 'webpage-snapshot.html')}
   3. 输入要捕获的网页URL并设置选项
   4. 点击"捕获快照"按钮

✅ 服务器将在后台运行直到您关闭此窗口或按Ctrl+C停止服务
==================================
`);
    
} catch (error) {
    console.error(`
❌ 启动服务失败:
   ${error.message}
   
   请检查您的Node.js环境和依赖包是否正确安装。
   如果问题持续，请尝试重新安装依赖:
   npm install express cors puppeteer uuid
`);
    process.exit(1);
} 