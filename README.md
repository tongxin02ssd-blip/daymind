# DayMind V1.2

DayMind 是一个本地完整可运行的极简每日状态复盘工具。它不是 Todo 软件，也不是 AI 聊天工具，而是把今日计划、今日记录、近期目标和最近历史收束成一份短而准确的今日状态报告。

## 产品定位

- 用最短、最准的话判断今天处于什么状态。
- 保留计划是为了帮助 AI 理解当天目标，不做复杂任务管理。
- 今日记录保持自由输入，可以为空。
- 状态报告由用户主动生成，历史通过日期选择查看。

## 核心功能

- 真实注册、登录、退出登录，刷新后保持登录状态。
- JWT 鉴权，密码使用 bcrypt 哈希保存。
- 近期目标自由编辑，支持展开 / 折叠并保存状态。
- 快捷日期栏围绕当前查看日期展示相邻日期，并标记有记录或已有洞察的日期。
- 支持展开月历跳转到任意日期；月历内可直观看到每日内容和洞察状态。
- 今天可编辑计划、完成状态和记录；未来日期可提前写计划；过去日期用于查看。
- 每条计划支持可选的自由备注，用于补充实际进度、遇到的情况或未完成原因。
- 今日记录自动保存。
- 后端真实调用 DeepSeek V4 Flash 生成结构化 JSON 状态报告。
- 生成洞察时会同时参考计划备注，不只依据完成状态判断。
- 当天报告重复生成时覆盖旧报告。
- 过去日期可查看当日计划、记录、报告和生成报告时的目标快照。

## 技术栈

前端：

- React + TypeScript + Vite
- React Router
- Axios
- 普通 CSS
- 自定义基础组件

后端：

- Node.js + Express + TypeScript
- Prisma + SQLite
- JWT + bcrypt
- DeepSeek V4 Flash

## 项目结构

```text
daymind/
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/controllers/
│   ├── src/middlewares/
│   ├── src/routes/
│   ├── src/services/
│   ├── src/utils/
│   ├── src/app.ts
│   └── src/server.ts
├── frontend/
│   ├── src/api/
│   ├── src/components/
│   ├── src/hooks/
│   ├── src/pages/
│   ├── src/routes/
│   ├── src/types/
│   ├── src/utils/
│   ├── src/App.tsx
│   └── src/main.tsx
└── README.md
```

## 环境变量

后端复制示例文件：

```bash
cd daymind/backend
cp .env.example .env
```

`backend/.env`：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-your-secret"
AI_PROVIDER="deepseek"
AI_MODEL="deepseek-v4-flash"
AI_API_KEY="your_deepseek_api_key"
AI_BASE_URL="https://api.deepseek.com"
PORT=3001
```

前端复制示例文件：

```bash
cd daymind/frontend
cp .env.example .env
```

`frontend/.env`：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 本地运行

建议使用 Node.js 20 或 22 LTS。当前项目已在 Node v25.9.0 下完成前后端构建验证，但 Prisma migrate 在该非 LTS 版本上可能出现无详细信息的 schema engine 错误。

后端：

```bash
cd daymind/backend
npm install
npx prisma migrate dev --name init
npm run dev
```

如果你的环境执行 `prisma migrate dev` 时出现空的 `Schema engine error`，可以先用下面的命令直接执行已生成的迁移 SQL 初始化本地 SQLite：

```bash
npx prisma db execute --url file:./prisma/dev.db --file prisma/migrations/20260708000000_init/migration.sql
npx prisma generate
```

前端：

```bash
cd daymind/frontend
npm install
npm run dev
```

默认地址：

- 后端：`http://localhost:3001`
- 前端：`http://localhost:5173`

## DeepSeek 配置说明

后端通过 `AI_API_KEY` 调用 DeepSeek，不会在前端暴露 Key。若未配置 `AI_API_KEY`，生成报告接口会返回清晰错误：`AI_API_KEY is missing`。

AI 调用使用 OpenAI 兼容的 `/chat/completions` 接口，请求模型默认是 `deepseek-v4-flash`。返回内容必须是 JSON，后端会解析并校验以下字段：

```json
{
  "stateType": "逃避型低效",
  "conclusion": "你今天不是没有时间，而是在关键任务前选择了更容易逃避的事情。",
  "surfaceReason": "上午的高精力时段没有进入核心任务，注意力被低成本娱乐占用。",
  "deepReason": "真正卡住你的不是时间，而是任务启动压力过高。",
  "suggestion": "明天第一个任务不要写“复习 Promise”，而是写“做 1 道 Promise 输出题并写出执行顺序”。"
}
```

## 主要接口

Auth：

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Context：

- `GET /api/context`
- `PUT /api/context`

Daily：

- `GET /api/daily/:date`
- `PUT /api/daily/:date/record`

Plans：

- `POST /api/daily/:date/plans`
- `PUT /api/plans/:planId`
- `DELETE /api/plans/:planId`

AI Report：

- `POST /api/daily/:date/report/generate`

History：

- `GET /api/history?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /api/history/summary?start=YYYY-MM-DD&end=YYYY-MM-DD`

## 完整流程测试

1. 启动后端和前端。
2. 打开 `http://localhost:5173/register` 注册账号。
3. 进入 `/app` 后编辑近期目标并保存。
4. 在今天添加几条计划，切换完成状态并填写一条进展备注。
5. 写今日记录，等待自动保存。
6. 点击生成今日状态报告。
7. 通过快捷日期栏或月历标记切换历史日期，查看计划、备注、记录、报告和目标快照。
8. 切换未来日期，提前添加未来计划。
9. 退出登录后重新登录，确认数据仍在 SQLite 中。

## 开发说明

- 所有业务接口都经过 JWT 鉴权。
- 用户只能访问自己的每日数据、计划、近期目标和报告。
- `DailyEntry` 使用 `userId + date` 联合唯一约束。
- `DailyReport` 与 `DailyEntry` 一对一，重复生成时使用 upsert 覆盖。
- 前端不使用 Ant Design、不使用 Redux、不做复杂统计和打卡。

## 当前限制

- V1.2 只做本地运行，不包含线上部署配置。
- 前端不提供独立历史侧栏，历史数据通过快捷日期栏和月历查看。
- DeepSeek 返回质量依赖 API 可用性和模型响应稳定性。
