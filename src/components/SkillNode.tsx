'use client';

import { useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { ORANGE, GREEN, RED, NW, NH } from '@/lib/constants';
import Stars from './Stars';
import StateDots from './StateDots';
import type { SkillNodeData } from '@/lib/types';
import type { ThemeColors } from '@/lib/constants';

// ── Node data passed via ReactFlow ────────────────────────
export interface SkillNodeRFData {
  nodeData: SkillNodeData;
  C: ThemeColors;
  isDim: boolean;
  isPulse: boolean;
  cEId: string | null;
  cEV: string;
  setCEV: (v: string) => void;
  confirmCEdit: () => void;
  cancelCEdit: () => void;
  setRating: (id: string, r: number) => void;
  setNodeState: (id: string, c: null | 'green' | 'orange') => void;
  deleteNode: (id: string) => void;
  confirmNode: (id: string) => void;
  rejectNode: (id: string) => void;
  addSibling: (id: string) => void;
  addChild: (id: string) => void;
  onDblClick: (id: string) => void;
}

type SkillNodeProps = NodeProps & { data: SkillNodeRFData };

export default function SkillNode({ data, selected, id }: SkillNodeProps) {
  const {
    nodeData, C, isDim, isPulse, cEId, cEV, setCEV, confirmCEdit, cancelCEdit,
    setRating, setNodeState, deleteNode, confirmNode, rejectNode,
    addSibling, addChild, onDblClick,
  } = data;

  const [isHov, setIsHov] = useState(false);
  const isED = cEId === nodeData.id;

  // ── BUG FIX #2: Use individual border properties, NOT shorthand ──
  const is5 = nodeData.rating === 5;
  const edgeOpacity = selected ? 'rgba(245,158,11,0.9)' : is5 ? 'rgba(245,158,11,0.45)' : C.bdr;
  const nodeStyle: React.CSSProperties = {
    width: NW,
    minHeight: NH,
    boxSizing: 'border-box',
    borderTop: `1px solid ${edgeOpacity}`,
    borderRight: `1px solid ${edgeOpacity}`,
    borderBottom: `1px solid ${edgeOpacity}`,
    borderLeft: is5 ? `3px solid ${ORANGE}` : `1px solid ${C.bdr}`,
    background: nodeData.pending ? 'rgba(245,158,11,0.04)' : is5 ? 'rgba(245,158,11,0.03)' : C.node,
    boxShadow: selected ? '0 0 16px rgba(245,158,11,0.28)' : is5 ? '0 0 10px rgba(245,158,11,0.10)' : 'none',
    borderRadius: 9,
    opacity: isDim ? 0.14 : 1,
    transform: isPulse ? 'scale(1.06)' : 'scale(1)',
    transition: 'opacity 0.2s, transform 0.22s',
    position: 'relative',
    cursor: 'grab',
  };

  const handleDblClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDblClick(nodeData.id);
  }, [onDblClick, nodeData.id]);

  return (
    <div
      style={nodeStyle}
      onMouseEnter={() => setIsHov(true)}
      onMouseLeave={() => setIsHov(false)}
      onDoubleClick={handleDblClick}
    >
      {/* ReactFlow handles for edge connections (invisible, just for connection points) */}
      <Handle type="target" position={Position.Top} style={{ opacity: 0, width: 1, height: 1 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, width: 1, height: 1 }} />

      {/* × Delete button — top-right on hover */}
      {isHov && !nodeData.pending && !nodeData.isNew && !isED && (
        <div
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); deleteNode(nodeData.id); }}
          title="删除节点 (Delete键)"
          style={{
            position: 'absolute', top: 5, right: 5, width: 17, height: 17,
            borderRadius: '50%', background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.45)', color: RED,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, lineHeight: 1, cursor: 'pointer', zIndex: 20,
          }}
        >×</div>
      )}

      {/* + Sibling button — right side, Miro connector style */}
      {isHov && !nodeData.pending && !nodeData.isNew && !isED && (
        <PlusConnector
          side="right"
          color={ORANGE}
          label="添加同级节点"
          onClick={() => addSibling(nodeData.id)}
        />
      )}

      {/* + Child button — bottom side, Miro connector style */}
      {isHov && !nodeData.pending && !nodeData.isNew && !isED && (
        <PlusConnector
          side="bottom"
          color={GREEN}
          label="添加子节点"
          onClick={() => addChild(nodeData.id)}
        />
      )}

      <div style={{ padding: '9px 11px' }}>
        {isED ? (
          <input
            autoFocus
            value={cEV}
            onChange={e => setCEV(e.target.value)}
            placeholder="输入节点名称..."
            onKeyDown={e => {
              if (e.key === 'Enter') confirmCEdit();
              if (e.key === 'Escape') cancelCEdit();
            }}
            onBlur={confirmCEdit}
            onClick={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: `1px solid ${ORANGE}`, color: C.text,
              fontSize: 12, fontWeight: 600, outline: 'none', padding: '0 0 2px',
              marginBottom: 2, fontFamily: 'inherit',
            }}
          />
        ) : (
          <div
            title="双击改名"
            style={{
              fontSize: 12, fontWeight: 600, color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3,
            }}
          >
            {nodeData.title || <span style={{ color: C.muted, fontWeight: 400, fontStyle: 'italic' }}>未命名</span>}
          </div>
        )}
        {!nodeData.isNew && (
          <div style={{ fontSize: 10, color: C.dim, marginBottom: 6 }}>{nodeData.sub}</div>
        )}
        {!nodeData.isNew && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stars value={nodeData.rating} onChange={r => setRating(nodeData.id, r)} size={11} C={C} />
            <StateDots value={nodeData.stateColor} onChange={c => setNodeState(nodeData.id, c)} C={C} size={9} />
          </div>
        )}
        {nodeData.files.length > 0 && (
          <div style={{ fontSize: 9, color: C.muted, marginTop: 4 }}>📎{nodeData.files.length}</div>
        )}
        {nodeData.pending && (
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); confirmNode(nodeData.id); }}
              style={{
                fontSize: 9, background: 'rgba(16,185,129,0.12)', border: `1px solid ${GREEN}`,
                color: GREEN, borderRadius: 3, padding: '2px 8px', cursor: 'pointer',
              }}
            >✓ 确认</button>
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={e => { e.stopPropagation(); rejectNode(nodeData.id); }}
              style={{
                fontSize: 9, background: 'rgba(239,68,68,0.1)', border: `1px solid ${RED}`,
                color: RED, borderRadius: 3, padding: '2px 8px', cursor: 'pointer',
              }}
            >✗</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Miro-style connector button ───────────────────────────

