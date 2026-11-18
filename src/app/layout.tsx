import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import Navbar from '@/components/Navbar';
import AppShell from '@/components/AppShell';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'ระบบติดตามการใช้งบประมาณตามแผนปฏิบัติการประจำปี โรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก',
  description: 'ระบบติดตามการใช้งบประมาณตามแผนปฏิบัติการประจำปี โรงเรียนบางกล่ำวิทยา รัชมังคลาภิเษก',
  icons: {
    icon: '/school-logo.png',
    shortcut: '/school-logo.png',
    apple: '/school-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var p = localStorage.getItem('school_budget_user_prefs');
                if (p) {
                  var parsed = JSON.parse(p);
                  if (parsed.theme === 'dark' || (parsed.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                  if (parsed.fontSize) {
                    var m = { compact: '16px', standard: '18px', comfortable: '19.2px', large: '21px' };
                    if (m[parsed.fontSize]) document.documentElement.style.fontSize = m[parsed.fontSize];
                  }
                }
              } catch(e) {}
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  for (let registration of registrations) {
                    registration.unregister();
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-body antialiased selection:bg-brand selection:text-white transition-colors duration-200 print:bg-white print:text-slate-900 print:m-0 print:p-0">
        <PreferencesProvider>
          <AppProvider>
            <Navbar />
            <AppShell>
              <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col px-4 py-5 sm:px-6 sm:py-6 lg:px-8 print:p-0 print:m-0 print:max-w-none print:w-full print:contents">
                {children}
              </main>
              <Footer />
            </AppShell>
          </AppProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
