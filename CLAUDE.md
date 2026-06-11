# SkillTree — 项目交接文档（CLAUDE.md）

> 本文档是从 Claude 网页对话迁移到 Claude Code 的完整交接稿。
> 所有设计决策已经过多轮用户反馈迭代收敛，**严禁擅自改变**。

## 项目定位

个人技能树管理工具：节点图组织知识体系，每个节点可挂载文件和笔记，1-5星掌握评级。
先自用，再产品化变现（目标：3个月内首笔收入）。

## 当前资产

- `skill-tree-demo.jsx` — 完整可运行的单文件 React demo（约700行），包含全部交互逻辑
- `README.md` — 功能说明 + Supabase 建表 SQL + 目录结构规划

## 已锁定的设计决策（不要改变）

1. **颜色系统**：全局只用两种主色——橙色 `#f59e0b`、绿色 `#10b981`。删除红 `#ef4444` 仅用于删除按钮。禁止引入其他色系
2. **评级系统**：1-5星掌握度（rating: 0-5，0=未评级）。点击当前星数可清零。星级标签：未评级/了解/基础/熟悉/熟练/精通
3. **5星特权**：只有 rating===5 的节点自动获得橙色边框+左侧3px橙色加粗边+淡橙光晕。其他节点（0-4星）统一默认边框
4. **状态系统（独立于评级）**：stateColor 字段，可选 null / 'green'（学习中）/ 'orange'（已掌握）。仅显示为节点卡片上两个可点击小方块，**不影响边框颜色**
5. **节点交互**：
   - 单击选中（打开右侧详情面板）
   - 双击标题进入内联改名
   - 悬停出现：右侧橙色+按钮（创建同级节点）、下方绿色+按钮（创建子节点）、右上角红色×（删除）
   - 加号按钮是 Miro 连接器风格：短线+圆形按钮，hover 放大
6. **拖拽**：5px 移动阈值才判定为拖拽，否则视为点击
7. **删除**：三种方式——悬停×按钮、详情面板删除按钮、选中后按 Delete 键
8. **主题**：夜间/白天双模式切换，文字颜色跟随主题（夜间白字/白天黑字），不随评分变色
9. **草稿机制**：底部命令栏（Claude 风格圆角容器）输入文字或上传文件创建草稿节点（橙色虚线边框），需确认后合并入树；支持单个确认/批量合并
10. **左侧面板**：技能总览（仅1-5星分布横条+已评级统计，无大数字卡片）+ 搜索框 + 树形导航（文件管理器风格，不显示星数，双击改名与画布实时同步）
11. **右侧详情面板**：面包屑路径、标题/副标题可编辑、创建时间、大号星级+状态方块、子节点列表（📂/📄图标+时间）、笔记 textarea、附件列表
12. **筛选栏**：命令栏上方。格式 `★1星 ★2星 ... ★5星`，选中后出现"以上"切换按钮（≥N星 / 仅N星），另有"未评级"独立选项
13. **总结功能**：左侧总览的 📋按钮，生成全树内容 txt 下载（含评级分组、笔记、附件清单）

## 已修复的关键 Bug（重构时严禁复发）

### Bug 1: `return<path` 缺空格
`return<path .../>` 会被 Babel 旧版 transform 解析成 `returnReact.createElement(...)`，
报错 `returnReact is not defined`。**所有 return JSX 必须写成 `return <`（有空格）。**

### Bug 2: border shorthand 与 borderLeft 混用
React 对 inline style 做增量 diff。同一对象里 `border`（shorthand）+ `borderLeft` 并存时，
`border` 值变化会重置左边框，而 `borderLeft` 未变化不会重新应用 → 5星橙色加粗边在取消选中后消失。
**必须用 borderTop / borderRight / borderBottom / borderLeft 四个独立属性，禁用 border shorthand。**

### Bug 3: 全局 mouseup 清空状态导致点击失效
全局 `window mouseup` 里清空 `ds.current` 后，节点的 `onClick` 拿到 null 直接 return → 所有节点无法点击。
**点击判定必须在节点自身的 onMouseUp 内完成**（检查 `!didDrag.current && ds.current?.id===id`），
全局 mouseup 只负责结束拖拽，不清 ds。

