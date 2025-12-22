# Markdown Preview Plugin for Feishu Bitable

[English](#english) | [中文](#中文)

---

<a name="中文"></a>
## 中文文档

### 📋 项目简介

Markdown 预览插件是一款专为飞书多维表格设计的边栏插件，可以实时渲染单元格中的 Markdown 内容，提供专业的文档预览体验。

### ✨ 功能特性

| 功能 | 描述 |
|------|------|
| 📝 实时预览 | 选中文本或 URL 单元格后自动渲染 Markdown 内容 |
| 🎨 GFM 支持 | 完整支持 GitHub Flavored Markdown 语法 |
| 🌗 主题适配 | 自动适配多维表格的浅色/深色主题 |
| 💻 代码高亮 | 支持 180+ 种编程语言的语法高亮 |
| 📊 Mermaid 图表 | 支持流程图、时序图、甘特图、思维导图等 |
| 🔢 数学公式 | 支持 LaTeX 数学公式 (KaTeX) |
| 📋 一键复制 | 支持复制原始 Markdown 或渲染后的 HTML |
| 🖥️ 全屏预览 | 支持全屏模式查看长内容 |
| 📥 导出功能 | 支持导出为 Markdown 文件或 PNG 图片 |
| 🔤 字体调节 | 支持小/中/大/特大四种字体大小 |

### 🛠️ 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite 5
- **Markdown 渲染**: react-markdown + remark-gfm
- **代码高亮**: highlight.js
- **数学公式**: KaTeX
- **图表渲染**: Mermaid
- **飞书 SDK**: @lark-base-open/js-sdk

### 📦 安装与部署

#### 方式一：直接使用构建产物

项目已包含预构建的 `dist` 目录，可直接部署到任意静态服务器。

```bash
# 克隆仓库
git clone https://github.com/your-username/markdown-preview-plugin.git

# 将 dist 目录部署到静态服务器
```

#### 方式二：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

#### 方式三：Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/markdown-preview-plugin)

### 📖 使用指南

#### 在飞书多维表格中添加插件

1. 打开任意飞书多维表格
2. 点击右侧「扩展脚本」或「插件」面板
3. 选择「添加自定义插件」
4. 输入插件地址（您的部署 URL）
5. 点击确认完成添加

#### 使用插件

1. 选中包含 Markdown 内容的文本或 URL 单元格
2. 插件会自动渲染 Markdown 内容
3. 使用工具栏进行复制、下载、全屏等操作

### 📁 项目结构

```
markdown-preview-plugin/
├── dist/                   # 生产构建产物（可直接部署）
├── src/
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   └── index.css           # 全局样式
├── .github/
│   └── workflows/
│       └── auto-release.yml  # 自动发布工作流
├── index.html              # HTML 模板
├── package.json            # 项目配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 构建配置
└── vercel.json             # Vercel 部署配置
```

### 📄 支持的 Markdown 语法

- **基础语法**: 标题、段落、粗体、斜体、删除线
- **列表**: 有序列表、无序列表、任务列表
- **代码**: 行内代码、代码块（支持语法高亮）
- **表格**: GFM 表格语法
- **引用**: 块引用
- **链接与图片**: 链接、图片、自动链接
- **HTML**: 支持内嵌 HTML 标签
- **Mermaid 图表**: 流程图、时序图、甘特图等
- **数学公式**: 行内公式 `$...$`、块级公式 `$$...$$`

### 🔄 版本发布

项目使用 GitHub Actions 自动发布。当 `package.json` 中的版本号更新并推送到 main/master 分支时，会自动创建对应版本的 Release。

### 📜 许可证

MIT License

### 🤝 贡献指南

欢迎提交 Issue 和 Pull Request。详见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

---

<a name="english"></a>
## English Documentation

### 📋 Introduction

Markdown Preview Plugin is a sidebar plugin designed for Feishu/Lark Bitable that renders Markdown content from cells in real-time, providing a professional document preview experience.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 Live Preview | Automatically renders Markdown content when selecting text or URL cells |
| 🎨 GFM Support | Full support for GitHub Flavored Markdown syntax |
| 🌗 Theme Adaptation | Automatically adapts to Bitable's light/dark theme |
| 💻 Code Highlighting | Syntax highlighting for 180+ programming languages |
| 📊 Mermaid Diagrams | Support for flowcharts, sequence diagrams, Gantt charts, mind maps, etc. |
| 🔢 Math Formulas | LaTeX math formula support (KaTeX) |
| 📋 One-Click Copy | Copy raw Markdown or rendered HTML |
| 🖥️ Fullscreen Preview | Fullscreen mode for viewing long content |
| 📥 Export | Export as Markdown file or PNG image |
| 🔤 Font Size Adjustment | Four font size options |

### 🛠️ Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Markdown Rendering**: react-markdown + remark-gfm
- **Code Highlighting**: highlight.js
- **Math Formulas**: KaTeX
- **Diagram Rendering**: Mermaid
- **Feishu SDK**: @lark-base-open/js-sdk

### 📦 Installation & Deployment

#### Option 1: Use Pre-built Files

The project includes a pre-built `dist` directory that can be deployed directly to any static server.

#### Option 2: Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

#### Option 3: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/markdown-preview-plugin)

### 📜 License

MIT License

---

**Made with ❤️ for Feishu Bitable**