'use client';

import { useRef } from 'react';
import { ORANGE, GREEN } from '@/lib/constants';
import type { SkillNodeData } from '@/lib/types';
import type { ThemeColors } from '@/lib/constants';

interface BottomBarProps {
  nodes: SkillNodeData[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNodeData[]>>;
  dark: boolean;
  C: ThemeColors;
  fStars: number | null;
  setFStars: (v: number | null) => void;
  fAtLeast: boolean;
  setFAtLeast: (v: boolean) => void;
  fUnrated: boolean;
  setFUnrated: (v: boolean) => void;
  q: string;
  setQ: (v: string) => void;
}

export default function BottomBar({
  nodes, setNodes, dark, C, fStars, setFStars, fAtLeast, setFAtLeast, fUnrated, setFUnrated, q, setQ,
}: BottomBarProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cmdRef = useRef<HTMLInputElement>(null);

  const pending = nodes.filter(n => n.pending);
  const filterActive = fStars || fUnrated;

  const addDraft = () => {
    const cmd = cmdRef.current?.value || '';
    if (!cmd.trim()) return;
    const my = nodes.length ? Math.max(...nodes.map(n => n.y)) : 400;
    setNodes(p => [...p, {
      id: `d-${Date.now()}`, title: cmd.trim(), sub: '', rating: 0, stateColor: null,
      pending: true, isNew: false, x: 80 + Math.random() * 300, y: my + 110,
      files: [], notes: '', createdAt: Date.now(),
    }]);
    if (cmdRef.current) cmdRef.current.value = '';
  };

  const addFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const name = f.name.replace(/\.[^/.]+$/, '');
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    const my = nodes.length ? Math.max(...nodes.map(n => n.y)) : 400;
    setNodes(p => [...p, {
      id: `d-${Date.now()}`, title: name, sub: '从文件导入', rating: 0, stateColor: null,
      pending: true, isNew: false, x: 80 + Math.random() * 300, y: my + 110,
      files: [{ n: f.name, t: ext }], notes: '', createdAt: Date.now(),
    }]);
    e.target.value = '';
  };

  const confirmAll = () => setNodes(p => p.map(n => ({ ...n, pending: false })));

  return (
    <div style={{ background: C.panel, borderTop: `1px solid ${C.bdr}`, padding: '8px 20px', flexShrink: 0 }}>
      {/* ── Filter bar ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: C.dim, flexShrink: 0, marginRight: 2 }}>筛选</span>
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onClick={() => { if (fStars === i) setFStars(null); else { setFStars(i); setFUnrated(false); } }}
            style={{
              padding: '3px 9px', borderRadius: 8, fontSize: 10, cursor: 'pointer',
              border: `1px solid ${fStars === i ? ORANGE : C.bdr}`,
              background: fStars === i ? 'rgba(245,158,11,0.1)' : 'transparent',
              color: fStars === i ? ORANGE : C.dim, transition: 'all 0.1s',
            }}
          >★{i}星</button>
        ))}
        {fStars && (
          <button onClick={() => setFAtLeast(!fAtLeast)} style={{
            padding: '3px 9px', borderRadius: 8, fontSize: 10, cursor: 'pointer',
            border: `1px solid ${fAtLeast ? GREEN : C.bdr}`,
            background: fAtLeast ? 'rgba(16,185,129,0.1)' : 'transparent',
            color: fAtLeast ? GREEN : C.dim, transition: 'all 0.1s',
          }}>以上</button>
        )}
        <button onClick={() => { setFUnrated(!fUnrated); setFStars(null); }} style={{
          padding: '3px 9px', borderRadius: 8, fontSize: 10, cursor: 'pointer',
          border: `1px solid ${fUnrated ? ORANGE : C.bdr}`,
          background: fUnrated ? 'rgba(245,158,11,0.1)' : 'transparent',
          color: fUnrated ? ORANGE : C.dim, transition: 'all 0.1s',
        }}>未评级</button>
        {(filterActive || q) && (
          <button onClick={() => { setFStars(null); setFUnrated(false); setFAtLeast(true); setQ(''); }} style={{
            padding: '3px 8px', borderRadius: 8, fontSize: 10, cursor: 'pointer',
            border: `1px solid ${C.bdr}`, background: 'transparent', color: C.muted,
          }}>清除</button>
        )}
        {fStars && (
          <span style={{ fontSize: 9, color: C.muted, marginLeft: 2 }}>{fAtLeast ? `≥${fStars}★` : `仅${fStars}★`}</span>
        )}
      </div>

      {/* ── Command bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: C.sub, border: `1px solid ${C.bdr}`, borderRadius: 14,
        padding: '8px 10px 8px 16px',
        boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.25)' : '0 -1px 8px rgba(0,0,0,0.05)',
      }}>
        <input
          ref={cmdRef}
          onKeyDown={e => { if (e.key === 'Enter') addDraft(); }}
          placeholder="输入技能名称，添加草稿节点..."
          style={{
            flex: 1, background: 'transparent', border: 'none', color: C.text,
            fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => fileRef.current?.click()}
          title="上传文件"
          style={{
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: `1px solid ${C.bdr}`, borderRadius: 8,
            color: C.dim, fontSize: 15, cursor: 'pointer', flexShrink: 0,
          }}
        >📎</button>
        <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={addFile} />
        <button
          onClick={addDraft}
          style={{
            padding: '6px 18px',
            background: ORANGE,
            border: `1px solid ${ORANGE}`,
            borderRadius: 10, color: '#1a0a00',
            fontSize: 12, cursor: 'pointer',
            fontWeight: 600, flexShrink: 0, transition: 'all 0.15s',
          }}
        >添加草稿</button>
        {pending.length > 0 && (
          <button onClick={confirmAll} style={{
            padding: '6px 16px', background: 'rgba(16,185,129,0.12)',
            border: `1px solid ${GREEN}`, borderRadius: 10, color: GREEN,
            fontSize: 12, cursor: 'pointer', flexShrink: 0, fontWeight: 500,
          }}>✓ 合并 ({pending.length})</button>
        )}
      </div>
    </div>
  );
}
