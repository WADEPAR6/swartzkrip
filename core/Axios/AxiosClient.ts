import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, RawAxiosRequestHeaders } from 'axios';
import { useEncryption } from '../encription/useEncryption';

/**
 * Cliente Axios Singleton con cifrado automático
 * Todos los requests y responses son cifrados/descifrados automáticamente
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
    // Interceptor de Request: Cifra los datos antes de enviarlos
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Si hay datos en el body, cifrarlos
        if (config.data) {
          const encryptedData = useEncryption.encrypt(JSON.stringify(config.data));
          config.data = { encrypted: encryptedData };
        }

        // Si hay parámetros en la URL, cifrarlos también
        if (config.params) {
          const encryptedParams = useEncryption.encrypt(JSON.stringify(config.params));
          config.params = { encrypted: encryptedParams };
        }

        // Agregar timestamp para prevenir replay attacks
        const headers = config.headers as RawAxiosRequestHeaders;
        headers['X-Request-Time'] = Date.now().toString();

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor de Response: Descifra los datos recibidos
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Si la respuesta tiene datos cifrados, descifrarlos
        if (response.data && response.data.encrypted) {
          const decryptedData = useEncryption.decrypt(response.data.encrypted);
          try {
            response.data = JSON.parse(decryptedData);
          } catch (error) {
            console.error('Error al parsear datos descifrados:', error);
          }
        }
        return response;
      },
      (error) => {
        // Manejar errores de forma centralizada
        if (error.response) {
          console.error('Error de respuesta:', error.response.status);
        } else if (error.request) {
          console.error('Error de request:', error.message);
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
