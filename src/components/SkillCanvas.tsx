'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodeClick,
  type NodeTypes,
  BezierEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { ORANGE, GREEN, NW, NH } from '@/lib/constants';
import SkillNode from './SkillNode';
import type { SkillNodeRFData } from './SkillNode';
import type { SkillNodeData, SkillEdgeData } from '@/lib/types';
import type { ThemeColors } from '@/lib/constants';

interface SkillCanvasProps {
  nodes: SkillNodeData[];
  setNodes: React.Dispatch<React.SetStateAction<SkillNodeData[]>>;
  edges: SkillEdgeData[];
  setEdges: React.Dispatch<React.SetStateAction<SkillEdgeData[]>>;
  sel: string | null;
  setSel: (id: string | null) => void;
  dimIds: Set<string>;
  pulse: string | null;
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
  scrollTo: (id: string) => void;
  ch: Record<string, string[]>;
  C: ThemeColors;
  dark: boolean;
}

export default function SkillCanvas({
  nodes, setNodes, edges, setEdges, sel, setSel, dimIds, pulse,
  cEId, cEV, setCEV, confirmCEdit, cancelCEdit,
  setRating, setNodeState, deleteNode, confirmNode, rejectNode,
  addSibling, addChild, onDblClick, scrollTo, ch, C, dark,
}: SkillCanvasProps) {
  // ── Convert to ReactFlow nodes ──────────────────────────
  const rfNodes: Node<SkillNodeRFData>[] = useMemo(() =>
    nodes.map(n => ({
      id: n.id,
      type: 'skillNode',
      position: { x: n.x, y: n.y },
      selected: sel === n.id,
      data: {
        nodeData: n,
        C,
        isDim: dimIds.has(n.id),
        isPulse: pulse === n.id,
        cEId,
        cEV,
        setCEV,
        confirmCEdit,
        cancelCEdit,
        setRating,
        setNodeState,
        deleteNode,
        confirmNode,
        rejectNode,
        addSibling,
        addChild,
        onDblClick,
      },
    })),
    [nodes, sel, dimIds, pulse, cEId, cEV, C, setCEV, confirmCEdit, cancelCEdit,
     setRating, setNodeState, deleteNode, confirmNode, rejectNode, addSibling, addChild, onDblClick]
  );

  // ── Convert to ReactFlow edges ──────────────────────────
  const rfEdges: Edge[] = useMemo(() =>
    edges.map(e => {
      const fn = nodes.find(n => n.id === e.f);
      const is5 = fn?.rating === 5;
      const isUnrated = fn?.rating === 0 || fn?.isNew;
      const dim = dimIds.has(e.f) && dimIds.has(e.t);
      return {
        id: `${e.f}-${e.t}`,
        source: e.f,
        target: e.t,
        style: {
          stroke: is5 ? ORANGE : GREEN,
          strokeWidth: is5 ? 1.6 : 1,
          opacity: dim ? 0.04 : 0.28,
          strokeDasharray: isUnrated ? '5,3' : 'none',
        },
      };
    }),
    [edges, nodes, dimIds]
  );

  // ── Handle node position changes (drag) ─────────────────
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    for (const change of changes) {
      if (change.type === 'position' && change.position && !change.dragging) {
        // Drag ended — persist position
        setNodes(p => p.map(n =>
          n.id === change.id ? { ...n, x: change.position!.x, y: change.position!.y } : n
        ));
      }
      if (change.type === 'position' && change.position && change.dragging) {
        // Dragging — update position in real-time
        setNodes(p => p.map(n =>
          n.id === change.id ? { ...n, x: change.position!.x, y: change.position!.y } : n
        ));
      }
    }
  }, [setNodes]);

  // ── Handle edge changes ─────────────────────────────────
  const onEdgesChange: OnEdgesChange = useCallback(() => {
    // Edges are managed externally, no-op
  }, []);

  // ── Handle node click (select/deselect) ─────────────────
  const onNodeClick: OnNodeClick = useCallback((_event, node) => {
    setSel(s => s === node.id ? null : node.id);
    scrollTo(node.id);
  }, [setSel, scrollTo]);

  // ── Node types ──────────────────────────────────────────
  const nodeTypes: NodeTypes = useMemo(() => ({
    skillNode: SkillNode,
  }), []);

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodeDragThreshold={5}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: C.bg }}
        defaultEdgeOptions={{ type: 'default' }}
        minZoom={0.3}
        maxZoom={2}
      >
        <Background color={C.muted} gap={20} size={1} />
        <MiniMap
          nodeColor={n => {
            const nd = nodes.find(x => x.id === n.id);
            if (!nd) return C.bdr;
            if (nd.rating === 5) return ORANGE;
            if (nd.rating > 0) return GREEN;
            return C.bdr;
          }}
          style={{
            background: C.panel,
            border: `1px solid ${C.bdr}`,
            borderRadius: 8,
          }}
          maskColor={dark ? 'rgba(7,16,30,0.7)' : 'rgba(238,242,247,0.7)'}
        />
      </ReactFlow>
    </div>
  );
}
