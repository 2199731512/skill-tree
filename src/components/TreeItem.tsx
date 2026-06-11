'use client';

import { useState, useEffect } from 'react';
import { ORANGE } from '@/lib/constants';
import { hasMatch } from '@/lib/utils';
import type { SkillNodeData } from '@/lib/types';
import type { ThemeColors } from '@/lib/constants';

interface TreeItemProps {
  id: string;
  ch: Record<string, string[]>;
  nodes: SkillNodeData[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNodeData[]>>;
  depth: number;
  sel: string | null;
  onSelect: (id: string) => void;
  exp: Set<string>;
  onToggle: (id: string) => void;
  lq: string;
  tEId: string | null;
  setTEId: (id: string | null) => void;
  C: ThemeColors;
}

export default function TreeItem({
  id, ch, nodes, setNodes, depth, sel, onSelect, exp, onToggle, lq, tEId, setTEId, C,
}: TreeItemProps) {
  const node = nodes.find(n => n.id === id);
  const [ev, setEv] = useState('');

  useEffect(() => {
    if (tEId === id && node) setEv(node.title);
  }, [tEId, id, node]);

  if (!node || node.pending || node.isNew) return null;
  if (lq && !hasMatch(id, ch, nodes, lq)) return null;

  const kids = ch[id] || [];
  const hasK = kids.length > 0;
  const isOpen = exp.has(id);
  const isSel = sel === id;
  const isEd = tEId === id;

  const confirm = () => {
    if (ev.trim()) setNodes(p => p.map(n => n.id === id ? { ...n, title: ev.trim() } : n));
    setTEId(null);
  };

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: `3px 8px 3px ${8 + depth * 14}px`,
        background: isSel ? 'rgba(245,158,11,0.08)' : 'transparent',
        borderLeft: isSel ? `2px solid ${ORANGE}` : '2px solid transparent',
        borderRadius: '0 4px 4px 0',
        cursor: 'pointer',
      }}>
        <span
          onClick={e => { e.stopPropagation(); if (hasK) onToggle(id); }}
          style={{ width: 14, fontSize: 9, color: C.dim, flexShrink: 0, cursor: hasK ? 'pointer' : 'default' }}
        >
          {hasK ? (isOpen ? '▼' : '▶') : '·'}
        </span>
        {isEd ? (
          <input
            autoFocus
            value={ev}
            onChange={e => setEv(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') setTEId(null); }}
            onBlur={confirm}
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, background: C.sub, border: `1px solid ${ORANGE}`, borderRadius: 4,
              padding: '1px 6px', color: C.text, fontSize: 11, outline: 'none',
            }}
          />
        ) : (
          <span
            onClick={() => onSelect(id)}
            onDoubleClick={e => { e.stopPropagation(); setTEId(id); }}
            title="双击改名"
            style={{
              fontSize: 11, color: C.text, flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {node.title}
          </span>
        )}
        {node.files.length > 0 && (
          <span style={{ fontSize: 9, color: C.muted, flexShrink: 0 }}>·{node.files.length}</span>
        )}
      </div>
      {hasK && isOpen && kids.map(k => (
        <TreeItem
          key={k}
          id={k}
          ch={ch}
          nodes={nodes}
          setNodes={setNodes}
          depth={depth + 1}
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
    </div>
  );
}
