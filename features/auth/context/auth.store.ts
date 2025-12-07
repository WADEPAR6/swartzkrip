/**
 * Store de autenticación
 * Maneja el estado global de autenticación
 */

import { IAuthState, IUser } from "../data/interfaces/auth.interface";
import authService from "../service/auth.service";
import tokenManager from "@/core/lib/tokenManager";

class AuthStore {
  private static instance: AuthStore;
  private state: IAuthState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = this.getInitialState();
  }

  public static getInstance(): AuthStore {
    if (!AuthStore.instance) {
      AuthStore.instance = new AuthStore();
    }
    return AuthStore.instance;
  }

  private getInitialState(): IAuthState {
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };
  }

  /**
   * Suscribirse a cambios del estado
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notificar a los listeners
   */
  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Obtener el estado actual
   */
  public getState(): IAuthState {
    return { ...this.state };
  }

  /**
   * Actualizar el estado
   */
  private setState(updates: Partial<IAuthState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  /**
   * Iniciar sesión
   */
  public async login(email: string, password: string): Promise<boolean> {
    try {
      this.setState({ isLoading: true, error: null });

      const response = await authService.login({ email, password });

      // Guardar metadata de sesión (NO el token)
      tokenManager.setSession(
        response.user.id,
        response.user.email,
        response.user.role,
        response.expiresIn
      );

      // Guardar datos de usuario
      tokenManager.setUserData(response.user);

      this.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (error: any) {
      this.setState({
        isLoading: false,
        error: error.message || "Error al iniciar sesión",
      });
      return false;
    }
  }

  /**
   * Cerrar sesión
   */
  public async logout(): Promise<void> {
    try {
      this.setState({ isLoading: true });

      await authService.logout();

      // Limpiar metadata local
      tokenManager.clearSession();

      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      
      // Aunque falle el backend, limpiamos el cliente
      tokenManager.clearSession();
      
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }

  /**
   * Verificar autenticación al cargar la app
   */
  public async checkAuth(): Promise<void> {
    try {
      this.setState({ isLoading: true });

      // Verificar si hay sesión local
      const session = tokenManager.getSession();
      if (!session) {
        this.setState({ isLoading: false });
        return;
      }

      // Validar con el backend
      const user = await authService.getCurrentUser();

      this.setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      // Si falla, limpiar sesión
      tokenManager.clearSession();
      this.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }

  /**
   * Refrescar token si está por expirar
   */
  public async refreshTokenIfNeeded(): Promise<void> {
    if (tokenManager.isSessionExpiringSoon()) {
      try {
        const response = await authService.refreshToken();
        
        // Actualizar metadata de sesión
        const session = tokenManager.getSession();
        if (session) {
          tokenManager.setSession(
            session.userId,
            session.email,
            session.role,
            response.expiresIn
          );
        }
      } catch (error) {
        console.error("Error al refrescar token:", error);
        await this.logout();
      }
    }
  }

  /**
   * Limpiar error
   */
  public clearError(): void {
    this.setState({ error: null });
  }
}

export const authStore = AuthStore.getInstance();
export default authStore;
