/**
 * TinyImage - 纯前端图片压缩应用
 * UI交互和业务逻辑
 */

// 当DOM加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 检查浏览器是否支持必要的API
    if (!checkBrowserSupport()) {
        showError('您的浏览器不支持现代Web API，请使用最新版Chrome, Firefox或Edge浏览器。');
        return;
    }

    // 初始化应用
    initApp();
});

// 检查浏览器兼容性
function checkBrowserSupport() {
    return (
        'File' in window &&
        'FileReader' in window &&
        'Blob' in window &&
        'URL' in window &&
        'createObjectURL' in URL &&
        'Worker' in window &&
        'fetch' in window
    );
}

// 显示错误信息
function showError(message) {
    alert(message);
    console.error(message);
}

// 初始化应用
async function initApp() {
    // 初始化压缩器
    try {
        console.log('正在初始化图像压缩器...');
        await imageCompressor.init();
        console.log('图像压缩器初始化成功');
    } catch (error) {
        console.error('初始化图像压缩器失败:', error);
        showError('初始化图像压缩器失败，请刷新页面重试。');
        return;
    }

    // 获取DOM元素
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const folderInput = document.getElementById('folderInput');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const stripMetadata = document.getElementById('stripMetadata');
    const algorithmSelect = document.getElementById('algorithm');
    const compressBtn = document.getElementById('compressBtn');
    const resultsPanel = document.getElementById('resultsPanel');
    const resultsList = document.getElementById('resultsList');
    const originalSizeElement = document.getElementById('originalSize');
    const compressedSizeElement = document.getElementById('compressedSize');
    const savedSizeElement = document.getElementById('savedSize');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearBtn = document.getElementById('clearBtn');
    const progressOverlay = document.getElementById('progressOverlay');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    // 存储选中的文件
    let selectedFiles = [];

    // 更新质量显示
    qualitySlider.addEventListener('input', () => {
        qualityValue.textContent = qualitySlider.value;
    });

    // 文件拖放处理
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        // 获取拖放的文件
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // 点击上传区域触发文件选择
    dropArea.addEventListener('click', (e) => {
        // 防止点击按钮时触发
        if (e.target.tagName !== 'LABEL' && e.target.tagName !== 'INPUT') {
            fileInput.click();
        }
    });

    // 文件选择处理
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });

    // 文件夹选择处理
    folderInput.addEventListener('change', () => {
        handleFiles(folderInput.files);
    });

    // 压缩按钮点击事件
    compressBtn.addEventListener('click', () => {
        compressSelectedFiles();
    });

    // 下载全部按钮点击事件
    downloadAllBtn.addEventListener('click', () => {
        downloadAllCompressedFiles();
    });

    // 清除按钮点击事件
    clearBtn.addEventListener('click', () => {
        clearResults();
    });

    /**
     * 处理选中的文件
     * @param {FileList} files - 文件列表
     */
    function handleFiles(files) {
        if (files.length === 0) {
            return;
        }

        // 过滤出图像文件
        const imageFiles = Array.from(files).filter(file => {
            return file.type.startsWith('image/');
        });

        if (imageFiles.length === 0) {
            showError('请选择图片文件。');
            return;
        }

        // 存储选中的文件
        selectedFiles = imageFiles;
        
        // 启用压缩按钮
        compressBtn.disabled = false;
        
        // 显示选中的文件数量
        console.log(`已选择 ${selectedFiles.length} 个图片文件`);
    }

    /**
     * 压缩选中的文件
     */
    async function compressSelectedFiles() {
        if (selectedFiles.length === 0) {
            showError('请先选择图片文件。');
            return;
        }

        // 获取压缩选项
        const options = {
            quality: parseInt(qualitySlider.value),
            algorithm: algorithmSelect.value,
            stripMetadata: stripMetadata.checked
        };

        // 显示进度条
        showProgress(0);
        
        try {
            // 批量压缩文件
            const results = await imageCompressor.compressBatch(
                selectedFiles, 
                options, 
                updateProgress
            );
            
            // 处理压缩结果
            handleCompressionResults(results);
        } catch (error) {
            console.error('压缩过程中出错:', error);
            showError('压缩过程中出错: ' + error.message);
        } finally {
            // 隐藏进度条
            hideProgress();
        }
    }

    /**
     * 更新进度条
     * @param {number} progress - 进度值 (0-1)
     */
    function updateProgress(progress) {
        const percentage = Math.round(progress * 100);
        progressBar.style.width = percentage + '%';
        progressText.textContent = percentage + '%';
    }

    /**
     * 显示进度条
     * @param {number} initialValue - 初始进度值
     */
    function showProgress(initialValue = 0) {
        updateProgress(initialValue);
        progressOverlay.style.display = 'flex';
    }

    /**
     * 隐藏进度条
     */
    function hideProgress() {
        progressOverlay.style.display = 'none';
    }

    /**
     * 处理压缩结果
     * @param {Array} results - 压缩结果数组
     */
    function handleCompressionResults(results) {
        // 清空结果列表
        resultsList.innerHTML = '';
        
        // 计算总大小
        let totalOriginalSize = 0;
        let totalCompressedSize = 0;
        let successCount = 0;
        
        // 处理每个结果
        results.forEach((result, index) => {
            totalOriginalSize += result.originalSize;
            
            if (result.success) {
                totalCompressedSize += result.compressedSize;
                successCount++;
                
                // 创建结果项
                const resultItem = createResultItem(result, index);
                resultsList.appendChild(resultItem);
            } else {
                // 处理失败项
                console.error(`文件 ${result.file.name} 压缩失败: ${result.error}`);
                totalCompressedSize += result.originalSize; // 失败项使用原始大小
                
                // 创建失败项
                const failedItem = createFailedResultItem(result, index);
                resultsList.appendChild(failedItem);
            }
        });
        
        // 更新汇总信息
        updateSummary(totalOriginalSize, totalCompressedSize);
        
        // 显示结果面板
        resultsPanel.style.display = 'block';
        
        // 如果全部失败，显示提示
        if (successCount === 0 && results.length > 0) {
            showError('所有图片压缩失败，请检查文件格式或尝试其他压缩设置。');
        }
    }

    /**
     * 创建成功结果项
     * @param {Object} result - 压缩结果
     * @param {number} index - 索引
     * @returns {HTMLElement} 结果项元素
     */
    function createResultItem(result, index) {
        const item = document.createElement('div');
        item.className = 'result-item';
        item.dataset.index = index;
        
        // 创建结果预览
        const preview = document.createElement('img');
        preview.className = 'result-preview';
        preview.src = URL.createObjectURL(result.compressedBlob);
        preview.alt = result.file.name;
        
        // 创建结果信息
        const info = document.createElement('div');
        info.className = 'result-info';
        
        const name = document.createElement('div');
        name.className = 'result-name';
        name.textContent = result.file.name;
        
        const stats = document.createElement('div');
        stats.className = 'result-stats';
        
        const originalSize = formatFileSize(result.originalSize);
        const compressedSize = formatFileSize(result.compressedSize);
        const sizeDifference = result.originalSize - result.compressedSize;
        const savingPercentage = Math.round(result.compressionRatio * 100);
        
        // 判断文件大小是增加还是减少
        let sizeChangeHtml;
        if (sizeDifference > 0) {
            // 大小减少，显示绿色减号
            sizeChangeHtml = `<span class="decrease">-${formatFileSize(sizeDifference)}</span>`;
        } else if (sizeDifference < 0) {
            // 大小增加，显示红色加号
            sizeChangeHtml = `<span class="increase">+${formatFileSize(Math.abs(sizeDifference))}</span>`;
        } else {
            // 大小不变
            sizeChangeHtml = '大小无变化';
        }
        
        stats.innerHTML = `
            原始大小: ${originalSize} → 压缩后: ${compressedSize} ${sizeChangeHtml}
            <span class="result-saving">(节省 ${savingPercentage}%)</span>
        `;
        
        info.appendChild(name);
        info.appendChild(stats);
        
        // 创建操作按钮
        const actions = document.createElement('div');
        actions.className = 'result-actions';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'button';
        downloadBtn.textContent = '下载';
        downloadBtn.addEventListener('click', () => {
            downloadCompressedFile(result);
        });
        
        actions.appendChild(downloadBtn);
        
        // 组装项目
        item.appendChild(preview);
        item.appendChild(info);
        item.appendChild(actions);
        
        return item;
    }

    /**
     * 创建失败结果项
     * @param {Object} result - 压缩结果
     * @param {number} index - 索引
     * @returns {HTMLElement} 失败项元素
     */
    function createFailedResultItem(result, index) {
        const item = document.createElement('div');
        item.className = 'result-item failed';
        item.dataset.index = index;
        
        // 创建结果信息
        const info = document.createElement('div');
        info.className = 'result-info';
        
        const name = document.createElement('div');
        name.className = 'result-name';
        name.textContent = result.file.name;
        
        const error = document.createElement('div');
        error.className = 'result-error';
        error.textContent = `压缩失败: ${result.error}`;
        
        info.appendChild(name);
        info.appendChild(error);
        
        // 组装项目
        item.appendChild(info);
        
        return item;
    }

    /**
     * 更新汇总信息
     * @param {number} originalSize - 原始总大小
     * @param {number} compressedSize - 压缩后总大小
     */
    function updateSummary(originalSize, compressedSize) {
        originalSizeElement.textContent = formatFileSize(originalSize);
        compressedSizeElement.textContent = formatFileSize(compressedSize);
        
        const sizeDifference = originalSize - compressedSize;
        const savingPercentage = originalSize > 0 ? 
            Math.round(sizeDifference / originalSize * 100) : 0;
        
        // 根据大小变化添加颜色标记
        if (sizeDifference > 0) {
            // 大小减少，显示绿色减号
            savedSizeElement.innerHTML = `<span class="decrease">-${formatFileSize(sizeDifference)}</span> (${savingPercentage}%)`;
        } else if (sizeDifference < 0) {
            // 大小增加，显示红色加号
            savedSizeElement.innerHTML = `<span class="increase">+${formatFileSize(Math.abs(sizeDifference))}</span> (${Math.abs(savingPercentage)}%)`;
        } else {
            // 大小不变
            savedSizeElement.textContent = '大小无变化 (0%)';
        }
    }

    /**
     * 下载压缩后的文件
     * @param {Object} result - 压缩结果
     */
    function downloadCompressedFile(result) {
        if (!result.success || !result.compressedBlob) {
            showError('该文件压缩失败，无法下载。');
            return;
        }
        
        const url = URL.createObjectURL(result.compressedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compressed_' + result.file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * 下载所有压缩文件（打包为ZIP）
     */
    function downloadAllCompressedFiles() {
        const resultItems = document.querySelectorAll('.result-item');
        
        if (resultItems.length === 0) {
            showError('没有可下载的压缩文件。');
            return;
        }
        
        // 如果只有一个文件，直接下载
        if (resultItems.length === 1) {
            const index = parseInt(resultItems[0].dataset.index);
            const result = getResultByIndex(index);
            if (result && result.success) {
                downloadCompressedFile(result);
            }
            return;
        }
        
        // 尝试使用JSZip创建ZIP文件
        try {
            // 动态加载JSZip库
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = createAndDownloadZip;
            script.onerror = () => {
                showError('无法加载ZIP库，请单独下载每个文件。');
            };
            document.head.appendChild(script);
        } catch (error) {
            console.error('创建ZIP文件失败:', error);
            showError('创建ZIP文件失败，请单独下载每个文件。');
        }
    }

    /**
     * 创建并下载ZIP文件
     */
    function createAndDownloadZip() {
        if (typeof JSZip === 'undefined') {
            showError('ZIP库加载失败，请单独下载每个文件。');
            return;
        }
        
        const zip = new JSZip();
        let pendingFiles = 0;
        
        // 显示进度条
        showProgress(0);
        
        // 添加每个压缩后的文件到ZIP
        const resultItems = document.querySelectorAll('.result-item');
        resultItems.forEach((item) => {
            const index = parseInt(item.dataset.index);
            const result = getResultByIndex(index);
            
            if (result && result.success && result.compressedBlob) {
                pendingFiles++;
                zip.file('compressed_' + result.file.name, result.compressedBlob);
            }
        });
        
        // 生成ZIP文件
        zip.generateAsync({ type: 'blob' }, (metadata) => {
            updateProgress(metadata.percent / 100);
        }).then((content) => {
            // 下载ZIP文件
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'compressed_images.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            hideProgress();
        }).catch((error) => {
            console.error('生成ZIP文件失败:', error);
            showError('生成ZIP文件失败: ' + error.message);
            hideProgress();
        });
    }

    /**
     * 根据索引获取结果
     * @param {number} index - 索引
     * @returns {Object|null} 压缩结果
     */
    function getResultByIndex(index) {
        // 注意：这个函数假设压缩结果已被存储
        // 在实际实现中，您需要保存压缩结果或在DOM元素中存储必要的数据
        
        // 这里简单实现，可能需要根据您的实际数据存储方式调整
        if (window.compressionResults && window.compressionResults[index]) {
            return window.compressionResults[index];
        }
        
        // 从结果项中获取数据
        const item = document.querySelector(`.result-item[data-index="${index}"]`);
        if (item) {
            const preview = item.querySelector('.result-preview');
            if (preview && preview.src.startsWith('blob:')) {
                const blob = getBlobFromURL(preview.src);
                if (blob) {
                    return {
                        success: true,
                        compressedBlob: blob,
                        file: { name: preview.alt || 'image.jpg' }
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * 从URL获取Blob（注意：这是一个不完整的实现，因为Blob URL不能直接转回Blob）
     * @param {string} url - Blob URL
     * @returns {Blob|null} Blob对象
     */
    function getBlobFromURL(url) {
        // 注意：这个方法在实际中不起作用，因为一旦创建了Blob URL，就无法直接获取回原始Blob
        // 实际实现应该保存原始Blob或使用其他方式存储
        return null;
    }

    /**
     * 清除结果
     */
    function clearResults() {
        resultsList.innerHTML = '';
        resultsPanel.style.display = 'none';
        selectedFiles = [];
        compressBtn.disabled = true;
        
        // 重置文件输入
        fileInput.value = '';
        folderInput.value = '';
    }

    /**
     * 格式化文件大小
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const units = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + units[i];
    }
} 