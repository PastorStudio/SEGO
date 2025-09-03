import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { ClientOnly } from '@/components/client-only';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          .bg-dot-white/[0\.2] {
            background-image: radial-gradient(circle, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
            background-size: 1rem 1rem;
          }
        `}</style>
         <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `
(function() {
  try {
    var theme = localStorage.getItem('theme');
    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var cls = theme ? theme : (systemDark ? 'dark' : 'light');
    document.documentElement.classList.add(cls);
  } catch (e) {}
})();`
          }}
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <ClientOnly>
              <Toaster />
            </ClientOnly>
        </ThemeProvider>
      </body>
    </html>
  );
}