## 技术路线（P0 阶段执行）

- Next.js 14 App Router + TypeScript
- **@xyflow/react (ReactFlow)** 替代手写画布 → 原生获得缩放/平移/minimap/多选/框选
  - 现有节点渲染逻辑（星级、状态方块、+按钮、×删除）迁移为 ReactFlow custom node
  - 现有贝塞尔连线由 ReactFlow 默认 edge 替代
- Supabase：Postgres（数据）+ Storage（附件）+ Auth（后续多用户）
- Vercel 部署（国内访问需注意，自用挂代理即可，售卖时再考虑国内方案）

## Supabase Schema

```sql
create table trees (
  id uuid primary key default gen_random_uuid(),
  name text not null default '我的技能树',
  created_at timestamptz default now()
);

create table nodes (
  id text primary key,
  tree_id uuid references trees(id) on delete cascade,
  title text not null,
  sub text default '',
  rating int default 0 check (rating between 0 and 5),
  state_color text check (state_color in ('green','orange')),
  pending boolean default false,
  x integer default 0,
  y integer default 0,
  notes text default '',
  created_at timestamptz default now()
);

create table edges (
  id serial primary key,
  tree_id uuid references trees(id) on delete cascade,
  from_id text references nodes(id) on delete cascade,
  to_id text references nodes(id) on delete cascade
);

create table node_files (
  id serial primary key,
  node_id text references nodes(id) on delete cascade,
  name text not null,
  type text,
  storage_path text,
  created_at timestamptz default now()
);
```

## 路线图

### P0 — 从演示变成自用工具（本周）
- [ ] Next.js 项目初始化 + ReactFlow 迁移（保持所有锁定设计）
- [ ] Supabase 持久化（增删改查节点/边，节点位置防抖保存）
- [ ] Supabase Storage 真实文件上传 + 下载
- [ ] 撤销/重做（nodes+edges 快照栈，Ctrl+Z / Ctrl+Shift+Z）

### P1 — 从自用变成可卖（2-4周）
- [ ] 多树支持 + 树列表首页
- [ ] PNG 导出（html-to-image）+ JSON 导入导出
- [ ] 3-5 个预置模板（程序员转型树/考研树/自媒体树）
- [ ] 笔记 Markdown 渲染

### P2 — 差异化卖点
- [ ] AI 生成技能树：输入目标 → 调 MiMo API（mimo-v2.5-pro，模型名必须全小写，
      base URL https://token-plan-cn.xiaomimimo.com/v1，OpenAI 兼容格式）自动生成整树节点+依赖
- [ ] 公开分享页（只读链接）

## Claude Code 首条指令（复制即用）

```
读取本目录的 CLAUDE.md 和 skill-tree-demo.jsx。
初始化 Next.js 14 (App Router + TypeScript) 项目，安装 @xyflow/react 和 @supabase/supabase-js。
将 skill-tree-demo.jsx 迁移为 ReactFlow custom node 架构：
- 节点卡片（标题/副标题/星级/状态方块/附件计数）做成 custom node
- 保持 CLAUDE.md「已锁定的设计决策」全部 13 条不变
- 严格遵守「已修复的关键 Bug」3 条约束
- 左侧面板、右侧详情面板、底部筛选+命令栏保持现有布局
完成后启动 dev server 让我验收，验收通过前不要做 Supabase 接入。
```

## 验收清单（每次改动后自测）

- [ ] 节点可点击选中、可拖拽、双击可改名
- [ ] 5星节点的橙色左边框在选中/取消选中后始终存在
- [ ] 悬停出现 +× 按钮，同级/子节点创建后立即进入命名状态，空名自动删除
- [ ] Delete 键删除选中节点
- [ ] 筛选 ≥N星 / 仅N星 / 未评级 正确淡化节点
- [ ] 夜间/白天切换所有文字清晰可读
- [ ] 草稿节点确认/拒绝/批量合并正常
