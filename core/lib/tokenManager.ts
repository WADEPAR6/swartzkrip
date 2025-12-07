/**
 * Gestor de tokens con seguridad mejorada
 * IMPORTANTE: El accessToken se envía automáticamente vía httpOnly cookie
 * Aquí solo gestionamos datos no sensibles (rol, permisos)
 */

import { UserRole } from "@/features/auth/data/interfaces/auth.interface";

const TOKEN_KEY = 'auth_session'; // Solo metadata, no el token real
const USER_KEY = 'user_data';

interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: number;
}

class TokenManager {
  private static instance: TokenManager;

  private constructor() {}

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  /**
   * Guardar metadata de sesión (NO el token)
   * El token real va en httpOnly cookie del servidor
   */
  public setSession(userId: string, email: string, role: UserRole, expiresIn: number): void {
    const expiresAt = Date.now() + expiresIn * 1000;
    
    const sessionData: SessionData = {
      userId,
      email,
      role,
      expiresAt,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(sessionData));
    }
  }

  /**
   * Obtener metadata de sesión
   */
  public getSession(): SessionData | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(TOKEN_KEY);
      if (!data) return null;

      const session: SessionData = JSON.parse(data);

      // Verificar si expiró
      if (Date.now() > session.expiresAt) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error al obtener sesión:', error);
      return null;
    }
  }

  /**
   * Verificar si hay sesión activa
   */
  public isAuthenticated(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Obtener rol del usuario
   */
  public getUserRole(): UserRole | null {
    const session = this.getSession();
    return session?.role || null;
  }

  /**
   * Guardar datos de usuario (no sensibles)
   */
  public setUserData(userData: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  }

  /**
   * Obtener datos de usuario
   */
  public getUserData(): any | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  /**
   * Limpiar sesión
   */
  public clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Verificar si la sesión está por expirar (menos de 5 minutos)
   */
  public isSessionExpiringSoon(): boolean {
    const session = this.getSession();
    if (!session) return false;

    const fiveMinutes = 5 * 60 * 1000;
    return session.expiresAt - Date.now() < fiveMinutes;
  }
}

export const tokenManager = TokenManager.getInstance();
export default tokenManager;
