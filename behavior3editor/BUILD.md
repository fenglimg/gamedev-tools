# 构建Behavior3编辑器

你可以在两种不同的环境中构建编辑器：开发环境和生产环境。对于开发环境，你可以运行本地Web服务器，它会在项目有新修改时自动构建并重新加载应用程序。生产模式则为不同平台构建和打包编辑器。


## 要求

要运行编辑器，你需要以下软件：

**所有情况下都需要：**
- [NodeJS](https://nodejs.org)
- [Bower](http://bower.io)

*如果你想运行/构建桌面版本：*
- [Node-Webkit](http://nwjs.io)
- [Node-Webkit Builder](https://github.com/nwjs/nw-builder)


## 配置

在构建之前，你需要安装一些第三方库。你需要在控制台中运行以下命令：

    npm install

以及：

    bower install

前者安装了一堆NodeJS模块，它们用于构建系统和桌面应用程序的一些依赖项。后者安装CSS和JavaScript供应商库。


## 开发期间的构建

在开发期间，你可以在Web浏览器中运行编辑器，并自动构建和重新加载：

    gulp serve

这将在`http://127.0.0.1:8000`上运行一个Web服务器。

要运行桌面版本（没有自动构建和重新加载）：

    gulp nw


## 构建最终版本

只需运行：

    gulp dist



