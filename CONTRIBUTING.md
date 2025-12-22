# 贡献指南 | Contributing Guide

[中文](#中文) | [English](#english)

---

<a name="中文"></a>
## 中文

感谢您考虑为 Markdown Preview Plugin 做出贡献！

### 📋 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

#### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### 类型 (Type)

| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响功能） |
| `refactor` | 代码重构（不是新功能也不是 Bug 修复） |
| `perf` | 性能优化 |
| `test` | 添加或修改测试 |
| `chore` | 构建过程或辅助工具变动 |
| `ci` | CI 配置变更 |

#### 示例

```bash
# 新功能
feat(preview): add support for mermaid diagrams

# Bug 修复
fix(theme): correct dark mode text color

# 文档更新
docs(readme): update installation instructions

# 性能优化
perf(render): optimize markdown parsing performance
```

### 🔄 开发流程

1. **Fork 仓库**
   ```bash
   git clone https://github.com/your-username/markdown-preview-plugin.git
   cd markdown-preview-plugin
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **安装依赖**
   ```bash
   npm install
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **进行开发**
   - 编写代码
   - 确保代码符合规范
   - 测试功能正常

6. **构建测试**
   ```bash
   npm run build
   ```

7. **提交代码**
   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

8. **推送并创建 PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### 📁 代码规范

- 使用 TypeScript 编写代码
- 组件使用函数式组件和 Hooks
- 保持代码简洁清晰
- 添加必要的注释说明
- 遵循 React 最佳实践

### 🐛 提交 Issue

提交 Issue 时请包含：

1. **问题描述**: 清晰描述问题或建议
2. **复现步骤**: 如何复现该问题
3. **期望行为**: 您期望的正确行为
4. **实际行为**: 实际发生的情况
5. **环境信息**: 浏览器版本、操作系统等

### 📝 版本发布

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**: 不兼容的 API 修改
- **次版本号**: 向下兼容的功能新增
- **修订号**: 向下兼容的问题修正

发布新版本时，请更新 `package.json` 中的版本号，GitHub Actions 会自动创建 Release。

---

<a name="english"></a>
## English

Thank you for considering contributing to Markdown Preview Plugin!

### 📋 Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

#### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation update |
| `style` | Code formatting (no functional changes) |
| `refactor` | Code refactoring |
| `perf` | Performance improvement |
| `test` | Adding or modifying tests |
| `chore` | Build process or tooling changes |
| `ci` | CI configuration changes |

### 🔄 Development Workflow

1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`
5. Make your changes
6. Build and test: `npm run build`
7. Commit with conventional commit message
8. Push and create a Pull Request

### 📁 Code Standards

- Use TypeScript
- Use functional components with Hooks
- Keep code clean and readable
- Add necessary comments
- Follow React best practices

### 📝 Versioning

This project follows [Semantic Versioning](https://semver.org/):

- **Major**: Incompatible API changes
- **Minor**: Backward-compatible new features
- **Patch**: Backward-compatible bug fixes

---

**Thank you for contributing! ❤️**