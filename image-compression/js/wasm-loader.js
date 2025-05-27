/**
 * WebAssembly模块加载器
 * 参考Squoosh项目的实现方式
 */

class WasmLoader {
    constructor() {
        this.modules = {};
        this.modulePromises = {};
        this.baseUrl = 'wasm/';
        this.initialized = false;
        
        // 模块配置信息
        this.moduleConfigs = {
            'mozjpeg': {
                mainUrl: 'mozjpeg/mozjpeg.wasm',
                jsUrl: 'mozjpeg/mozjpeg.js',
                loaded: false
            },
            'pngquant': {
                mainUrl: 'pngquant/pngquant.wasm',
                jsUrl: 'pngquant/pngquant.js',
                loaded: false
            },
            // 其他编解码器...
        };
    }
    
    /**
     * 初始化WebAssembly加载器
     * @returns {Promise<void>}
     */
    async init() {
        if (this.initialized) {
            return Promise.resolve();
        }
        
        try {
            console.log('初始化WebAssembly加载器...');
            
            // 检查运行环境
            const isFileProtocol = window.location.protocol === 'file:';
            if (isFileProtocol) {
                console.warn('检测到通过文件协议直接打开，WebAssembly模块可能无法加载。');
                console.warn('建议：使用HTTP服务器或部署到GitHub Pages以获得完整功能。');
                this.initialized = true;
                return Promise.resolve();
            }
            
            // 预加载核心模块
            await this.loadModule('mozjpeg');
            await this.loadModule('pngquant');
            
            this.initialized = true;
            console.log('WebAssembly加载器初始化完成');
            
            return Promise.resolve();
        } catch (error) {
            console.error('WebAssembly加载器初始化失败:', error);
            return Promise.reject(error);
        }
    }
    
    /**
     * 加载WebAssembly模块
     * @param {string} moduleName - 模块名称
     * @returns {Promise<Object>} - 加载完成的模块
     */
    loadModule(moduleName) {
        if (!this.moduleConfigs[moduleName]) {
            return Promise.reject(new Error(`未知模块: ${moduleName}`));
        }
        
        const config = this.moduleConfigs[moduleName];
        
        if (config.loaded && this.modules[moduleName]) {
            return Promise.resolve(this.modules[moduleName]);
        }
        
        if (this.modulePromises[moduleName]) {
            return this.modulePromises[moduleName];
        }
        
        console.log(`加载WebAssembly模块: ${moduleName}`);
        
        // 创建新的加载Promise
        this.modulePromises[moduleName] = (async () => {
            try {
                // 1. 加载JavaScript文件
                const jsUrl = this.baseUrl + config.jsUrl;
                await this.loadScript(jsUrl);
                
                // 2. 通过全局模块名称获取模块工厂
                const moduleFactory = window[`${moduleName}Module`];
                if (!moduleFactory) {
                    throw new Error(`未找到模块工厂函数: ${moduleName}Module`);
                }
                
                // 3. 加载WASM文件
                const wasmUrl = this.baseUrl + config.mainUrl;
                const wasmBinary = await fetch(wasmUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`无法加载WASM文件: ${wasmUrl}`);
                        }
                        return response.arrayBuffer();
                    });
                
                // 4. 初始化模块
                const module = await this.initEmscriptenModule(moduleFactory, wasmBinary);
                
                // 5. 保存并返回模块
                this.modules[moduleName] = module;
                config.loaded = true;
                return module;
            } catch (error) {
                console.error(`加载模块 ${moduleName} 失败:`, error);
                delete this.modulePromises[moduleName];
                throw error;
            }
        })();
        
        return this.modulePromises[moduleName];
    }
    
    /**
     * 加载JavaScript脚本
     * @param {string} url - 脚本URL
     * @returns {Promise<any>} - 加载的模块
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            // 仅使用传统脚本加载方式
            this.loadScriptTag(url, resolve, reject);
        });
    }
    
    /**
     * 通过script标签加载JavaScript
     * @private
     */
    loadScriptTag(url, resolve, reject) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.async = true;
        
        script.onload = () => {
            // 检查全局变量中是否有导出的模块
            const moduleName = url.split('/').pop().replace('.js', '');
            const moduleExport = window[`${moduleName}Module`];
            
            if (moduleExport) {
                resolve(moduleExport);
            } else {
                reject(new Error(`脚本加载成功但未找到导出的模块: ${url}`));
            }
        };
        
        script.onerror = () => {
            reject(new Error(`脚本加载失败: ${url}`));
        };
        
        document.head.appendChild(script);
    }
    
    /**
     * 初始化Emscripten模块
     * @param {Function} moduleFactory - 模块工厂函数
     * @param {ArrayBuffer} wasmBinary - WebAssembly二进制数据
     * @returns {Promise<Object>} - 初始化完成的模块
     */
    initEmscriptenModule(moduleFactory, wasmBinary) {
        return new Promise((resolve, reject) => {
            try {
                const module = moduleFactory({
                    wasmBinary,
                    noInitialRun: true,
                    onRuntimeInitialized: () => {
                        console.log('模块运行时初始化完成');
                        resolve(module);
                    },
                    onAbort: (reason) => {
                        reject(new Error(`模块初始化失败: ${reason}`));
                    }
                });
                
                // 对于没有返回Promise的旧式模块，我们手动检查module.ready
                if (module && typeof module.ready === 'object' && typeof module.ready.then === 'function') {
                    // 对于有ready Promise的模块，等待它
                    module.ready.then(() => resolve(module)).catch(reject);
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    
    /**
     * 获取已加载的模块
     * @param {string} moduleName - 模块名称
     * @returns {Object} - WebAssembly模块
     */
    getModule(moduleName) {
        if (!this.modules[moduleName]) {
            throw new Error(`模块 ${moduleName} 尚未加载`);
        }
        return this.modules[moduleName];
    }
    
    /**
     * 检查WebAssembly支持
     * @static
     * @returns {boolean} - 是否支持WebAssembly
     */
    static isWebAssemblySupported() {
        try {
            if (typeof WebAssembly === 'object' && 
                typeof WebAssembly.instantiate === 'function') {
                const module = new WebAssembly.Module(
                    new Uint8Array([0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00])
                );
                if (module instanceof WebAssembly.Module) {
                    const instance = new WebAssembly.Instance(module);
                    return instance instanceof WebAssembly.Instance;
                }
            }
        } catch (e) {}
        return false;
    }
}

// 创建全局加载器实例
const wasmLoader = new WasmLoader();

// 检查浏览器是否支持WebAssembly
if (!WasmLoader.isWebAssemblySupported()) {
    console.error('您的浏览器不支持WebAssembly，该应用程序无法运行。');
    alert('您的浏览器不支持WebAssembly，请升级您的浏览器或尝试使用最新版的Chrome、Firefox或Edge。');
} 