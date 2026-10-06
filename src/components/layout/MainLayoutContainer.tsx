import React from "react";

export function MainLayoutContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-primary p-2.5 sm:p-4 md:p-5 flex flex-col justify-center items-center font-sans antialiased">
      <div className="w-[98%] sm:w-[96%] md:w-[95%] max-w-7xl rounded-2xl sm:rounded-3xl bg-background text-foreground shadow-2xl p-6 sm:p-8 md:p-10 min-h-[92vh] flex flex-col justify-between border border-border transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}
