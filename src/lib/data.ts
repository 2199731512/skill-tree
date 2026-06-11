import type { SkillNodeData, SkillEdgeData } from './types';

const T = Date.now();
const D = 86400000;

export const NODES0: SkillNodeData[] = [
  { id: 'root',  title: 'AI工程师转型',     sub: '核心目标',     rating: 5, stateColor: null,     pending: false, isNew: false, x: 310, y: 20,  createdAt: T - 14 * D, files: [{ n: '转型路线图.pdf', t: 'pdf' }, { n: '三个月计划.md', t: 'md' }], notes: '以变现为核心驱动，所有技能选择服务于3个月收入目标。' },
  { id: 'react', title: 'React / Next.js',  sub: '前端框架',     rating: 4, stateColor: null,     pending: false, isNew: false, x: 40,  y: 158, createdAt: T - 12 * D, files: [{ n: 'React项目笔记.md', t: 'md' }],                           notes: '已完成AI聊天组件、混凝土计算器等项目。' },
  { id: 'ts',    title: 'TypeScript',       sub: '类型系统',     rating: 3, stateColor: 'green',  pending: false, isNew: false, x: 218, y: 158, createdAt: T - 11 * D, files: [],                                                          notes: '重点掌握接口、泛型和类型推断。' },
  { id: 'sb',    title: 'Supabase',         sub: '后端即服务',   rating: 4, stateColor: null,     pending: false, isNew: false, x: 396, y: 158, createdAt: T - 10 * D, files: [{ n: 'Supabase配置.txt', t: 'txt' }],                           notes: 'region: eu-west-1，基础认证和数据库配置完成。' },
  { id: 'n8n',   title: 'n8n 自动化',       sub: '工作流引擎',   rating: 5, stateColor: 'orange', pending: false, isNew: false, x: 574, y: 158, createdAt: T - 9 * D,  files: [{ n: '工作流.json', t: 'json' }, { n: 'SMTP配置.md', t: 'md' }], notes: '核心工作流完成。MiMo模型名必须全小写 mimo-v2.5-pro。' },
  { id: 'api',   title: 'AI API集成',       sub: 'MiMo/Claude',  rating: 4, stateColor: null,     pending: false, isNew: false, x: 40,  y: 300, createdAt: T - 8 * D,  files: [{ n: '接入文档.md', t: 'md' }],                              notes: 'OpenAI兼容格式，SSE流式输出已实现。' },
  { id: 'sse',   title: 'SSE 流式输出',     sub: '实时响应',     rating: 4, stateColor: null,     pending: false, isNew: false, x: 218, y: 300, createdAt: T - 7 * D,  files: [],                                                         notes: '解决MiMo响应慢问题，实现打字机效果。' },
  { id: 'wf',    title: '工作流产品化',     sub: '自动化→服务',  rating: 5, stateColor: null,     pending: false, isNew: false, x: 396, y: 300, createdAt: T - 6 * D,  files: [{ n: '闲鱼定价策略.md', t: 'md' }],                           notes: '简历优化服务MVP：AI草稿+人工审核混合模式。' },
  { id: 'cons',  title: '建筑行业AI工具',   sub: '核心变现赛道', rating: 5, stateColor: null,     pending: false, isNew: false, x: 574, y: 300, createdAt: T - 5 * D,  files: [{ n: '施工日报需求分析.md', t: 'md' }],                       notes: '利用土木背景切入施工日报、合规文档场景。' },
  { id: 'inc',   title: '首单变现',          sub: '3个月里程碑',  rating: 0, stateColor: null,     pending: false, isNew: false, x: 396, y: 426, createdAt: T - 3 * D,  files: [],                                                         notes: '目标：通过闲鱼或熟人网络完成第一笔收入。' },
];

export const EDGES0: SkillEdgeData[] = [
  { f: 'root', t: 'react' }, { f: 'root', t: 'ts' }, { f: 'root', t: 'sb' }, { f: 'root', t: 'n8n' },
  { f: 'react', t: 'api' }, { f: 'ts', t: 'api' }, { f: 'ts', t: 'sse' }, { f: 'sb', t: 'sse' },
  { f: 'sb', t: 'wf' }, { f: 'n8n', t: 'wf' }, { f: 'n8n', t: 'cons' }, { f: 'wf', t: 'inc' }, { f: 'cons', t: 'inc' },
];
