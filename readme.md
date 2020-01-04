> www.manhuadb.com 漫画爬虫

## 一些说明

> 可以直接跳到使用说明部分

这个仓库的代码主要是学习 Node.js 来用的，当然能够用来做一些方便自己的事情那就更好了～～

所以，希望看到这份代码的同学，不要用作其他用途，权当用来交流之用最好。

### 特性

1. 使用 puppeteer 作为加载页面的工具
2. 支持最多同时 5 个 page 实例进行页面加载
3. 充分的容错机制，对于一部漫画，直至下载完成才会结束进程

## 使用

> 项目以 TypeScript 编写，使用`ts-node`作为运行时环境，在`VsCode`上开发。

- 下载代码

```bash
git clone git@github.com:Xixi20160512/manhuadb-spider.git
```

使用`.env.tpl`模版生成一个`.env`文件

```bash
mv .env.tpl .env
```

> 目前的环境配置比较少，简单介绍如下：

```text
#需要爬取的漫画的id。
#eg:https://www.manhuadb.com/manhua/971
#这里的id就是971
ID=971
#当前环境，如果是开发环境的话，日志输出会多一些
ENV=development
#加载每个页面的超时时间
TIMEOUT=40
```

- 使用 VsCode 打开目

打开终端，安装项目依赖

> 推荐使用 yarn

```bash
yarn
```

打开 VsCode 调试界面，直接启动名为`Launch Program`的调试配置。随后在调试控制台就可以看到以下输出了：
![2020-01-04-12-15-47](http://picture-album.xixi2016.cc/2020-01-04-12-15-47.png)

**Enjoy**
