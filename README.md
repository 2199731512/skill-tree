# SkillTree

个人技能树管理工具。以节点图的形式组织知识体系，每个节点可挂载文件和笔记，支持重点标记和树形导航。

---

## 功能

**节点图画布**
- 拖动节点自由布局
- 节点间依赖关系以贝塞尔曲线连接，已完成的连线高亮显示
- 搜索时非匹配节点淡出，聚焦目标

**重点标记（★）**
- 每个节点右上角可切换星标
- 星标节点金色高亮，边线与标题变色，带光晕效果
- 星标节点在画布中视觉层级最高，一眼找到重点

**左侧树形导航**
- 文件管理器风格的层级树，▶/▼ 展开收起
- 顶部搜索框实时过滤，匹配节点及其祖先保持可见
- 点击树节点自动定位并在画布中心闪烁提示
- 底部显示重点数量和节点总数

**右侧详情面板**
- 面包屑路径显示当前节点位置（如 `AI工程师转型 › n8n 自动化`）
- 子节点列表：📂 有下级 / 📄 叶子节点，可点击直接跳入
- 节点笔记展示
- 附件列表（PDF / Markdown / JSON / TXT 等），支持添加

**节点状态**
- 以节点左侧色条区分：绿色（已完成）/ 黄色（进行中）/ 蓝色（可学习）/ 灰色（未解锁）

---

## 当前技术栈

| 层级 | 技术 |
|------|------|
| UI 框架 | React 18 + Hooks |
| 图形渲染 | SVG（贝塞尔曲线） |
| 拖拽 | 原生 MouseEvent + window listener |
| 状态管理 | useState / useCallback / useRef |
| 样式 | 纯 inline styles，无外部 CSS 依赖 |
| 构建 | Vite（或直接嵌入 Next.js） |

---

## 快速开始

```bash
git clone <your-repo>
cd skill-tree
npm install
npm run dev
```

在 `skill-tree-demo.jsx` 顶部修改 `INIT` 数组即可替换为你自己的节点数据：

```js
const INIT = [
  {
    id: "root",           // 唯一 ID
    title: "我的技能树",   // 节点标题
    sub: "核心目标",       // 副标题
    status: "completed",  // completed | in-progress | unlocked | locked
    starred: true,        // 是否重点标记
    x: 310, y: 20,        // 初始坐标
    files: [              // 附件列表（目前为展示数据）
      { n: "文件名.pdf", t: "pdf" }
    ],
    notes: "节点备注内容"
  },
  // ...更多节点
];

// 定义依赖关系（from → to）
const EDGES = [
  { f: "root", t: "child-node-id" },
];
```

---

## 路线图

### 阶段一：本地可用（当前）

- [x] 节点图可视化
- [x] 拖拽布局
- [x] 树形导航 + 搜索
- [x] 重点标记（★）
- [x] 子节点文件管理器视图
- [x] 节点笔记与附件展示

### 阶段二：数据持久化

- [ ] 接入 Supabase，节点数据存入数据库
- [ ] 节点位置自动保存
- [ ] 星标和状态变更实时同步
- [ ] 多设备访问

### 阶段三：真实文件挂载

- [ ] 接入 Supabase Storage
- [ ] 节点内上传 / 预览 / 下载文件
- [ ] 文件类型图标自动识别
- [ ] 支持图片、PDF 预览

### 阶段四：协作与变现

- [ ] 多用户支持（技能树模板分享）
- [ ] 导出为 PNG / PDF
- [ ] 嵌入 Next.js 应用，部署至 Vercel
- [ ] 可公开的技能展示页（类简历）

---

## 数据结构说明

### 节点（Node）

```ts
type Node = {
  id: string;
  title: string;
  sub: string;
  status: "completed" | "in-progress" | "unlocked" | "locked";
  starred: boolean;
  x: number;
  y: number;
  files: { n: string; t: string }[];
  notes: string;
}
```

### 边（Edge）

```ts
type Edge = {
  f: string;  // from（父节点 ID）
  t: string;  // to（子节点 ID）
}
```

### Supabase 建表参考（阶段二）

```sql
create table nodes (
  id text primary key,
  title text not null,
  sub text,
  status text default 'locked',
  starred boolean default false,
  x integer default 0,
  y integer default 0,
  notes text,
  created_at timestamptz default now()
);

create table edges (
  id serial primary key,
  from_id text references nodes(id),
  to_id text references nodes(id)
);

create table node_files (
  id serial primary key,
  node_id text references nodes(id),
  name text not null,
  type text,
  storage_path text,
  created_at timestamptz default now()
);
```

---

## 目录结构（计划）

```
skill-tree/
├── src/
│   ├── components/
│   │   ├── Canvas.tsx       # 画布 + 拖拽
│   │   ├── TreeNav.tsx      # 左侧树形导航
│   │   ├── NodeCard.tsx     # 单个节点卡片
│   │   ├── DetailPanel.tsx  # 右侧详情面板
│   │   └── TreeItem.tsx     # 树节点组件
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── tree.ts          # 树结构计算工具函数
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── README.md
└── package.json
```

---

## License

MIT

