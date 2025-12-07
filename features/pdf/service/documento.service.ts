import axiosClient from '@/core/Axios/AxiosClient';
import {
  IDocumento,
  IDocumentoCreateRequest,
  IDocumentoCreateResponse,
  IDocumentoEnviarRequest,
  IDocumentoDraftRequest,
  IDocumentoListResponse,
  IDocumentoFilters
} from '../data/interfaces/documento.interface';

/**
 * Servicio para gestión de Documentos Oficiales
 * Maneja Oficios y Memorandos con firma electrónica
 */
class DocumentoService {
  private static instance: DocumentoService;
  private readonly basePath = '/api/documentos';

  private constructor() {}

  public static getInstance(): DocumentoService {
    if (!DocumentoService.instance) {
      DocumentoService.instance = new DocumentoService();
    }
    return DocumentoService.instance;
  }

  /**
   * Convertir File a Base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remover prefijo "data:application/pdf;base64,"
        const base64Clean = base64.split(',')[1];
        resolve(base64Clean);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Obtener lista de documentos con filtros
   */
  async getDocumentos(
    filters?: IDocumentoFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<IDocumentoListResponse> {
    try {
      const response = await axiosClient.get<IDocumentoListResponse>(this.basePath, {
        params: {
          ...filters,
          page,
          limit
        }
      });

      const hasMore = (response.page * response.limit) < response.total;

      return {
        ...response,
        hasMore
      };
    } catch (error) {
      console.error('Error al obtener documentos:', error);
      throw error;
    }
  }

  /**
   * Obtener un documento por ID
   */
  async getDocumentoById(id: string): Promise<IDocumento> {
    try {
      const response = await axiosClient.get<IDocumento>(`${this.basePath}/${id}`);
      return response;
    } catch (error) {
      console.error('Error al obtener documento:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo documento (borrador)
   */
  async crearDocumento(data: IDocumentoCreateRequest): Promise<IDocumentoCreateResponse> {
    try {
      // Convertir archivos a Base64
      const anexosBase64 = data.anexos 
        ? await Promise.all(data.anexos.map(async (file) => ({
            nombre: file.name,
            tamano: file.size,
            tipo: file.type,
            datos: await this.fileToBase64(file)
          })))
        : [];

      const pdfPrincipalBase64 = data.pdfPrincipal
        ? {
            nombre: data.pdfPrincipal.name,
            tamano: data.pdfPrincipal.size,
            tipo: data.pdfPrincipal.type,
            datos: await this.fileToBase64(data.pdfPrincipal)
          }
        : null;

      // Preparar payload para el backend
      const payload = {
        tipo: data.tipo,
        categoria: data.categoria,
        asunto: data.asunto,
        referencia: data.referencia,
        contenido: data.contenido || '', // HTML del editor o vacío
        destinatarios: data.destinatarios, // Array de emails
        anexos: anexosBase64,
        pdfPrincipal: pdfPrincipalBase64,
        esDocumentoSubido: data.esDocumentoSubido,
        estado: 'elaboracion'
      };

      console.log('📤 Enviando documento al backend:', {
        tipo: payload.tipo,
        categoria: payload.categoria,
        asunto: payload.asunto,
        destinatarios: payload.destinatarios,
        esDocumentoSubido: payload.esDocumentoSubido,
        tieneAnexos: anexosBase64.length > 0,
        tienePdfPrincipal: !!pdfPrincipalBase64
      });

      const response = await axiosClient.post<IDocumentoCreateResponse>(
        this.basePath,
        payload
      );

      return response;
    } catch (error) {
      console.error('Error al crear documento:', error);
      throw error;
    }
  }

  /**
   * Guardar borrador
   */
  async guardarBorrador(data: IDocumentoDraftRequest): Promise<IDocumento> {
    try {
      const anexosBase64 = data.anexos
        ? await Promise.all(data.anexos.map(async (file) => ({
            nombre: file.name,
            tamano: file.size,
            tipo: file.type,
            datos: await this.fileToBase64(file)
          })))
        : [];

      const pdfPrincipalBase64 = data.pdfPrincipal
        ? {
            nombre: data.pdfPrincipal.name,
            tamano: data.pdfPrincipal.size,
            tipo: data.pdfPrincipal.type,
            datos: await this.fileToBase64(data.pdfPrincipal)
          }
        : null;

      const payload = {
        ...data,
        anexos: anexosBase64,
        pdfPrincipal: pdfPrincipalBase64,
        estado: 'elaboracion'
      };

      console.log('💾 Guardando borrador:', {
        asunto: payload.asunto,
        destinatarios: payload.destinatarios
      });

      const response = await axiosClient.post<IDocumento>(
        `${this.basePath}/draft`,
        payload
      );

      return response;
    } catch (error) {
      console.error('Error al guardar borrador:', error);
      throw error;
    }
  }

  /**
   * Enviar documento (firmar y enviar)
   */
  async enviarDocumento(data: IDocumentoEnviarRequest): Promise<IDocumento> {
    try {
      console.log('📤 Enviando documento:', {
        documentoId: data.documentoId,
        destinatarios: data.destinatarios,
        tieneFirma: !!data.firmaQR
      });

      const response = await axiosClient.put<IDocumento>(
        `${this.basePath}/${data.documentoId}/enviar`,
        {
          firmaQR: data.firmaQR,
          destinatarios: data.destinatarios,
          fechaEnvio: new Date().toISOString()
        }
      );

      return response;
    } catch (error) {
      console.error('Error al enviar documento:', error);
      throw error;
    }
  }

  /**
   * Eliminar documento
   */
  async eliminarDocumento(id: string): Promise<void> {
    try {
      await axiosClient.delete(`${this.basePath}/${id}`);
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      throw error;
    }
  }

  /**
   * Descargar documento como PDF
   * - Normal: Descarga directa del servidor
   * - Cifrado: Descarga cifrado con permisos de lectura/escritura, requiere clave del usuario
   */
  async descargarPDF(id: string, clavePDF?: string): Promise<Blob> {
    try {
      const config: any = {
        responseType: 'blob'
      };

      // Si se proporciona clave (para documentos cifrados), enviarla en headers
      if (clavePDF) {
        config.headers = {
          'X-PDF-Key': clavePDF
        };
      }

      const response = await axiosClient.get(`${this.basePath}/${id}/descargar`, config);
      return response as unknown as Blob;
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      throw error;
    }
  }

  /**
   * Responder a un documento (solo Oficios)
   */
  async responderDocumento(
    documentoOriginalId: string,
    respuesta: IDocumentoCreateRequest
  ): Promise<IDocumentoCreateResponse> {
    try {
      // Crear documento de respuesta
      const documento = await this.crearDocumento(respuesta);
      
      // Vincular con documento original
      await axiosClient.post(`${this.basePath}/${documentoOriginalId}/responder`, {
        documentoRespuestaId: documento.documento.id
      });

      return documento;
    } catch (error) {
      console.error('Error al responder documento:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
const documentoService = DocumentoService.getInstance();
export default documentoService;
