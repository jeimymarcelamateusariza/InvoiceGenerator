import { LogoutButton } from "@/components/auth/LogoutButton";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white shadow-sm border-b p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">Invoice Printer App</h1>
          <LogoutButton />
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}
