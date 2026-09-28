import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { PermissionsProvider } from "@/context/PermissionsContext";
import { Toaster } from "sonner";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export default function LoginPage() {
  return (
    <>
      <div className="flex min-h-screen bg-[#11081F] text-white">
        {/* Left Column - Form */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm">
            <LoginForm />
          </div>
        </div>

        {/* Right Column - Graphic */}
        <div className="hidden lg:flex flex-1 relative p-4">
          <div className="w-full h-full bg-[#241344] rounded-[40px] flex flex-col items-center justify-center relative overflow-hidden">
            {/* Nav dots */}
            <div className="absolute top-8 right-8 flex gap-2">
              <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                 <ChevronLeft className="w-4 h-4 text-white/70" />
              </button>
              <button className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                 <ChevronRight className="w-4 h-4 text-white/70" />
              </button>
            </div>

            {/* Logo area */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="text-6xl font-black italic bg-gradient-to-tr from-[#9D4EDD] to-[#48CAE4] text-transparent bg-clip-text">
                S
              </div>
              <h2 className="text-white font-bold tracking-widest text-sm mt-2">ISP START</h2>
            </div>

            {/* Bottom banner */}
            <div className="absolute bottom-12 left-12 right-12 bg-[#1f103a] rounded-2xl p-6 flex items-center justify-between border border-white/5 shadow-xl">
              <span className="text-sm text-gray-300">Conoce más sobre las novedades recientes</span>
              <button className="flex items-center gap-2 text-sm font-semibold hover:text-gray-300 transition">
                Ir <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" theme="dark" />
    </>
  );
}
