import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Invoice Printer',
  description: 'View and print invoices',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <header className="bg-white shadow-sm border-b p-4">
            <div className="container mx-auto">
              <h1 className="text-xl font-bold text-slate-800">Invoice Printer App</h1>
            </div>
          </header>
          <main className="flex-1 container mx-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
