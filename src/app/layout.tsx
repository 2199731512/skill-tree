import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkillTree — 技能树管理',
  description: '个人技能树管理工具，以节点图形式组织知识体系',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
