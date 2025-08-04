# AI种草文案生成器

一个基于AI的智能种草文案生成器，专为小红书等社交平台设计，帮助用户快速生成高质量的产品推广文案。

## 功能特性

- 🎯 **智能文案生成**: 基于智谱AI的强大文案生成能力
- 📝 **多种内容类型**: 支持单品推荐、合集推荐、使用评测、对比评测
- 👥 **精准人群定位**: 针对Z世代、敏感肌人群、上班族、学生群体
- 🎨 **多样化风格**: 情感化、专业化、生活化、科普化文案风格
- 📚 **文案库管理**: 保存和管理生成的文案
- 🔍 **合规性检测**: 确保文案符合平台规范
- 🏋️ **个性化训练**: 训练专属的文案风格
- 📱 **移动端优化**: 完全响应式设计

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS v4
- **UI组件**: Shadcn/ui + Radix UI
- **后端**: Supabase (数据库 + 认证 + 存储)
- **服务器**: Supabase Edge Functions + Hono
- **AI服务**: 智谱AI GLM-4
- **部署**: Vercel

## 环境变量配置

### Vercel部署环境变量

在Vercel项目设置中添加以下环境变量：

**客户端环境变量** (前端可访问)：
- `VITE_SUPABASE_URL`: https://your-project-id.supabase.co
- `VITE_SUPABASE_ANON_KEY`: your-supabase-anon-key

**服务器环境变量** (仅服务端可访问)：
- `SUPABASE_URL`: https://your-project-id.supabase.co
- `SUPABASE_ANON_KEY`: your-supabase-anon-key
- `SUPABASE_SERVICE_ROLE_KEY`: your-supabase-service-role-key
- `ZHIPU_API_KEY`: your-zhipu-api-key

### 本地开发

复制 `.env.example` 文件为 `.env.local` 并填入您的配置：

```bash
cp .env.example .env.local
```

### 获取配置密钥

**Supabase配置**:
1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 在项目设置的 "API" 页面找到所需的URL和Keys

**智谱AI API Key**:
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并登录
3. 在控制台创建API Key

## 快速开始

```bash
# 安装依赖
npm install

# 开发运行
npm run dev

# 构建部署
npm run build
```

## 主要功能模块

1. **产品信息输入**: 支持文字描述和文件/链接导入
2. **类型选择**: 选择内容类型和目标人群
3. **风格选择**: 选择文案风格
4. **文案生成**: AI生成多版本文案
5. **结果展示**: 查看和编辑生成的文案
6. **反馈收集**: 用户满意度反馈
7. **合规检测**: 文案合规性验证
8. **文案库**: 保存和管理文案
9. **风格训练**: 个性化风格学习

## 部署说明

项目已配置好Vercel部署，只需：
1. 推送代码到GitHub
2. 在Vercel中导入仓库
3. 设置上述环境变量
4. 部署即可

## 许可证

MIT License