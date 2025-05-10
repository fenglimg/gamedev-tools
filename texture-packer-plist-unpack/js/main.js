// 全局变量
let plistFile = null;
let pngFile = null;
let sprites = [];
let debugMode = false;

// DOM 元素
const plistInput = document.getElementById('plistFile');
const pngInput = document.getElementById('pngFile');
const processBtn = document.getElementById('processBtn');
const plistDropArea = document.getElementById('plistDropArea');
const pngDropArea = document.getElementById('pngDropArea');
const plistStatus = document.getElementById('plistStatus');
const pngStatus = document.getElementById('pngStatus');
const statusMessage = document.getElementById('statusMessage');
const previewSection = document.getElementById('previewSection');
const spritesContainer = document.getElementById('spritesContainer');
const downloadAllBtn = document.getElementById('downloadAllBtn');

// 事件监听
plistInput.addEventListener('change', handlePlistSelect);
pngInput.addEventListener('change', handlePngSelect);
processBtn.addEventListener('click', processSpriteSheet);
downloadAllBtn.addEventListener('click', downloadAllSprites);

// 拖放功能 - 为两个拖放区各自添加事件
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    plistDropArea.addEventListener(eventName, preventDefaults, false);
    pngDropArea.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    plistDropArea.addEventListener(eventName, () => highlight(plistDropArea), false);
    pngDropArea.addEventListener(eventName, () => highlight(pngDropArea), false);
});

['dragleave', 'drop'].forEach(eventName => {
    plistDropArea.addEventListener(eventName, () => unhighlight(plistDropArea), false);
    pngDropArea.addEventListener(eventName, () => unhighlight(pngDropArea), false);
});

// 为每个拖放区添加不同的处理函数
plistDropArea.addEventListener('drop', handlePlistDrop, false);
pngDropArea.addEventListener('drop', handlePngDrop, false);

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(element) {
    element.classList.add('highlight');
}

function unhighlight(element) {
    element.classList.remove('highlight');
}

// 处理 plist 文件拖放
function handlePlistDrop(e) {
    const files = e.dataTransfer.files;

    for (let i = 0; i < files.length; i++) {
        if (files[i].name.endsWith('.plist')) {
            plistFile = files[i];
            updateFileStatus(plistStatus, `已选择: ${files[i].name}`, true);
            updateFileInputDisplay('plistFile', files[i].name);
            break;
        } else {
            updateFileStatus(plistStatus, '请拖放 .plist 文件', false);
        }
    }

    checkFilesReady();
}

// 处理 png 文件拖放
function handlePngDrop(e) {
    const files = e.dataTransfer.files;

    for (let i = 0; i < files.length; i++) {
        if (files[i].name.endsWith('.png')) {
            pngFile = files[i];
            updateFileStatus(pngStatus, `已选择: ${files[i].name}`, true);
            updateFileInputDisplay('pngFile', files[i].name);
            break;
        } else {
            updateFileStatus(pngStatus, '请拖放 .png 文件', false);
        }
    }

    checkFilesReady();
}

// 更新文件状态显示
function updateFileStatus(element, message, isSuccess) {
    element.textContent = message;
    element.className = 'file-status';
    if (isSuccess !== undefined) {
        element.classList.add(isSuccess ? 'success' : 'error');
    }
}

// 更新文件输入显示
function updateFileInputDisplay(inputId, fileName) {
    const fileInput = document.getElementById(inputId);

    // 创建标签显示已选文件名
    const fileLabel = document.createElement('span');
    fileLabel.className = 'selected-file';
    fileLabel.textContent = fileName;

    // 查找并替换已有的标签，如果存在的话
    const parent = fileInput.parentElement;
    const existingLabel = parent.querySelector('.selected-file');
    if (existingLabel) {
        parent.removeChild(existingLabel);
    }

    // 添加新标签
    parent.appendChild(fileLabel);
}

// 文件选择处理函数
function handlePlistSelect(e) {
    if (e.target.files.length > 0) {
        plistFile = e.target.files[0];
        updateFileStatus(plistStatus, `已选择: ${plistFile.name}`, true);
        checkFilesReady();
    }
}

