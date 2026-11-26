import './globals.css';

export const metadata = {
  title: 'BLA Portals & Administration — Barrownz Learning Academy',
  description: 'Centralized Administrative, Student, Trainer, and Assessment Control Panels for Barrownz Learning Academy.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
