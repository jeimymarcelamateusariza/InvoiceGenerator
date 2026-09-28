import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PermissionsProvider } from "@/context/PermissionsContext";

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
        <PermissionsProvider>
          {children}
        </PermissionsProvider>
      </body>
    </html>
  );
}