function handlePngSelect(e) {
    if (e.target.files.length > 0) {
        pngFile = e.target.files[0];
        updateFileStatus(pngStatus, `已选择: ${pngFile.name}`, true);
        checkFilesReady();
    }
}

function checkFilesReady() {
    if (plistFile && pngFile) {
        processBtn.disabled = false;
    } else {
        processBtn.disabled = true;
    }
}

// 显示状态消息增强版
function showStatus(message, isError = false, details = null) {
    statusMessage.textContent = message;
    statusMessage.classList.remove('hidden', 'success', 'error');
    statusMessage.classList.add(isError ? 'error' : 'success');

    // 如果有详细信息，添加一个可展开的详情部分
    if (details) {
        const detailsElement = document.createElement('details');
        const summary = document.createElement('summary');
        summary.textContent = "查看详情";
        const pre = document.createElement('pre');
        pre.textContent = typeof details === 'object' ? JSON.stringify(details, null, 2) : details;

        detailsElement.appendChild(summary);
        detailsElement.appendChild(pre);
        statusMessage.appendChild(detailsElement);
    }
}

// 添加一个调试函数
function debugLog(...args) {
    if (debugMode) {
        console.log(...args);
    }
}

// 增强错误处理函数
function handleError(error, context = '') {
    console.error(`错误 [${context}]:`, error);
    let message = error.message || '未知错误';

    // 提供更友好的错误消息
    if (message.includes('找不到frames')) {
        message = 'plist文件格式不正确，未找到精灵帧数据';
    } else if (message.includes('Cannot read properties')) {
        message = '解析精灵数据时出错，可能是plist格式不兼容';
    }

    showStatus(`${context ? context + ': ' : ''}${message}`, true, error.stack);

    // 如果在调试模式下，显示更多详细信息
    if (debugMode) {
        console.dir(error);
    }
}

// 添加进度指示函数
function updateProgress(percent, message) {
    if (!document.getElementById('progressBar')) {
        // 创建进度条元素
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.innerHTML = `
            <div class="progress">
                <div id="progressBar" class="progress-bar" role="progressbar" style="width: 0%"></div>
            </div>
            <div id="progressMessage" class="progress-message"></div>
        `;

        // 插入到状态消息之后
        statusMessage.parentNode.insertBefore(progressContainer, statusMessage.nextSibling);
    }

    // 更新进度条和消息
    const progressBar = document.getElementById('progressBar');
    const progressMessage = document.getElementById('progressMessage');

    progressBar.style.width = `${percent}%`;
    progressMessage.textContent = message;

    // 完成后隐藏进度条
    if (percent >= 100) {
        setTimeout(() => {
            const container = document.querySelector('.progress-container');
            if (container) {
                container.style.display = 'none';
            }
        }, 2000);
    }
}

// 主处理函数
function processSpriteSheet() {
    try {
        showStatus('正在处理图集...');

        // 读取plist文件
        const plistReader = new FileReader();
        plistReader.onload = function (e) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

                // 解析plist
                parsePlist(xmlDoc).then(spriteData => {
                    // 加载PNG图片
                    const pngReader = new FileReader();
                    pngReader.onload = function (e) {
                        const img = new Image();
                        img.onload = function () {
                            extractSprites(img, spriteData);
                        };
                        img.src = e.target.result;
                    };
                    pngReader.readAsDataURL(pngFile);
                }).catch(error => {
                    handleError(error, '解析plist文件');
                });
            } catch (error) {
                handleError(error, '处理文件');
            }
        };

        plistReader.readAsText(plistFile);
    } catch (error) {
        handleError(error, '处理图集');
    }
}

