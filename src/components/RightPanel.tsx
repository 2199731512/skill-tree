'use client';

import { ORANGE, GREEN, RED, FI, RATING_LABELS, STATE_LABELS } from '@/lib/constants';
import { ancestorPath, fmtDate } from '@/lib/utils';
import Stars from './Stars';
import StateDots from './StateDots';
import type { SkillNodeData } from '@/lib/types';
import type { ThemeColors } from '@/lib/constants';

interface RightPanelProps {
  selNode: SkillNodeData;
  nodes: SkillNodeData[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNodeData[]>>;
  setSel: (id: string | null) => void;
  pa: Record<string, string[]>;
  ch: Record<string, string[]>;
  scrollTo: (id: string) => void;
  C: ThemeColors;
}

export default function RightPanel({
  selNode, nodes, setNodes, setSel, pa, ch, scrollTo, C,
}: RightPanelProps) {
  const path = ancestorPath(selNode.id, pa, nodes);
  const children = ch[selNode.id] || [];

  const setRating = (id: string, r: number) => setNodes(p => p.map(n => n.id === id ? { ...n, rating: r } : n));
  const setNodeState = (id: string, c: null | 'green' | 'orange') => setNodes(p => p.map(n => n.id === id ? { ...n, stateColor: c } : n));
  const deleteNode = (id: string) => {
    setNodes(p => p.filter(n => n.id !== id));
    setSel(null);
  };
  const confirmNode = (id: string) => setNodes(p => p.map(n => n.id === id ? { ...n, pending: false } : n));
  const rejectNode = (id: string) => {
    setNodes(p => p.filter(n => n.id !== id));
    setSel(null);
  };

  return (
    <div style={{
      width: 258, background: C.panel, borderLeft: `1px solid ${C.bdr}`,
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* ── Header ── */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.bdr}`, background: C.sub }}>
        <div style={{
          fontSize: 9, color: C.muted, marginBottom: 4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {path.join(' › ')}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 6 }}>
            <input
              value={selNode.title}
              onChange={e => setNodes(p => p.map(n => n.id === selNode.id ? { ...n, title: e.target.value } : n))}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: `1px solid ${C.bdr}`, color: C.text, fontSize: 13, fontWeight: 600,
                outline: 'none', padding: '0 0 3px', marginBottom: 5, fontFamily: 'inherit',
              }}
            />
            <input
              value={selNode.sub}
              onChange={e => setNodes(p => p.map(n => n.id === selNode.id ? { ...n, sub: e.target.value } : n))}
              placeholder="副标题..."
              style={{
                width: '100%', background: 'transparent', border: 'none',
                borderBottom: `1px solid ${C.bdr}`, color: C.dim, fontSize: 11,
                outline: 'none', padding: '0 0 2px', marginBottom: 4, fontFamily: 'inherit',
              }}
            />
            <div style={{ fontSize: 9, color: C.muted }}>创建于 {fmtDate(selNode.createdAt)}</div>
          </div>
          <button onClick={() => setSel(null)} style={{
            background: 'none', border: 'none', color: C.dim, cursor: 'pointer', fontSize: 18, padding: 0, lineHeight: 1,
          }}>×</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Rating */}
        <div>
          <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>掌握评级</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Stars value={selNode.rating} onChange={r => setRating(selNode.id, r)} size={22} C={C} />
            <StateDots value={selNode.stateColor} onChange={c => setNodeState(selNode.id, c)} C={C} size={14} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: C.text }}>
              {RATING_LABELS[selNode.rating]}{selNode.rating > 0 && ` · ${selNode.rating}/5星`}
            </span>
            {selNode.stateColor && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 10,
                background: selNode.stateColor === 'green' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
                color: selNode.stateColor === 'green' ? GREEN : ORANGE,
                border: `1px solid ${selNode.stateColor === 'green' ? GREEN : ORANGE}`,
              }}>
                {STATE_LABELS[selNode.stateColor]}
              </span>
            )}
          </div>
        </div>

        {/* Children */}
        {children.length > 0 && (
          <div>
            <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              子节点 ({children.length})
            </div>
            {children.map(cid => {
              const cn = nodes.find(n => n.id === cid);
              if (!cn) return null;
              const gk = (ch[cid] || []).length;
              return (
                <div
                  key={cid}
                  onClick={() => { setSel(cid); scrollTo(cid); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                    background: C.sub, border: `1px solid ${C.bdr}`,
                    borderLeft: `3px solid ${cn.rating === 5 ? ORANGE : C.bdr}`,
                    borderRadius: 6, marginBottom: 4, cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 12 }}>{gk > 0 ? '📂' : '📄'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 11, color: C.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{cn.title}</div>
                    <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>
                      {fmtDate(cn.createdAt)}{gk > 0 ? ` · ${gk}子` : ''}
                    </div>
                  </div>
                  {cn.rating > 0 && (
                    <span style={{ fontSize: 8, color: ORANGE, flexShrink: 0, letterSpacing: -2 }}>
                      {'★'.repeat(cn.rating)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pending actions */}
        {selNode.pending && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => confirmNode(selNode.id)} style={{
              flex: 1, padding: '7px', background: 'rgba(16,185,129,0.1)', border: `1px solid ${GREEN}`,
              color: GREEN, borderRadius: 6, cursor: 'pointer', fontSize: 11,
            }}>✓ 确认合并</button>
            <button onClick={() => rejectNode(selNode.id)} style={{
              padding: '7px 12px', background: 'rgba(239,68,68,0.08)', border: `1px solid ${RED}`,
              color: RED, borderRadius: 6, cursor: 'pointer', fontSize: 11,
            }}>✗ 删除</button>
          </div>
        )}

        {/* Notes */}
        <div>
          <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>笔记</div>
          <textarea
            value={selNode.notes}
            onChange={e => setNodes(p => p.map(n => n.id === selNode.id ? { ...n, notes: e.target.value } : n))}
            placeholder="添加笔记..."
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box', background: C.sub, border: `1px solid ${C.bdr}`,
              borderRadius: 6, padding: '8px 10px', color: C.text, fontSize: 11.5, lineHeight: 1.7,
              outline: 'none', resize: 'vertical', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Files */}
        <div>
          <div style={{ fontSize: 9, color: C.dim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
            附件 ({selNode.files.length})
          </div>
          {selNode.files.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              background: C.sub, border: `1px solid ${C.bdr}`, borderRadius: 6, marginBottom: 4,
              fontSize: 11, color: C.text,
            }}>
              <span style={{ fontSize: 13 }}>{FI[f.t] || FI.default}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.n}</span>
              <span style={{
                fontSize: 9, color: C.muted, background: C.bg, padding: '2px 5px', borderRadius: 3, flexShrink: 0,
              }}>{f.t?.toUpperCase()}</span>
            </div>
          ))}
          <button style={{
            marginTop: 4, width: '100%', padding: 7, background: 'transparent',
            border: `1px dashed ${C.bdr}`, borderRadius: 6, color: C.muted, fontSize: 11, cursor: 'pointer',
          }}>+ 添加附件</button>
        </div>

        {/* Delete */}
        <div style={{ paddingTop: 4, borderTop: `1px solid ${C.bdr}` }}>
          <button onClick={() => deleteNode(selNode.id)} style={{
            width: '100%', padding: '7px', background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.35)', borderRadius: 6,
            color: RED, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
          }}>🗑 删除节点</button>
          <div style={{ fontSize: 9, color: C.muted, textAlign: 'center', marginTop: 4 }}>或选中后按 Delete 键</div>
        </div>
      </div>
    </div>
  );
}
