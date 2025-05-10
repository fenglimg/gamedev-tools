#!/usr/bin/env node
/**
 * 生成项目索引页面的脚本
 */
const fs = require('fs');
const path = require('path');

// GitHub Pages基础URL
const BASE_URL = "https://fenglimg.github.io/gamedev-tools/";

/**
 * 简单的Markdown转HTML函数
 * @param {string} markdown Markdown文本
 * @returns {string} HTML文本
 */
function simpleMarkdownToHtml(markdown) {
    if (!markdown) return '';

    // 简单替换一些基本的Markdown语法
    let html = markdown
        // 替换链接 [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // 替换粗体 **text**
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // 替换斜体 *text*
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // 替换图片 ![alt](url)
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

    // 将段落分隔转换为HTML段落
    html = '<p>' + html.replace(/\n\n+/g, '</p><p>') + '</p>';

    return html;
}

/**
 * 获取项目信息
 * @param {string} projectDir 项目目录
 * @returns {Object} 项目信息
 */
function getProjectInfo(projectDir) {
    const info = {
        name: path.basename(projectDir),
        url: BASE_URL + path.basename(projectDir),
        description: "",
        preview_img: ""
    };

    // 尝试从README.md获取描述
    const readmePath = path.join(projectDir, "README.md");
    if (fs.existsSync(readmePath)) {
        const content = fs.readFileSync(readmePath, 'utf-8');
        // 提取第一段作为描述
        const match = content.match(/# .+?\n+(.+?)(\n\n|\n#|$)/s);
        if (match) {
            const description = match[1].trim();
            // 转换Markdown为HTML
            info.description = simpleMarkdownToHtml(description);
        }
    }

    // 查找预览图
    const previewPaths = [
        path.join(projectDir, "preview.png"),
        path.join(projectDir, "preview.jpg"),
        path.join(projectDir, "screenshot.png"),
        path.join(projectDir, "screenshot.jpg")
    ];

    for (const imagePath of previewPaths) {
        if (fs.existsSync(imagePath)) {
            // 使用相对路径
            info.preview_img = path.join(path.basename(projectDir), path.basename(imagePath));
            break;
        }
    }

    return info;
}

/**
 * 生成index.html文件
 * @param {Array} projects 项目信息数组
 */
function generateIndexHtml(projects) {
    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>游戏开发工具集</title>
    <style>
        body {
            font-family: 'Microsoft YaHei', 'Segoe UI', Tahoma, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
        }
        .projects-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .project-card {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            transition: transform 0.3s, box-shadow 0.3s;
        }
        .project-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .project-card img {
            width: 100%;
            height: 180px;
            object-fit: cover;
            border-bottom: 1px solid #eee;
        }
        .project-info {
            padding: 15px;
        }
        .project-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #2c3e50;
        }
        .project-description {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
        }
        .project-link {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            text-decoration: none;
            font-size: 14px;
            transition: background 0.3s;
        }
        .project-link:hover {
            background: #2980b9;
        }
        .no-image {
            height: 180px;
            background: #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #999;
            font-size: 18px;
        }
        footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #777;
        }
    </style>
</head>
<body>
    <h1>游戏开发工具集</h1>
    
    <div class="projects-container">
`;

    // 为每个项目生成卡片
    projects.forEach(project => {
        html += `
        <div class="project-card">
            ${project.preview_img ? `<img src="${project.preview_img}" alt="${project.name}">` : '<div class="no-image">暂无预览图</div>'}
            <div class="project-info">
                <div class="project-name">${project.name}</div>
                <div class="project-description">${project.description || '暂无描述'}</div>
                <a href="${project.url}" class="project-link" target="_blank">查看项目</a>
            </div>
        </div>
`;
    });

    html += `
    </div>
    
    <footer>
        <p>© ${new Date().getFullYear()} 游戏开发工具集 | <a href="https://github.com/fenglimg/gamedev-tools">GitHub 仓库</a></p>
    </footer>
</body>
</html>
`;

    fs.writeFileSync("index.html", html, 'utf-8');

    console.log("成功生成 index.html 文件！");
}

/**
 * 主函数
 */
function main() {
    // 获取所有项目目录
    const projects = [];
    const rootPath = './';

    fs.readdirSync(rootPath).forEach(item => {
        const itemPath = path.join(rootPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory() && !item.startsWith('.')) {
            // 只处理包含index.html的目录
            if (fs.existsSync(path.join(itemPath, 'index.html'))) {
                const projectInfo = getProjectInfo(itemPath);
                projects.push(projectInfo);
            }
        }
    });

    // 按名称排序
    projects.sort((a, b) => a.name.localeCompare(b.name));

    // 生成index.html
    generateIndexHtml(projects);

    // 保存项目信息到JSON文件，方便其他工具使用
    fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2), 'utf-8');
}

// 执行主函数
main(); 