interface PlusConnectorProps {
  side: 'right' | 'bottom';
  color: string;
  label: string;
  onClick: () => void;
}

function PlusConnector({ side, color, label, onClick }: PlusConnectorProps) {
  const [hov, setHov] = useState(false);
  const isRight = side === 'right';

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      title={label}
      style={{
        position: 'absolute',
        ...(isRight ? { right: -30, top: '50%', transform: 'translateY(-50%)' } : { bottom: -30, left: '50%', transform: 'translateX(-50%)' }),
        zIndex: 30,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: isRight ? 'row' : 'column',
        alignItems: 'center',
      }}
    >
      {/* Connector line */}
      <div style={{
        width: isRight ? 18 : 1.5,
        height: isRight ? 1.5 : 18,
        background: color,
        opacity: 0.55,
        flexShrink: 0,
        transition: 'opacity 0.1s',
      }} />
      {/* Circle button */}
      <div style={{
        width: 22, height: 22, borderRadius: '50%',
        background: color, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 17, fontWeight: 300, lineHeight: 1,
        transform: hov ? 'scale(1.18)' : 'scale(1)',
        transition: 'transform 0.12s, box-shadow 0.12s',
        boxShadow: hov ? `0 4px 14px ${color}80` : `0 2px 8px ${color}50`,
      }}>+</div>
    </div>
  );
}
