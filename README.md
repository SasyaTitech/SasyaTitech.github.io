# SasyaTitech.github.io

Mingda Liu 的个人主页。纯静态站点：不需要构建，不依赖框架，推到 GitHub 就能上线。

线上地址：<https://sasyatitech.github.io/>

## 目录

```
index.html            首页：所有内容都在这里，按 Look 00–04 分节
404.html              找不到页面时显示
assets/css/site.css   全部样式，开头是设计变量（tokens）
assets/js/site.js     语言切换、复制邮箱、首屏光影、数据印花
assets/img/           放照片（portrait.jpg）
assets/favicon.svg
.nojekyll             告诉 GitHub Pages 原样发布，不经过 Jekyll
```

## 本地预览

```bash
python -m http.server 4173
```

然后打开 <http://localhost:4173>。直接双击 `index.html` 也能看，但字体和脚本在 `file://` 下可能表现不一致。

## 常见改动

**放照片**：把一张 4:5 的照片存为 `assets/img/portrait.jpg`，刷新就能看到。页面会自动把它转成黑白。想保留原色，就给 `<figure class="portrait">` 加上 `portrait--colour` 这个 class。最好是单一硬光、背景是素墙的照片。宽度约 1200px、文件小于 300KB 就够了。

**加一篇论文**：在 `index.html` 的 `#work` 里复制一个 `<article class="look …">` 块，然后：
- 改 `Look 0X / 0N` 编号，以及节标题旁边的计数；
- 选一种布料颜色：`cloth-black`、`cloth-stone`、`cloth-blue`、`cloth-violet`、`cloth-oxide`；
- 英文写在 `class="en"` 里，中文写在 `class="zh"` 里，两个都要写。

偶数位的卡片会自动错位、叠在左边那张上面，不需要手动调。

**加一个项目**：复制一个 `<article class="proj">`。想让图文左右对调，就加 `proj--flip`。印花由数据属性生成，同样的 seed 每次画出来都一样：
- `data-print="rain"`：雨痕拼布。`data-count` 是雨痕个数，`data-strips` 是布条数，`data-seed` 是随机种子。
- `data-print="threads"`：抽线细条纹。`data-total` 是总线数，`data-pulled` 是被抽掉的线数，`data-labels="上标签|下标签"`。

新的印花类型写在 `site.js` 末尾的 `printers` 里。

**换季**：首屏的 `A/W 2026` 和页脚的 `Edition A/W 2026 · updated 2026.11` 是“这一季”的标记。每次大改就换一季，比如 S/S 2027。

**颜色和材质**：都在 `site.css` 开头的 `:root` 里，浅色和深色各一套。墙面用的是 `--wall` 和 `--tex-wall`，布料用的是 `--cloth-*` 和 `--tex-cloth`。

**首屏光影**：`<section class="hero">` 上有三个属性：`data-lx` 和 `data-ly` 是光落点的百分比，`data-edge` 是左下角那条硬阴影边界的位置。触屏设备和开启“减少动态效果”的设备上，光是静止的。

**加一个新页面**（比如 `/notes/`）：新建 `notes/index.html`，复用 `/assets/css/site.css` 和 `/assets/js/site.js`，结构参考 `404.html`，最简单。

## 部署

仓库名必须是 `SasyaTitech.github.io`。推到 `main` 分支后，在仓库的 Settings → Pages 里选 “Deploy from a branch”，分支选 `main`，目录选 `/ (root)`。
