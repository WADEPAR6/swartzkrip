/**
 * Servicio de autenticación
 * Maneja login, logout, refresh token
 */

import axiosClient from "@/core/Axios/AxiosClient";
import {
  ILoginRequest,
  ILoginResponse,
  IRefreshTokenResponse,
  IUser,
} from "../data/interfaces/auth.interface";

class AuthService {
  private static instance: AuthService;
  private readonly AUTH_ENDPOINT = "/auth";

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login
   * El backend debe setear la cookie httpOnly con el token
   */
  public async login(credentials: ILoginRequest): Promise<ILoginResponse> {
    try {
      const response = await axiosClient.post<ILoginResponse>(
        `${this.AUTH_ENDPOINT}/login`,
        credentials,
        {
          withCredentials: true, // IMPORTANTE: Permite cookies httpOnly
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al iniciar sesión");
    }
  }

  /**
   * Logout
   * El backend debe limpiar la cookie httpOnly
   */
  public async logout(): Promise<void> {
    try {
      await axiosClient.post(
        `${this.AUTH_ENDPOINT}/logout`,
        {},
        {
          withCredentials: true,
        }
      );
    } catch (error: any) {
      console.error("Error al cerrar sesión:", error);
      throw new Error(error.response?.data?.message || "Error al cerrar sesión");
    }
  }

  /**
   * Refrescar token
   * Obtiene un nuevo accessToken usando el refreshToken de la cookie
   */
  public async refreshToken(): Promise<IRefreshTokenResponse> {
    try {
      const response = await axiosClient.post<IRefreshTokenResponse>(
        `${this.AUTH_ENDPOINT}/refresh`,
        {},
        {
          withCredentials: true,
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al refrescar token");
    }
  }

  /**
   * Obtener usuario actual
   * Valida el token con el backend
   */
  public async getCurrentUser(): Promise<IUser> {
    try {
      const response = await axiosClient.get<IUser>(
        `${this.AUTH_ENDPOINT}/me`,
        {
          withCredentials: true,
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al obtener usuario");
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * Hace una petición al backend para validar
   */
  public async verifyAuth(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Solicitar recuperación de contraseña
   * Envía email con token de reseteo
   */
  public async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosClient.post<{ success: boolean; message: string }>(
        `${this.AUTH_ENDPOINT}/forgot-password`,
        { email }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al solicitar recuperación de contraseña");
    }
  }

  /**
   * Resetear contraseña con token
   */
  public async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await axiosClient.post<{ success: boolean; message: string }>(
        `${this.AUTH_ENDPOINT}/reset-password`,
        {
          token,
          newPassword,
          confirmPassword
        }
      );

      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al resetear contraseña");
    }
  }
}

export const authService = AuthService.getInstance();
export default authService;
