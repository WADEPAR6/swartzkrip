import axiosClient from '@/core/Axios/AxiosClient';
import { IPdf, IPdfListResponse, IPdfCreateRequest, IPdfUpdateRequest } from '../data/interfaces/pdf.interface';

/**
 * Servicio para gestión de PDFs
 * Utiliza el AxiosClient singleton con cifrado automático
 */
class PdfService {
  private static instance: PdfService;
  private readonly basePath = '/api/pdfs';

  private constructor() {}

  public static getInstance(): PdfService {
    if (!PdfService.instance) {
      PdfService.instance = new PdfService();
    }
    return PdfService.instance;
  }

  /**
   * Obtener lista de PDFs con paginación
   */
  async getPdfs(page: number = 1, limit: number = 10): Promise<IPdfListResponse> {
    try {
      const response = await axiosClient.get<IPdfListResponse>(this.basePath, {
        params: { page, limit }
      });
      return response;
    } catch (error) {
      console.error('Error al obtener PDFs:', error);
      throw error;
    }
  }

  /**
   * Obtener un PDF por ID
   */
  async getPdfById(id: string): Promise<IPdf> {
    try {
      const response = await axiosClient.get<IPdf>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error('Error al obtener PDF:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo PDF
   */
  async createPdf(data: IPdfCreateRequest): Promise<IPdf> {
    try {
      // Para archivos, necesitamos usar FormData
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('file', data.file);
      if (data.tags) formData.append('tags', JSON.stringify(data.tags));

      const response = await axiosClient.post<IPdf>(this.basePath, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      console.error('Error al crear PDF:', error);
      throw error;
    }
  }

  /**
   * Actualizar un PDF
   */
  async updatePdf(data: IPdfUpdateRequest): Promise<IPdf> {
    try {
      const { id, ...updateData } = data;
      const response = await axiosClient.put<IPdf>(`${this.basePath}/${id}`, updateData);
      return response;
    } catch (error) {
      console.error('Error al actualizar PDF:', error);
      throw error;
    }
  }

  /**
   * Eliminar un PDF
   */
  async deletePdf(id: string): Promise<void> {
    try {
      await axiosClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error('Error al eliminar PDF:', error);
      throw error;
    }
  }

  /**
   * Buscar PDFs por título
   */
  async searchPdfs(query: string, page: number = 1, limit: number = 10): Promise<IPdfListResponse> {
    try {
      const response = await axiosClient.get<IPdfListResponse>(`${this.basePath}/search`, {
        params: { q: query, page, limit }
      });
      return response;
    } catch (error) {
      console.error('Error al buscar PDFs:', error);
      throw error;
    }
  }

  /**
   * Descargar un PDF
   */
  async downloadPdf(id: string): Promise<Blob> {
    try {
      const response = await axiosClient.getAxiosInstance().get(`${this.basePath}/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const pdfService = PdfService.getInstance();
export default pdfService;