"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuth } from "../../hooks/useAuth";
import { Loader2, LogIn, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const { login, error, isLoading: authLoading, clearError } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  // Login con Microsoft (Principal)
  const handleMicrosoftLogin = async () => {
    setIsMicrosoftLoading(true);
    try {
      await signIn("microsoft-entra-id", {
        callbackUrl: "/pdf",
      });
    } catch (error) {
      console.error("Error con Microsoft login:", error);
    } finally {
      setIsMicrosoftLoading(false);
    }
  };

  // Login con email/password (Secundario)
  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      router.push("/pdf");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Bienvenido
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Inicia sesión para continuar
          </p>
        </div>

        {/* Microsoft Login (PRINCIPAL) */}
        <div className="mb-6">
          <button
            onClick={handleMicrosoftLogin}
            disabled={isMicrosoftLoading}
            className="flex items-center justify-center gap-3 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isMicrosoftLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Conectando...
              </>
            ) : (
              <>
                {/* Logo de Microsoft */}
                <svg 
                  className="w-5 h-5" 
                  viewBox="0 0 23 23" 
                  fill="none"
                >
                  <path d="M11.5 1H1V11.5H11.5V1Z" fill="#F25022"/>
                  <path d="M22 1H11.5V11.5H22V1Z" fill="#7FBA00"/>
                  <path d="M11.5 11.5H1V22H11.5V11.5Z" fill="#00A4EF"/>
                  <path d="M22 11.5H11.5V22H22V11.5Z" fill="#FFB900"/>
                </svg>
                <span>Iniciar sesión con Microsoft</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          <span className="mx-4 text-slate-400 dark:text-slate-500 text-sm">o continúa con</span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                Error al iniciar sesión
              </p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Email/Password Login (SECUNDARIO) */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={authLoading}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={authLoading}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={authLoading || !email || !password}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {authLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </>
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <Link 
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-center text-sm text-slate-600 dark:text-slate-400">
            ¿Problemas para iniciar sesión?{" "}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Contactar soporte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
