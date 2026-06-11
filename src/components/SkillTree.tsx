'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DARK_THEME, LIGHT_THEME, NW, NH } from '@/lib/constants';
import { buildMaps, calcStats } from '@/lib/utils';
import { NODES0, EDGES0 } from '@/lib/data';
import SkillCanvas from './SkillCanvas';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import BottomBar from './BottomBar';
import type { SkillNodeData, SkillEdgeData } from '@/lib/types';

export default function SkillTree() {
  // ── Core state ──────────────────────────────────────────
  const [nodes, setNodes] = useState<SkillNodeData[]>(NODES0);
  const [edges, setEdges] = useState<SkillEdgeData[]>(EDGES0);
  const [sel, setSel] = useState<string | null>(null);
  const [dark, setDark] = useState(true);
  const [pulse, setPulse] = useState<string | null>(null);
  const [cEId, setCEId] = useState<string | null>(null);
  const [cEV, setCEV] = useState('');

  // ── Filter state ────────────────────────────────────────
  const [fStars, setFStars] = useState<number | null>(null);
  const [fAtLeast, setFAtLeast] = useState(true);
  const [fUnrated, setFUnrated] = useState(false);
  const [q, setQ] = useState('');

  // ── Refs ────────────────────────────────────────────────
  const nodesRef = useRef(nodes);
  useEffect(() => { nodesRef.current = nodes; }, [nodes]);

  // ── Derived ─────────────────────────────────────────────
  const C = useMemo(() => dark ? DARK_THEME : LIGHT_THEME, [dark]);
  const { ch, pa } = useMemo(() => buildMaps(edges), [edges]);
  const selNode = sel ? nodes.find(n => n.id === sel) : null;
  const lq = q.toLowerCase();

  const rootIds = useMemo(() => {
    const ci = new Set(edges.map(e => e.t));
    return nodes.filter(n => !ci.has(n.id) && !n.pending && !n.isNew).map(n => n.id);
  }, [nodes, edges]);

  const dimIds = useMemo(() => {
    const ids = new Set<string>();
    nodes.forEach(n => {
      const sf = lq && !n.title.toLowerCase().includes(lq) && !n.sub.toLowerCase().includes(lq);
      let ff = false;
      if (fUnrated) ff = n.rating !== 0;
      else if (fStars) ff = fAtLeast ? n.rating < fStars : n.rating !== fStars;
      if (sf || ff) ids.add(n.id);
    });
    return ids;
  }, [nodes, lq, fStars, fAtLeast, fUnrated]);

  // ── CRUD operations ─────────────────────────────────────
  const deleteNode = useCallback((id: string) => {
    setNodes(p => p.filter(n => n.id !== id));
    setEdges(p => p.filter(e => e.f !== id && e.t !== id));
    setSel(s => s === id ? null : s);
  }, []);

  const setRating = useCallback((id: string, r: number) => {
    setNodes(p => p.map(n => n.id === id ? { ...n, rating: r } : n));
  }, []);

  const setNodeState = useCallback((id: string, c: null | 'green' | 'orange') => {
    setNodes(p => p.map(n => n.id === id ? { ...n, stateColor: c } : n));
  }, []);

  const confirmNode = useCallback((id: string) => {
    setNodes(p => p.map(n => n.id === id ? { ...n, pending: false } : n));
  }, []);

  const rejectNode = useCallback((id: string) => {
    setNodes(p => p.filter(n => n.id !== id));
    setEdges(p => p.filter(e => e.f !== id && e.t !== id));
    setSel(s => s === id ? null : s);
  }, []);

  // ── Add sibling ─────────────────────────────────────────
  const addSibling = useCallback((nodeId: string) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) return;
    const parentId = (pa[nodeId] || [])[0] || null;
    const newId = `n-${Date.now()}`;
    setNodes(p => [...p, {
      id: newId, title: '', sub: '', rating: 0, stateColor: null, pending: false, isNew: true,
      x: node.x + NW + 32, y: node.y, files: [], notes: '', createdAt: Date.now(),
    }]);
    if (parentId) setEdges(p => [...p, { f: parentId, t: newId }]);
    setCEId(newId);
    setCEV('');
  }, [pa]);

  // ── Add child ───────────────────────────────────────────
  const addChild = useCallback((nodeId: string) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) return;
    const childNodes = (ch[nodeId] || []).map(cid => nodesRef.current.find(n => n.id === cid)).filter(Boolean);
    const maxY = childNodes.length ? Math.max(...childNodes.map(n => n!.y)) : node.y;
    const newY = Math.max(node.y + NH + 52, maxY + NH + 20);
    const newId = `n-${Date.now()}`;
    setNodes(p => [...p, {
      id: newId, title: '', sub: '', rating: 0, stateColor: null, pending: false, isNew: true,
      x: node.x, y: newY, files: [], notes: '', createdAt: Date.now(),
    }]);
    setEdges(p => [...p, { f: nodeId, t: newId }]);
    setCEId(newId);
    setCEV('');
  }, [ch]);

  // ── Inline rename ───────────────────────────────────────
  const onDblClick = useCallback((id: string) => {
    const node = nodesRef.current.find(n => n.id === id);
    if (!node) return;
    setCEId(id);
    setCEV(node.title);
  }, []);

  const confirmCEdit = useCallback(() => {
    const node = nodesRef.current.find(n => n.id === cEId);
    if (cEV.trim()) {
      setNodes(p => p.map(n => n.id === cEId ? { ...n, title: cEV.trim(), isNew: false } : n));
    } else if (node?.isNew) {
      setNodes(p => p.filter(n => n.id !== cEId));
      setEdges(p => p.filter(e => e.f !== cEId && e.t !== cEId));
    }
    setCEId(null);
  }, [cEId, cEV]);

  const cancelCEdit = useCallback(() => {
    const node = nodesRef.current.find(n => n.id === cEId);
    if (node?.isNew) {
      setNodes(p => p.filter(n => n.id !== cEId));
      setEdges(p => p.filter(e => e.f !== cEId && e.t !== cEId));
    }
    setCEId(null);
  }, [cEId]);

  // ── Scroll to node (pulse animation) ────────────────────
  const scrollTo = useCallback((id: string) => {
    setPulse(id);
    setTimeout(() => setPulse(null), 900);
  }, []);

  // ── Keyboard delete ─────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (sel) { e.preventDefault(); deleteNode(sel); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sel, deleteNode]);

  // ── Right panel delete also removes edges ───────────────
  const deleteNodeFull = useCallback((id: string) => {
    setNodes(p => p.filter(n => n.id !== id));
    setEdges(p => p.filter(e => e.f !== id && e.t !== id));
    setSel(s => s === id ? null : s);
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: C.bg, color: C.text, fontFamily: 'system-ui,sans-serif', userSelect: 'none',
    }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* ── LEFT ── */}
        <LeftPanel
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          ch={ch}
          rootIds={rootIds}
          sel={sel}
          onSelect={id => { setSel(id); scrollTo(id); }}
          dark={dark}
          setDark={setDark}
          C={C}
        />

        {/* ── CANVAS ── */}
        <SkillCanvas
          nodes={nodes}
          setNodes={setNodes}
          edges={edges}
          setEdges={setEdges}
          sel={sel}
          setSel={setSel}
          dimIds={dimIds}
          pulse={pulse}
          cEId={cEId}
          cEV={cEV}
          setCEV={setCEV}
          confirmCEdit={confirmCEdit}
          cancelCEdit={cancelCEdit}
          setRating={setRating}
          setNodeState={setNodeState}
          deleteNode={deleteNodeFull}
          confirmNode={confirmNode}
          rejectNode={rejectNode}
          addSibling={addSibling}
          addChild={addChild}
          onDblClick={onDblClick}
          scrollTo={scrollTo}
          ch={ch}
          C={C}
          dark={dark}
        />

        {/* ── RIGHT ── */}
        {selNode && (
          <RightPanel
            selNode={selNode}
            nodes={nodes}
            setNodes={setNodes}
            setSel={setSel}
            pa={pa}
            ch={ch}
            scrollTo={scrollTo}
            C={C}
          />
        )}
      </div>

      {/* ── BOTTOM ── */}
      <BottomBar
        nodes={nodes}
        setNodes={setNodes}
        dark={dark}
        C={C}
        fStars={fStars}
        setFStars={setFStars}
        fAtLeast={fAtLeast}
        setFAtLeast={setFAtLeast}
        fUnrated={fUnrated}
        setFUnrated={setFUnrated}
        q={q}
        setQ={setQ}
      />
    </div>
  );
}
