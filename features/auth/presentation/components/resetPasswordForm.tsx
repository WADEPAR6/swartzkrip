"use client";

import { useState, useEffect, Suspense } from "react";
import { Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import authService from "@/features/auth/service/auth.service";

/**
 * Componente interno que usa useSearchParams
 */
function ResetPasswordFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Token de recuperación no válido");
    }
  }, [searchParams]);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push("Debe tener al menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Debe contener al menos una mayúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Debe contener al menos una minúscula");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Debe contener al menos un número");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      errors.push("Debe contener al menos un carácter especial (!@#$%^&*)");
    }
    
    return errors;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, newPassword });
    setValidationErrors(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar que las contraseñas coincidan
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar fortaleza de la contraseña
    const errors = validatePassword(formData.newPassword);
    if (errors.length > 0) {
      setError("La contraseña no cumple con los requisitos de seguridad");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Error al resetear contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              ¡Contraseña Actualizada!
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Tu contraseña ha sido cambiada exitosamente.
            </p>
            
            <p className="text-sm text-slate-500 dark:text-slate-500 mb-8">
              Serás redirigido al login en unos segundos...
            </p>

            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Nueva Contraseña
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Ingresa tu nueva contraseña segura
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Nueva Contraseña */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPasswords.new ? "text" : "password"}
                value={formData.newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Ingresa tu nueva contraseña"
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Indicadores de validación */}
            {formData.newPassword && (
              <div className="mt-3 space-y-1">
                {validationErrors.map((err, index) => (
                  <p key={index} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <span>✗</span> {err}
                  </p>
                ))}
                {validationErrors.length === 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <span>✓</span> Contraseña segura
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirmar Contraseña */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPasswords.confirm ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                placeholder="Confirma tu nueva contraseña"
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {formData.confirmPassword && (
              <p className={`text-xs mt-2 ${
                formData.newPassword === formData.confirmPassword
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formData.newPassword === formData.confirmPassword ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || validationErrors.length > 0 || formData.newPassword !== formData.confirmPassword}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Actualizando...
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                Actualizar Contraseña
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Requisitos de seguridad: Mínimo 8 caracteres, mayúsculas, minúsculas, números y caracteres especiales
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Componente wrapper con Suspense para resetear contraseña con token
 */
export default function ResetPasswordForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ResetPasswordFormInner />
    </Suspense>
  );
}
