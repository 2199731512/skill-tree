'use client';

import { ORANGE, GREEN } from '@/lib/constants';
import type { ThemeColors } from '@/lib/constants';

interface StateDotsProps {
  value: null | 'green' | 'orange';
  onChange: (v: null | 'green' | 'orange') => void;
  C: ThemeColors;
  size?: number;
}

const STATES: [string, string, string][] = [
  ['green', GREEN, '学习中'],
  ['orange', ORANGE, '已掌握'],
];

export default function StateDots({ value, onChange, C, size = 9 }: StateDotsProps) {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
      {STATES.map(([c, hex, label]) => (
        <div
          key={c}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onChange(value === c ? null : c as 'green' | 'orange'); }}
          title={`${label}（再点清除）`}
          style={{
            width: size,
            height: size,
            borderRadius: 2,
            cursor: 'pointer',
            background: hex,
            opacity: value === c ? 1 : 0.22,
            border: `1px solid ${hex}`,
            transition: 'opacity 0.12s',
          }}
        />
      ))}
    </div>
  );
}
