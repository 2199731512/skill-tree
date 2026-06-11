'use client';

import dynamic from 'next/dynamic';

// Disable SSR for SkillTree (ReactFlow requires browser APIs)
const SkillTree = dynamic(() => import('@/components/SkillTree'), { ssr: false });

export default function Home() {
  return <SkillTree />;
}
