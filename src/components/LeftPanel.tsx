'use client';

import { useState } from 'react';
import { ORANGE, GREEN } from '@/lib/constants';
import { genSummary, calcStats } from '@/lib/utils';
import TreeItem from './TreeItem';
import type { SkillNodeData } from '@/lib/types';
import type { ThemeColors } from '@/lib/constants';

interface LeftPanelProps {
  nodes: SkillNodeData[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNodeData[]>>;
  edges: { f: string; t: string }[];
  ch: Record<string, string[]>;
  rootIds: string[];
  sel: string | null;
  onSelect: (id: string) => void;
  dark: boolean;
  setDark: React.Dispatch<React.SetStateAction<boolean>>;
  C: ThemeColors;
}

export default function LeftPanel({
  nodes, setNodes, edges, ch, rootIds, sel, onSelect, dark, setDark, C,
}: LeftPanelProps) {
  const [q, setQ] = useState('');
  const [exp, setExp] = useState<Set<string>>(new Set(['root']));
  const [tEId, setTEId] = useState<string | null>(null);

  const lq = q.toLowerCase();
  const stats = calcStats(nodes);
  const pending = nodes.filter(n => n.pending);

  const onToggle = (id: string) => {
    setExp(p => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const confirmAll = () => setNodes(p => p.map(n => ({ ...n, pending: false })));

  const download = () => {
    const txt = genSummary(nodes, stats);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `技能树总结-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      width: 222, background: C.panel, borderRight: `1px solid ${C.bdr}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* ── Overview ── */}
      <div style={{ padding: '12px', borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: C.dim, letterSpacing: 1 }}>技能总览</span>
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={download} style={{
              padding: '3px 8px', background: 'transparent', border: `1px solid ${GREEN}`,
              borderRadius: 5, color: GREEN, fontSize: 10, cursor: 'pointer',
            }}>📋 总结</button>
            <button onClick={() => setDark(d => !d)} style={{
              padding: '3px 8px', background: 'transparent', border: `1px solid ${C.bdr}`,
              borderRadius: 5, color: C.dim, fontSize: 12, cursor: 'pointer',
            }}>{dark ? '☀️' : '🌙'}</button>
          </div>
        </div>
        {[5, 4, 3, 2, 1].map(r => (
          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
            <span style={{ fontSize: 9, color: r === 5 ? ORANGE : C.dim, width: 48, flexShrink: 0, letterSpacing: -1 }}>
              {'★'.repeat(r)}{'☆'.repeat(5 - r)}
            </span>
            <div style={{ flex: 1, height: 4, background: C.bdr, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: r === 5 ? ORANGE : GREEN, borderRadius: 2,
                width: `${stats.total ? stats.dist[r] / stats.total * 100 : 0}%`, transition: 'width 0.4s',
              }} />
            </div>
            <span style={{ fontSize: 9, color: C.dim, width: 14, textAlign: 'right' }}>{stats.dist[r]}</span>
          </div>
        ))}
        <div style={{ marginTop: 6, fontSize: 9, color: C.muted }}>
          已评级 {stats.rated}/{stats.total} 节点{stats.unrated > 0 ? ` · ${stats.unrated} 未评级` : ''}
        </div>
        {stats.pend > 0 && (
          <div style={{
            marginTop: 8, fontSize: 10, color: ORANGE, background: 'rgba(245,158,11,0.08)',
            padding: '4px 8px', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <span>◦ {stats.pend} 个草稿</span>
            <span onClick={confirmAll} style={{ cursor: 'pointer', textDecoration: 'underline', fontSize: 9 }}>合并全部</span>
          </div>
        )}
      </div>

      {/* ── Search ── */}
      <div style={{ padding: '8px 10px', borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ position: 'relative' }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="搜索节点..."
            style={{
              width: '100%', boxSizing: 'border-box', background: C.sub, border: `1px solid ${C.bdr}`,
              borderRadius: 6, padding: '6px 26px 6px 28px', color: C.text, fontSize: 11, outline: 'none',
            }}
          />
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: C.dim, fontSize: 11 }}>🔍</span>
          {q && (
            <span onClick={() => setQ('')} style={{
              position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)',
              color: C.dim, fontSize: 14, cursor: 'pointer', lineHeight: 1,
            }}>×</span>
          )}
        </div>
      </div>

      {/* ── Tree nav ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 4px' }}>
        {rootIds.map(id => (
          <TreeItem
            key={id}
            id={id}
            ch={ch}
            nodes={nodes}
            setNodes={setNodes}
            depth={0}
            sel={sel}
            onSelect={onSelect}
            exp={exp}
            onToggle={onToggle}
            lq={lq}
            tEId={tEId}
            setTEId={setTEId}
            C={C}
          />
        ))}
        {pending.length > 0 && (
          <div style={{ marginTop: 8, padding: '0 8px' }}>
            <div style={{ fontSize: 9, color: ORANGE, marginBottom: 4 }}>◦ 草稿</div>
            {pending.map(n => (
              <div
                key={n.id}
                onClick={() => onSelect(n.id)}
                style={{
                  fontSize: 11, color: ORANGE, padding: '3px 6px', cursor: 'pointer',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  borderLeft: '2px solid rgba(245,158,11,0.4)', marginBottom: 2,
                }}
              >{n.title}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
