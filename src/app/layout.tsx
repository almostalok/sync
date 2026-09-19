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
    <html lang="en">
      <body className="bg-[#f4f4f0] text-black min-h-screen antialiased selection:bg-black selection:text-white">
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </body>
    </html>
  );
}
