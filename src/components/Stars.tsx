'use client';

import { useState } from 'react';
import { ORANGE } from '@/lib/constants';
import type { ThemeColors } from '@/lib/constants';

interface StarsProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
  C: ThemeColors;
  readonly?: boolean;
}

export default function Stars({ value, onChange, size = 12, C, readonly = false }: StarsProps) {
  const [hov, setHov] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 2 }} onMouseLeave={() => !readonly && setHov(0)}>
      {[1, 2, 3, 4, 5].map(i => (
        <span
          key={i}
          onMouseEnter={() => !readonly && setHov(i)}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); if (!readonly) onChange(i === value ? 0 : i); }}
          style={{
            fontSize: size,
            color: i <= (hov || value) ? ORANGE : C.muted,
            cursor: readonly ? 'default' : 'pointer',
            lineHeight: 1,
            transition: 'color 0.08s',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  );
}
