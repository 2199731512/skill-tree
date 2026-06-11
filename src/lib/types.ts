// ── Core domain types ──────────────────────────────────────

export interface SkillNodeData {
  id: string;
  title: string;
  sub: string;
  rating: number;        // 0-5, 0=未评级
  stateColor: null | 'green' | 'orange';
  pending: boolean;
  isNew: boolean;
  x: number;
  y: number;
  files: FileItem[];
  notes: string;
  createdAt: number;
}

export interface FileItem {
  n: string;  // 文件名
  t: string;  // 扩展名
}

export interface SkillEdgeData {
  f: string;  // from
  t: string;  // to
}

// ── Stats ─────────────────────────────────────────────────

export interface TreeStats {
  total: number;
  rated: number;
  unrated: number;
  top: number;
  pend: number;
  dist: number[];  // dist[0..5] = count at each rating
}