// 解析plist文件 - 修复版
async function parsePlist(xmlDoc) {
    return new Promise((resolve, reject) => {
        try {
            // 检测plist格式版本
            let formatVersion = "unknown";
            const formatElements = xmlDoc.getElementsByTagName('integer');
            for (let i = 0; i < formatElements.length; i++) {
                const element = formatElements[i];
                if (element.parentNode &&
                    element.parentNode.previousSibling &&
                    element.parentNode.previousSibling.textContent === "format") {
                    formatVersion = element.textContent;
                    break;
                }
            }

            debugLog("检测到plist格式版本:", formatVersion);

            // 获取根dict元素
            const dictElements = xmlDoc.getElementsByTagName('dict');
            const rootDict = dictElements[0]; // 根dict

            // 在根dict中寻找frames和metadata
            const rootKeys = rootDict.getElementsByTagName('key');
            let framesElement = null;
            let metadataElement = null;

            for (let i = 0; i < rootKeys.length; i++) {
                const key = rootKeys[i];
                if (key.textContent === 'frames') {
                    framesElement = key.nextElementSibling;
                } else if (key.textContent === 'metadata') {
                    metadataElement = key.nextElementSibling;
                }
            }

            if (!framesElement || !metadataElement) {
                throw new Error('找不到frames或metadata节点');
            }

            // 解析frames数据 - 正确获取精灵帧
            const frames = {};
            const frameElements = framesElement.children;

            // 每对key和dict元素代表一个精灵
            for (let i = 0; i < frameElements.length; i += 2) {
                if (frameElements[i].tagName.toLowerCase() === 'key' &&
                    frameElements[i + 1] &&
                    frameElements[i + 1].tagName.toLowerCase() === 'dict') {

                    const spriteName = frameElements[i].textContent;
                    const spriteDict = frameElements[i + 1];

                    // 解析精灵属性
                    const spriteData = {
                        textureRect: null,
                        sourceSize: null,
                        spriteSize: null,
                        offset: null,
                        rotated: false
                    };

                    const spriteProperties = spriteDict.children;
                    for (let j = 0; j < spriteProperties.length; j += 2) {
                        if (spriteProperties[j].tagName.toLowerCase() === 'key') {
                            const propName = spriteProperties[j].textContent;
                            const propValue = spriteProperties[j + 1];

                            switch (propName) {
                                case 'textureRect':
                                    spriteData.textureRect = parseRectString(propValue.textContent);
                                    break;
                                case 'spriteSourceSize':
                                    spriteData.sourceSize = parseSizeString(propValue.textContent);
                                    break;
                                case 'spriteSize':
                                    spriteData.spriteSize = parseSizeString(propValue.textContent);
                                    break;
                                case 'spriteOffset':
                                    spriteData.offset = parsePointString(propValue.textContent);
                                    break;
                                case 'textureRotated':
                                    spriteData.rotated = propValue.textContent === 'true';
                                    break;
                            }
                        }
                    }

                    frames[spriteName] = spriteData;
                }
            }

            // 解析metadata
            const metadata = {};
            const metaProperties = metadataElement.children;

            for (let i = 0; i < metaProperties.length; i += 2) {
                if (metaProperties[i].tagName.toLowerCase() === 'key') {
                    const propName = metaProperties[i].textContent;
                    const propValue = metaProperties[i + 1];

                    if (propName === 'size') {
                        metadata.size = parseSizeString(propValue.textContent);
                    }
                }
            }

            resolve({ frames, metadata });
        } catch (error) {
            reject(error);
        }
    });
}

// 辅助解析函数
function parseRectString(rectStr) {
    // 添加调试输出
    console.log("解析矩形字符串:", rectStr);

    // 尝试不同的正则表达式格式，TexturePacker有多种输出格式
    let match = rectStr.match(/\{\{([\d.]+),([\d.]+)\},\{([\d.]+),([\d.]+)\}\}/);

    // 如果第一种格式不匹配，尝试另一种常见格式
    if (!match) {
        match = rectStr.match(/\{(\d+),(\d+),(\d+),(\d+)\}/);
    }

    if (match) {
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
            width: parseFloat(match[3]),
            height: parseFloat(match[4])
        };
    }

    // 如果都不匹配，记录原始字符串并返回默认值
    console.error("无法解析矩形字符串:", rectStr);
    return {
        x: 0,
        y: 0,
        width: 100,
        height: 100
    };
}

function parseSizeString(sizeStr) {
    // 格式: {width,height}
    const match = sizeStr.match(/\{([\d.]+),([\d.]+)\}/);
    if (match) {
        return {
            width: parseFloat(match[1]),
            height: parseFloat(match[2])
        };
    }
    return null;
}

