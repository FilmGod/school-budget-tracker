'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Offsets the page content for the fixed sidebar, but only on screens that
 * actually render the sidebar (everywhere except /login).
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/login';

  return (
    <div
      className={`flex min-h-screen flex-col print:pl-0 ${
        showSidebar ? 'lg:pl-[248px]' : ''
      }`}
    >
      {children}
    </div>
  );
}
