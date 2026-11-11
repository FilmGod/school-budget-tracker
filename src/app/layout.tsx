import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { PreferencesProvider } from '@/context/PreferencesContext';
import Navbar from '@/components/Navbar';
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
      <body className="min-h-screen flex flex-col bg-[#f1f5f9] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100 antialiased selection:bg-sky-500 selection:text-white transition-colors duration-200 print:bg-white print:text-slate-900 print:m-0 print:p-0">
        <PreferencesProvider>
          <AppProvider>
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col print:p-0 print:m-0 print:max-w-none print:w-full print:contents">
              {children}
            </main>
            <Footer />
          </AppProvider>
        </PreferencesProvider>
      </body>
    </html>
  );
}
