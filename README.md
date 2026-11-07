# 边豪 · 个人作品集

这是边豪的个人作品集存档，用来自己留存。站点只有两页：

- 首页：短介绍
- 真车案例：面向二手车商的 B2B 交易保障平台

没有后端，没有统计脚本。字体和图片都在仓库里，打开页面不需要访问外部字体或脚本服务。

## 本地预览

```bash
npm install
npm run dev
```

浏览器打开终端里给出的地址。首页是 `/`，真车案例是 `/zhen-che/`。

## 构建

```bash
npm run build
npm run preview
```

构建结果在 `dist/`：

- `dist/index.html` 首页
- `dist/zhen-che/index.html` 真车案例

资源使用相对路径。放在 GitHub、压缩包，或任意静态目录里都可以打开，不需要单独配置域名。

## 字体

标题用 Noto Serif SC，正文用 Noto Sans SC。两套字都按页面实际用字做了子集，文件在 `src/fonts/`。许可是 SIL Open Font License 1.1，全文见 `src/fonts/OFL.txt`。
