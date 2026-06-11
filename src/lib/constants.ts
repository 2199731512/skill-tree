// ── Colors ─────────────────────────────────────────────────
export const ORANGE = '#f59e0b';
export const GREEN  = '#10b981';
export const RED    = '#ef4444';

// ── Labels ────────────────────────────────────────────────
export const RATING_LABELS = ['未评级', '了解', '基础', '熟悉', '熟练', '精通'];
export const STATE_LABELS: Record<string, string> = { green: '学习中', orange: '已掌握' };

// ── File type icons ───────────────────────────────────────
export const FI: Record<string, string> = {
  pdf: '📄', md: '📝', json: '🔧', txt: '📋', png: '🖼️', jpg: '🖼️', default: '📎',
};

// ── Node dimensions ───────────────────────────────────────
export const NW = 158;
export const NH = 74;

// ── Theme palettes ────────────────────────────────────────
export interface ThemeColors {
  bg: string;
  panel: string;
  node: string;
  sub: string;
  bdr: string;
  text: string;
  dim: string;
  muted: string;
}

export const DARK_THEME: ThemeColors = {
  bg: '#07101e',
  panel: '#0c1828',
  node: '#0f1e32',
  sub: '#070e1a',
  bdr: '#1c2e48',
  text: '#d8eaf8',
  dim: '#5a7898',
  muted: '#2d4460',
};

export const LIGHT_THEME: ThemeColors = {
  bg: '#eef2f7',
  panel: '#ffffff',
  node: '#ffffff',
  sub: '#f3f7fb',
  bdr: '#cddaeb',
  text: '#142032',
  dim: '#4a6680',
  muted: '#a8bccf',
};
