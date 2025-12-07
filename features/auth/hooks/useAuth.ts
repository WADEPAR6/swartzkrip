"use client";

import { useEffect, useState, useCallback } from "react";
import { authStore } from "../context/auth.store";
import { IAuthState } from "../data/interfaces/auth.interface";

/**
 * Hook personalizado para autenticación
 * Conecta los componentes con el authStore
 */
export function useAuth() {
  const [state, setState] = useState<IAuthState>(authStore.getState());

  useEffect(() => {
    // Suscribirse a cambios del store
    const unsubscribe = authStore.subscribe(() => {
      setState(authStore.getState());
    });

    // Verificar autenticación al montar
    authStore.checkAuth();

    // Configurar refresh automático cada 4 minutos
    const refreshInterval = setInterval(() => {
      authStore.refreshTokenIfNeeded();
    }, 4 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, []);

  /**
   * Iniciar sesión
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    return await authStore.login(email, password);
  }, []);

  /**
   * Cerrar sesión
   */
  const logout = useCallback(async () => {
    await authStore.logout();
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    authStore.clearError();
  }, []);

  /**
   * Verificar autenticación
   */
  const checkAuth = useCallback(async () => {
    await authStore.checkAuth();
  }, []);

  return {
    // Estado
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,

    // Acciones
    login,
    logout,
    clearError,
    checkAuth,
  };
}
