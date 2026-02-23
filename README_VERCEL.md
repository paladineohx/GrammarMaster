# 语法大师 - Vercel 部署指南

这是一个基于 Vite + React + Tailwind CSS 构建的英语语法练习应用。

## 部署步骤

1. **准备代码**：确保你的代码已经提交到 GitHub 仓库。
2. **登录 Vercel**：访问 [Vercel 控制台](https://vercel.com/new)。
3. **导入项目**：选择你的 GitHub 仓库并点击 "Import"。
4. **配置项目**：
   - **Framework Preset**: 选择 `Vite`。
   - **Build Command**: `npm run build`。
   - **Output Directory**: `dist`。
5. **环境变量**：
   - 如果你使用了 Gemini API 或其他 API，请在 "Environment Variables" 中添加对应的变量（如 `GEMINI_API_KEY`）。
6. **点击 Deploy**：等待构建完成即可访问。

## 项目结构说明

- `vercel.json`: 处理单页应用（SPA）的路由重定向。
- `dist/`: 构建后的静态文件目录。
- `src/`: 源代码目录。
