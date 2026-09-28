"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { usePermissions } from "@/context/PermissionsContext";

export function LoginForm() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = usePermissions();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Solo redirigir si hay sesión real (cookie + user). Tras logout el user
    // en memoria no debe mandarte al dashboard otra vez.
    useEffect(() => {
        if (authLoading) return;
        const token = Cookies.get("auth_token");
        if (token && user?.id) {
            router.replace("/");
        }
    }, [authLoading, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Por favor, ingresa tu correo y contraseña");
            return;
        }

        setIsLoading(true);

        try {
            await authService.login({ email, password });

            // Actualizar el estado global del usuario para traer sus permisos (/me)
            if (refreshUser) {
                await refreshUser();
            }

            toast.success("Inicio de sesión exitoso");
            router.push("/");
        } catch (error: any) {
            toast.error(error.message || "Error al iniciar sesión");
        } finally {
            setIsLoading(false);
        }
    };

    const hasSession = !!Cookies.get("auth_token") && !!user?.id;

    // Ya autenticado o cargando sesión: no mostrar el formulario
    if (authLoading || hasSession) {
        return (
            <div className="w-full max-w-sm flex flex-col items-center justify-center gap-3 py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-neutral">
                    {hasSession ? "Redirigiendo al dashboard..." : "Verificando sesión..."}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm space-y-8">
            <div className="flex flex-col items-center space-y-3 text-center">
                <h1 className="text-3xl font-semibold">Bienvenido</h1>
                <p className="text-sm text-neutral">Ingresa tu correo y contraseña para acceder</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-neutral" />
                        Correo electronico
                    </Label>
                    <InputGroup>
                        <InputGroupInput
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                    </InputGroup>
                </div>
                <div className="space-y-2 mb-0">
                    <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-neutral" />
                        Contraseña
                    </Label>
                    <InputGroup>
                        <InputGroupInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        <InputGroupAddon align="inline-end">
                            <InputGroupText
                                className="text-neutral cursor-pointer hover:text-white pr-3"
                                onClick={() => !isLoading && setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </InputGroupText>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <div className="flex items-center justify-end text-sm py-2 mt-0">
                    <Link href="#" className="text-primary hover:text-primary/80 transition-colors">Olvidaste tu contraseña?</Link>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-6 rounded-xl text-lg transition-all"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Ingresando...
                        </>
                    ) : (
                        "Ingresar"
                    )}
                </Button>

                <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-neutral/90"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-[#11081F] px-2 text-neutral">O continuar con</span>
                    </div>
                </div>

                <Button type="button" variant="outline" disabled={isLoading} className="w-full bg-transparent border border-neutral/90 text-white hover:bg-white/5 py-6 rounded-xl text-lg transition-all flex items-center justify-center gap-3">
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" /><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" /><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" /><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" /></g></svg>
                    Google
                </Button>

                <div className="text-center text-sm text-neutral mt-6">
                    ¿No tienes una cuenta? <Link href="#" className="text-primary hover:text-primary/80 transition-colors">Registrarse</Link>
                </div>
            </form>
        </div>
    );
}