function parsePointString(pointStr) {
    // 格式: {x,y}
    const match = pointStr.match(/\{([\d.]+),([\d.]+)\}/);
    if (match) {
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
        };
    }
    return null;
}

// 提取精灵图像
function extractSprites(atlasImage, spriteData) {
    sprites = []; // 清空之前的精灵
    spritesContainer.innerHTML = ''; // 清空预览区域

    // 创建Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 遍历所有精灵
    for (const spriteName in spriteData.frames) {
        const sprite = spriteData.frames[spriteName];

        // 添加安全检查
        if (!sprite || !sprite.textureRect) {
            console.error(`精灵 ${spriteName} 缺少 textureRect 属性`);
            showStatus(`处理精灵 ${spriteName} 时出错: 缺少坐标数据`, true);
            continue; // 跳过这个精灵
        }

        const rect = sprite.textureRect;

        // 确保rect有所有需要的属性
        if (!rect.width || !rect.height) {
            console.error(`精灵 ${spriteName} 的 textureRect 缺少宽度或高度`, rect);
            showStatus(`处理精灵 ${spriteName} 时出错: 坐标数据不完整`, true);
            continue; // 跳过这个精灵
        }

        // 设置Canvas大小
        canvas.width = rect.width;
        canvas.height = rect.height;

        // 清除Canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制精灵
        if (sprite.rotated) {
            // 处理旋转的精灵
            canvas.width = rect.height;
            canvas.height = rect.width;

            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 2); // 逆时针旋转90度
            ctx.drawImage(
                atlasImage,
                rect.x, rect.y, rect.height, rect.width,
                -rect.width / 2, -rect.height / 2, rect.width, rect.height
            );
            ctx.restore();
        } else {
            // 绘制未旋转的精灵
            ctx.drawImage(
                atlasImage,
                rect.x, rect.y, rect.width, rect.height,
                0, 0, rect.width, rect.height
            );
        }

        // 获取用户设置的图像质量（可以添加UI控件让用户选择）
        const imageQuality = 0.95; // 0.0-1.0

        // 将Canvas内容转换为图像数据时指定质量
        const imageData = canvas.toDataURL('image/png', imageQuality);

        // 存储精灵信息
        sprites.push({
            name: spriteName,
            data: imageData
        });

        // 创建预览元素
        createSpritePreview(spriteName, imageData);
    }

    // 显示预览区域
    previewSection.classList.remove('hidden');
    showStatus(`成功提取 ${sprites.length} 个精灵`);
}

// 创建精灵预览
function createSpritePreview(name, imageData) {
    const spriteItem = document.createElement('div');
    spriteItem.className = 'sprite-item';

    const img = document.createElement('img');
    img.src = imageData;
    img.className = 'sprite-preview';
    img.alt = name;

    const nameElement = document.createElement('div');
    nameElement.className = 'sprite-name';
    nameElement.textContent = name;

    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'btn';
    downloadBtn.textContent = '下载';
    downloadBtn.addEventListener('click', () => {
        downloadSprite(name, imageData);
    });

    spriteItem.appendChild(img);
    spriteItem.appendChild(nameElement);
    spriteItem.appendChild(downloadBtn);

    spritesContainer.appendChild(spriteItem);
}

// 下载单个精灵
function downloadSprite(name, imageData) {
    // 从base64创建Blob
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([ab], { type: mimeString });
    saveAs(blob, name); // 使用FileSaver.js
}

// 下载所有精灵
async function downloadAllSprites() {
    try {
        showStatus('正在创建ZIP文件...');

        const zip = new JSZip();

        // 添加所有精灵到zip
        sprites.forEach(sprite => {
            // 转换base64到二进制
            const base64Data = sprite.data.split(',')[1];
            zip.file(sprite.name, base64Data, { base64: true });
        });

        // 生成zip文件
        const content = await zip.generateAsync({ type: 'blob' });

        // 下载
        const baseName = plistFile.name.replace('.plist', '');
        saveAs(content, `${baseName}_sprites.zip`);

        showStatus('ZIP文件创建成功!');
    } catch (error) {
        showStatus(`创建ZIP文件出错: ${error.message}`, true);
    }
} 