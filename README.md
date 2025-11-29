# CogniQuest: 全能学习工作台

**CogniQuest** 是一个下一代 AI 驱动的学习平台，旨在适应任何学科。无论您是掌握微积分、学习法语还是练习 Python，CogniQuest 都能提供量身定制的交互式工作区。

![CogniQuest Banner](https://via.placeholder.com/1200x400?text=CogniQuest+Universal+Workspace)

## 🌟 核心功能

### 1. 多学科学习引擎
*   **费曼学习流**：通过"概念 -> 类比 -> 测验"循环掌握概念。
*   **面试准备**：翻转卡片式快速问答，为面试做好准备。
*   **通用渲染**：
    *   **数学**：交互式函数绘图、动态几何（可拖动点）和 LaTeX 公式渲染。
    *   **语言**：语音朗读 (TTS)、互动查词和 AI 角色扮演场景。
    *   **编程**：语法高亮和逻辑可视化（模拟）。

### 2. AI 驱动的交互
*   **AI 导师**：上下文感知的聊天助手，引导您完成每一步。
*   **角色扮演模式**：让自己沉浸在现实世界的场景中（例如，在餐厅点餐），与 AI 角色互动。
*   **智能内容**：上传您自己的笔记/文档，AI 将生成结构化的课程计划。

### 3. 现代且响应式的 UI
*   **玻璃拟态设计**：灵感来自高端 IDE 的时尚现代界面。
*   **分屏工作区**："指南"（AI 聊天）和"练习"（视觉/代码）的专用区域。
*   **深色模式**：完全支持深夜学习。

## 🚀 快速开始

###先决条件
*   Node.js (v16+)
*   npm 或 yarn

### 安装

1.  **克隆仓库**
    ```bash
    git clone <repository-url>
    cd CogniQuest
    ```

2.  **安装依赖**
    ```bash
    # 安装前端依赖
    npm install

    # 安装后端依赖
    cd server
    npm install
    cd ..
    ```

### 运行应用程序

您需要同时运行前端和后端服务器。

1.  **启动后端服务器**
    ```bash
    cd server
    npm run dev
    ```
    *服务器运行在 http://localhost:3001*

2.  **启动前端客户端**（在新的终端中）
    ```bash
    npm run dev
    ```
    *客户端运行在 http://localhost:5173*

## 📚 演示课程

我们包含了一些演示文件来展示平台的功能。使用搜索栏中的"上传"按钮导入这些 JSON 文件。

| 文件 | 描述 | 展示的功能 |
| :--- | :--- | :--- |
| `math_demo_lesson.json` | 线性函数 | 交互式函数绘图仪，参数滑块 |
| `geometry_demo_lesson.json` | 几何基础 | **可拖动点**，动态直线方程 |
| `latex_demo_lesson.json` | 高等数学 | **LaTeX 渲染**（积分，麦克斯韦方程组） |
| `language_demo_lesson.json` | 法语和西班牙语 | **语音朗读**，**互动文本**（点击定义） |
| `roleplay_demo_lesson.json` | 餐厅场景 | **AI 角色扮演模式**（与服务员聊天） |

## 🛠️ 技术栈

*   **前端**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
*   **可视化**: function-plot, Recharts, Mermaid.js, React Markdown (KaTeX)
*   **后端**: Node.js, Express, SQLite (better-sqlite3)
*   **AI**: DeepSeek API (已集成)

## 📝 许可证

MIT
