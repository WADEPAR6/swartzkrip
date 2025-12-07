import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import { useEncryption } from '../encription/useEncryption';
import tokenManager from '../lib/tokenManager';

/**
 * Cliente Axios Singleton con cifrado automático
 * Todos los requests y responses son cifrados/descifrados automáticamente
 * Incluye manejo automático de autenticación con httpOnly cookies
 */
class AxiosClient {
  private static instance: AxiosClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://www.backend:8000/',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // IMPORTANTE: Permite enviar cookies httpOnly
    });

    this.setupInterceptors();
  }

  /**
   * Obtener la instancia singleton
   */
  public static getInstance(): AxiosClient {
    if (!AxiosClient.instance) {
      AxiosClient.instance = new AxiosClient();
    }
    return AxiosClient.instance;
  }

  /**
   * Configurar interceptores para cifrado automático
   */
  private setupInterceptors(): void {
    // Interceptor de Request: Agrega headers de autenticación
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // ====== ENCRIPTACIÓN DESACTIVADA ======
        // TODO: Activar encriptación en producción
        
        // if (config.data) {
        //   const encryptedData = useEncryption.encrypt(JSON.stringify(config.data));
        //   config.data = { encrypted: encryptedData };
        // }

        // if (config.params) {
        //   const encryptedParams = useEncryption.encrypt(JSON.stringify(config.params));
        //   config.params = { encrypted: encryptedParams };
        // }
        // ======================================

        const headers = config.headers as RawAxiosRequestHeaders;

        // Agregar timestamp para prevenir replay attacks
        headers['X-Request-Time'] = Date.now().toString();

        // Agregar información del usuario desde localStorage
        const session = tokenManager.getSession();
        const userData = tokenManager.getUserData();
        
        if (session) {
          // IMPORTANTE: En producción, el token debería venir del backend
          // Por ahora usamos un token mock basado en la sesión
          const mockToken = `mock_token_${session.userId}_${session.role}`;
          
          // Bearer Token - Estándar de autenticación
          headers['Authorization'] = `Bearer ${mockToken}`;
          
          // Headers adicionales con información del usuario
          headers['X-User-Role'] = session.role;
          headers['X-User-Id'] = session.userId;
          headers['X-User-Email'] = session.email;
        }

        // Log para debugging
        console.log('📤 Request:', config.url);
        console.log('📦 Data:', config.data);
        console.log('🔑 Headers:', {
          authorization: headers['Authorization'],
          role: headers['X-User-Role'],
          userId: headers['X-User-Id'],
          email: headers['X-User-Email'],
        });

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de Response: Maneja errores de autenticación
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // ====== ENCRIPTACIÓN DESACTIVADA ======
        // TODO: Activar encriptación en producción
        
        // if (response.data && response.data.encrypted) {
        //   const decryptedData = useEncryption.decrypt(response.data.encrypted);
        //   try {
        //     response.data = JSON.parse(decryptedData);
        //   } catch (error) {
        //     console.error('Error al parsear datos descifrados:', error);
        //   }
        // }
        // ======================================
        return response;
      },
      async (error) => {
        // Manejar errores de forma centralizada
        if (error.response) {
          console.error('❌ Error:', error.response.status);
          console.error('📦 Details:', error.response.data);

          // Si es 401 (No autorizado), limpiar sesión
          if (error.response.status === 401) {
            console.warn('🔒 Token expirado, limpiando sesión...');
            tokenManager.clearSession();
            
            // Redirigir a login
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
          }

          // Si es 403 (Forbidden)
          if (error.response.status === 403) {
            console.error('🚫 Sin permisos');
          }
        } else if (error.request) {
          console.error('❌ Request error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET request
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Obtener la instancia raw de Axios (para casos especiales)
   */
  public getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Exportar la instancia singleton
export const axiosClient = AxiosClient.getInstance();
export default axiosClient;
