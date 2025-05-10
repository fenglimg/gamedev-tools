# 游戏开发工具集

这是一个游戏开发工具集合，包含多个游戏开发相关的工具项目。

在线访问：https://fenglimg.github.io/gamedev-tools/

## 索引生成器

仓库中包含一个自动生成索引页面的脚本，可以扫描所有子项目并创建漂亮的导航页面。

### Node.js版本

使用Node.js版本的索引生成器：

```bash
# 安装依赖
npm install

# 运行生成脚本
npm run generate
```

## 已有项目

- texture-packer-plist-unpack: Texture Packer plist文件解包工具
- behavior3editor: 行为树编辑器

## 添加新项目

1. 在仓库根目录创建新的项目文件夹
2. 确保项目文件夹中包含：
   - index.html：项目入口页面
   - README.md：项目说明文档
   - preview.png (可选)：项目预览图

3. 运行索引生成器脚本更新主页

## 许可证

MIT