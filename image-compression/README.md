# TinyImage - 纯前端图片压缩工具

一款基于WebAssembly的纯前端图片压缩工具，能够达到类似TinyPNG的压缩效果。无需服务器，直接在浏览器中运行，保护您的图片隐私。

## 特性

- **完全在客户端运行**：所有图片处理和压缩都在浏览器中完成，不会上传到任何服务器
- **高质量压缩**：使用WebAssembly版的专业压缩算法（mozjpeg、pngquant、webp、avif、jpeg xl等）
- **批量处理**：支持一次压缩多张图片或整个文件夹
- **文件夹结构**：支持压缩并下载为ZIP文件
- **多格式支持**：支持JPEG、PNG、WebP、AVIF、JPEG XL、QOI和GIF格式
- **元数据移除**：自动移除图片中的EXIF、GPS等元数据
- **进度显示**：实时显示压缩进度
- **直观界面**：简洁易用的用户界面

## 安装和部署

### 方法一：使用本地HTTP服务器（推荐）

由于浏览器安全限制，WebAssembly文件无法通过直接打开HTML文件（file://协议）加载。请按以下步骤使用：

1. 下载或克隆本仓库
2. 安装必要的WebAssembly模块（见下文）
3. 使用以下任一方式启动本地HTTP服务器：

   **使用Node.js**:
   ```bash
   # 安装http-server（只需执行一次）
   npm install -g http-server
   
   # 进入项目目录
   cd web-version
   
   # 启动服务器
   http-server -p 8080
   ```

   **使用Python**:
   ```bash
   # Python 3
   python -m http.server 8080
   
   # Python 2
   python -m SimpleHTTPServer 8080
   ```

4. 在浏览器中访问 http://localhost:8080

### 方法二：通过GitHub Pages使用

1. Fork本仓库
2. 启用GitHub Pages功能
3. 设置源分支为`main`或您的默认分支
4. 完成！现在您可以通过`https://[your-username].github.io/[repo-name]`访问您的应用

### 注意事项

直接打开`index.html`文件（不使用HTTP服务器）将会导致WebAssembly模块加载失败，出现"初始化图像压缩器失败"错误。这是由于浏览器的安全策略限制，不允许通过file://协议使用fetch()API加载WebAssembly文件。

## WebAssembly模块安装

本项目需要以下WebAssembly模块才能实现最佳压缩效果：

### 基本模块

- **mozjpeg**：用于JPEG压缩
- **pngquant**：用于PNG压缩
- **webp**：用于WebP压缩和转换

### 高级模块

- **avif**：用于AVIF格式压缩
- **jxl**：用于JPEG XL格式压缩
- **oxipng**：用于高级PNG优化
- **qoi**：用于快速无损压缩

### 获取WebAssembly模块

您可以从以下来源获取WebAssembly模块：

1. [Squoosh](https://github.com/GoogleChromeLabs/squoosh)项目（推荐）
   - 下载其WebAssembly构建并提取需要的模块
   - 路径格式：`wasm/[module-name]/[module-name].wasm`和`wasm/[module-name]/[module-name].js`

2. [WASM-ImageMin](https://github.com/SingularityLabs-ai/wasm-imagemin)
   - 提供了多种图像压缩算法的WebAssembly版本

3. 从头构建（高级用户）
   - 使用Emscripten将原生库编译为WebAssembly

## 文件夹结构

```
web-version/
├── index.html           # 主HTML页面
├── css/
│   └── styles.css       # 样式表
├── js/
│   ├── app.js           # 主应用逻辑
│   ├── compressors.js   # 压缩算法实现
│   └── wasm-loader.js   # WebAssembly加载器
└── wasm/
    ├── mozjpeg/         # MozJPEG模块（JPEG压缩）
    ├── pngquant/        # PNGQuant模块（PNG压缩）
    ├── webp/            # WebP模块
    ├── avif/            # AVIF模块（高压缩率）
    ├── jxl/             # JPEG XL模块（新一代格式）
    ├── oxipng/          # OxiPNG模块（PNG优化）
    └── qoi/             # QOI模块（快速无损）
```

## 浏览器兼容性

- Chrome 79+
- Firefox 72+
- Edge 79+
- Safari 15.2+

所有支持WebAssembly、File API和Web Workers的现代浏览器都应该能够运行此应用。

## 开发指南

如果您想扩展或修改本项目，以下是一些关键文件及其功能的说明：

- **wasm-loader.js**：负责加载和初始化WebAssembly模块
- **compressors.js**：实现各种压缩算法和图像处理逻辑
- **app.js**：处理用户界面交互和应用流程

### 添加新的压缩算法

1. 在`wasm-loader.js`中添加新模块的配置
2. 在`compressors.js`中实现相应的压缩方法
3. 在`index.html`的算法选择下拉菜单中添加新选项

## 贡献指南

欢迎贡献代码、报告问题或提出建议。请遵循以下步骤：

1. Fork本仓库
2. 创建特性分支（`git checkout -b feature/amazing-feature`）
3. 提交您的更改（`git commit -m 'Add some amazing feature'`）
4. 推送到分支（`git push origin feature/amazing-feature`）
5. 创建Pull Request

## 许可证

本项目采用MIT许可证 - 详情请参见[LICENSE](LICENSE)文件。

## 致谢

- [Squoosh](https://github.com/GoogleChromeLabs/squoosh) - 提供了WebAssembly图像压缩的灵感和部分代码
- [MozJPEG](https://github.com/mozilla/mozjpeg) - 高质量JPEG压缩库
- [PNGQuant](https://pngquant.org/) - 优秀的PNG压缩工具
- [WebP](https://developers.google.com/speed/webp) - 现代图像格式 