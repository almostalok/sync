import type { Metadata } from 'next';
import './globals.css';
import { ProjectProvider } from '@/context/ProjectContext';

export const metadata: Metadata = {
  title: 'SiteSync — Planning → Reality Intelligence (SIH26122)',
  description: 'Intelligent data capture and schedule-linking platform for infrastructure project management (Oil India Limited).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#070b12] text-slate-100 min-h-screen antialiased bg-grid-pattern selection:bg-cyan-500/30 selection:text-cyan-200">
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
