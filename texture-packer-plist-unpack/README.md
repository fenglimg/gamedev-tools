# TexturePacker 精灵图集拆分工具

一个简单高效的基于Web的工具，用于将TexturePacker/Cocos2d-x生成的精灵图集（sprite sheets）拆分成单独的图像文件。

![工具预览](preview.png)

## 功能特点

- 🖼️ 支持解析TexturePacker生成的plist文件（Cocos2d-x格式）
- 📤 拖放式文件上传界面，分离的plist和png上传区域
- 🔍 实时预览提取的精灵图像
- 💾 支持单个精灵下载或批量打包下载（ZIP格式）
- 🔄 正确处理旋转的精灵
- 📱 响应式设计，适配移动设备
- 🐞 内置调试模式，帮助解决问题

## 使用说明

1. 访问工具网页
2. 拖放或选择一个.plist文件到左侧区域
3. 拖放或选择对应的.png文件到右侧区域
4. 点击"处理图集"按钮
5. 查看提取的精灵预览
6. 使用"下载"按钮下载单个精灵，或点击"下载所有精灵"获取ZIP包

## 支持的文件格式

- **plist文件**: TexturePacker生成的Cocos2d-x格式的plist文件
- **图像文件**: 与plist对应的PNG格式图集文件

> 注意：目前主要支持TexturePacker默认的Cocos2d-x plist格式。其他格式可能需要额外适配。

## 技术实现

### 前端技术栈

- **HTML5/CSS3** - 用户界面
- **JavaScript** - 核心处理逻辑
- **Canvas API** - 图像处理和精灵提取
- **FileReader API** - 文件读取
- **FileSaver.js** - 文件下载
- **JSZip** - ZIP文件生成

### 核心功能实现

- 使用`DOMParser`解析XML格式的plist文件
- 使用正则表达式处理多种格式的精灵坐标数据
- 使用Canvas API裁剪和处理精灵，包括旋转处理
- 基于toDataURL API导出精灵为PNG格式

## 本地部署

1. 克隆仓库:
   ```
   git clone https://github.com/yourusername/texturepacker-splitter.git
   ```

2. 进入项目目录:
   ```
   cd texturepacker-splitter
   ```

3. 使用任意HTTP服务器启动项目，例如:
   ```
   python -m http.server
   ```
   
4. 打开浏览器访问 `http://localhost:8000`

## 浏览器兼容性

该工具使用现代Web API，支持以下浏览器的最新版本:

- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari

## 常见问题

### plist解析错误

- 确保使用的是TexturePacker导出的Cocos2d-x格式plist文件
- 尝试启用调试模式查看详细错误信息
- 检查plist文件是否包含完整的frames和metadata部分

### 图像质量问题

- 导出的PNG图像质量默认设置为0.95（高质量）
- 如需调整，可修改`extractSprites`函数中的`imageQuality`参数

## 未来计划

- [ ] 支持更多plist格式
- [ ] 添加图像格式选项（PNG/JPG/WebP）
- [ ] 批量处理多组图集
- [ ] 支持调整输出图像大小
- [ ] 添加图像处理功能（裁剪、调整等）

## 贡献指南

欢迎提交Pull Request或Issue来改进这个工具。贡献前请先创建Issue讨论您的想法。

## 许可证

本项目采用[MIT许可证](LICENSE)。

## 致谢

- [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
- [JSZip](https://stuk.github.io/jszip/)
- [TexturePacker](https://www.codeandweb.com/texturepacker)
