# WebAssembly模块目录

这个目录用于存放WebAssembly模块文件，这些模块用于在浏览器中实现高效的图像压缩。

## 基本模块

以下是基本的压缩模块：

### 1. MozJPEG模块 (必需)

**目标目录:** `mozjpeg/`

需要两个文件:
- `mozjpeg.wasm` - WebAssembly二进制文件
- `mozjpeg.js` - JavaScript胶水代码

### 2. PNGQuant模块 (必需)

**目标目录:** `pngquant/`

需要两个文件:
- `pngquant.wasm` - WebAssembly二进制文件
- `pngquant.js` - JavaScript胶水代码

### 3. WebP模块 (必需)

**目标目录:** `webp/`

需要两个文件:
- `webp.wasm` - WebAssembly二进制文件
- `webp.js` - JavaScript胶水代码

## 高级模块

以下是高级压缩模块，提供更好的压缩效果或支持更多格式：

### 4. AVIF模块

**目标目录:** `avif/`

需要两个文件:
- `avif.wasm` - WebAssembly二进制文件
- `avif.js` - JavaScript胶水代码

### 5. JPEG XL模块

**目标目录:** `jxl/`

需要两个文件:
- `jxl.wasm` - WebAssembly二进制文件
- `jxl.js` - JavaScript胶水代码

### 6. OxiPNG模块

**目标目录:** `oxipng/`

需要两个文件:
- `oxipng.wasm` - WebAssembly二进制文件
- `oxipng.js` - JavaScript胶水代码

### 7. QOI模块

**目标目录:** `qoi/`

需要两个文件:
- `qoi.wasm` - WebAssembly二进制文件
- `qoi.js` - JavaScript胶水代码

## 获取WebAssembly模块

您可以从以下来源获取这些模块：

1. **Squoosh项目** (推荐)
   - 网址: https://github.com/GoogleChromeLabs/squoosh
   - 下载并提取其WebAssembly构建

2. **WASM-ImageMin**
   - 网址: https://github.com/SingularityLabs-ai/wasm-imagemin
   - 提供了多种图像压缩算法的WebAssembly版本

3. **Squoosh App**
   - 访问 https://squoosh.app/
   - 使用浏览器开发工具，在Network标签中查找并下载.wasm和.js文件

## 应急备选方案

如果您无法获取WebAssembly模块，应用程序仍然可以运行，但会使用浏览器内置的Canvas API进行基本压缩，这样压缩效果会稍差一些。 