import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'منبر الذكاء الاصطناعي | Minbar AI',
  description: 'المنصة الذكية الموثقة لتحرير وصياغة الخطب المنبرية والمواعظ الشرعية على منهج أهل السنة والجماعة (Zero-Hallucination Policy)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased selection:bg-amber-500/30 selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
