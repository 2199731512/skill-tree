import { STATE_LABELS } from './constants';
import type { SkillNodeData, SkillEdgeData, TreeStats } from './types';

// ── Tree maps ─────────────────────────────────────────────

export interface TreeMaps {
  ch: Record<string, string[]>;  // children: parentId -> childIds
  pa: Record<string, string[]>;  // parents: childId -> parentIds
}

export function buildMaps(edges: SkillEdgeData[]): TreeMaps {
  const ch: Record<string, string[]> = {};
  const pa: Record<string, string[]> = {};
  edges.forEach(e => {
    (ch[e.f] = ch[e.f] || []).push(e.t);
    (pa[e.t] = pa[e.t] || []).push(e.f);
  });
  return { ch, pa };
}

// ── Ancestor path (for breadcrumbs) ──────────────────────

export function ancestorPath(id: string, pa: Record<string, string[]>, nodes: SkillNodeData[]): string[] {
  const p: string[] = [];
  let c: string | null = id;
  while (c) {
    const n = nodes.find(x => x.id === c);
    if (n) p.unshift(n.title);
    const ps = pa[c];
    c = ps?.length ? ps[0] : null;
  }
  return p;
}

// ── Recursive search match ───────────────────────────────

export function hasMatch(id: string, ch: Record<string, string[]>, nodes: SkillNodeData[], q: string): boolean {
  const n = nodes.find(x => x.id === id);
  if (!n) return false;
  if (n.title.toLowerCase().includes(q) || n.sub.toLowerCase().includes(q)) return true;
  return (ch[id] || []).some(c => hasMatch(c, ch, nodes, q));
}

// ── Date formatter ───────────────────────────────────────

export function fmtDate(ts: number | null | undefined): string {
  if (!ts) return '—';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ── Stats calculator ─────────────────────────────────────

export function calcStats(nodes: SkillNodeData[]): TreeStats {
  const regular = nodes.filter(n => !n.pending && !n.isNew);
  const pending = nodes.filter(n => n.pending);
  return {
    total: regular.length,
    rated: regular.filter(n => n.rating > 0).length,
    unrated: regular.filter(n => n.rating === 0).length,
    top: regular.filter(n => n.rating === 5).length,
    pend: pending.length,
    dist: [0, 1, 2, 3, 4, 5].map(r => regular.filter(n => n.rating === r).length),
  };
}

// ── Summary generator ────────────────────────────────────

export function genSummary(nodes: SkillNodeData[], stats: TreeStats): string {
  const now = fmtDate(Date.now());
  let t = `技能树总结\n生成时间：${now}\n${'='.repeat(42)}\n\n总览\n${'-'.repeat(22)}\n总节点：${stats.total}\n已评级：${stats.rated} 个\n5星节点：${stats.top} 个\n未评级：${stats.unrated} 个\n`;
  if (stats.pend > 0) t += `草稿：${stats.pend} 个\n`;
  t += '\n';

  const rated = nodes.filter(n => !n.pending && !n.isNew && n.rating > 0).sort((a, b) => b.rating - a.rating);
  const unrated = nodes.filter(n => !n.pending && !n.isNew && n.rating === 0);

  if (rated.length) {
    t += `已评级节点\n${'-'.repeat(22)}\n`;
    for (const n of rated) {
      t += `${'★'.repeat(n.rating)}${'☆'.repeat(5 - n.rating)} ${n.title}【${n.sub}】\n  创建：${fmtDate(n.createdAt)}\n`;
      if (n.stateColor) t += `  状态：${STATE_LABELS[n.stateColor]}\n`;
      if (n.files.length) t += `  附件：${n.files.map(f => f.n).join('，')}\n`;
      if (n.notes.trim()) t += `  笔记：${n.notes.trim()}\n`;
      t += '\n';
    }
  }

  if (unrated.length) {
    t += `未评级节点\n${'-'.repeat(22)}\n`;
    unrated.forEach(n => {
      t += `□ ${n.title}【${n.sub}】\n`;
    });
  }

  return t;
}
