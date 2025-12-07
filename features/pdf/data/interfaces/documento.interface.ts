import { RequestStatus, ErrorType } from '../enums/pdf.enums';

/**
 * Interfaces para el Sistema de Gestión Documental
 * Universidad Técnica de Ambato - Carrera de Software
 */

/**
 * Destinatario de un documento
 */
export interface IDestinatario {
  id: string;
  nombre: string;
  email: string;
  cargo?: string;
}

/**
 * Documento Oficial (Oficio o Memorando)
 */
export interface IDocumento {
  id: string;
  tipo: "Oficio" | "Memorando";
  categoria: "Normal" | "Cifrado";
  asunto: string;
  referencia: string;
  contenido: string; // HTML del editor o vacio si es PDF subido
  destinatarios: IDestinatario[]; // Múltiples destinatarios
  remitente?: IDestinatario; // Para documentos recibidos
  anexos: IAnexo[]; // PDFs adjuntos
  pdfPrincipal?: IAnexo; // PDF principal si fue subido
  firmaQR?: string; // Base64 del QR de firma electrónica
  estado: "elaboracion" | "enviados" | "recibidos" | "no_enviados";
  fechaCreacion: Date | string;
  fechaEnvio?: Date | string;
  esDocumentoSubido: boolean; // Si es PDF subido o creado con editor
  puedeResponder: boolean; // Calculado: tipo === "Oficio"
  isActive: boolean;
}

/**
 * Anexo (PDF adjunto)
 */
export interface IAnexo {
  id?: string;
  nombre: string;
  urlArchivo?: string;
  tamano: number;
  tipo: string; // mime type
  fechaSubida?: Date | string;
}

/**
 * Request para CREAR un documento
 */
export interface IDocumentoCreateRequest {
  tipo: "Oficio" | "Memorando";
  categoria: "Normal" | "Cifrado";
  asunto: string;
  referencia: string;
  contenido?: string; // HTML del editor (solo si NO es PDF subido)
  destinatarios: string[]; // Array de EMAILS
  anexos?: File[]; // Archivos adjuntos
  pdfPrincipal?: File; // PDF principal si fue subido
  esDocumentoSubido: boolean;
}

/**
 * Response del backend al crear documento
 */
export interface IDocumentoCreateResponse {
  success: boolean;
  mensaje: string;
  documento: IDocumento;
  firmaQR: string; // Base64 del QR generado en backend
}

/**
 * Request para ENVIAR un documento (con firma)
 */
export interface IDocumentoEnviarRequest {
  documentoId: string;
  firmaQR: string; // QR generado en frontend
  destinatarios: string[]; // Emails
}

/**
 * Request para GUARDAR BORRADOR
 */
export interface IDocumentoDraftRequest {
  tipo: "Oficio" | "Memorando";
  categoria: "Normal" | "Cifrado";
  asunto: string;
  referencia: string;
  contenido: string;
  destinatarios: string[];
  anexos?: File[];
  pdfPrincipal?: File;
  esDocumentoSubido: boolean;
}

/**
 * Filtros para búsqueda de documentos
 */
export interface IDocumentoFilters {
  tipo?: "Oficio" | "Memorando";
  categoria?: "Normal" | "Cifrado";
  estado?: "elaboracion" | "enviados" | "recibidos" | "no_enviados";
  busqueda?: string; // Búsqueda por asunto o referencia
  fechaDesde?: Date;
  fechaHasta?: Date;
}

/**
 * Respuesta de lista de documentos
 */
export interface IDocumentoListResponse {
  data: IDocumento[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Estado del store de documentos
 */
export interface IDocumentoState {
  documentos: IDocumento[];
  documentoSeleccionado: IDocumento | null;
  filtros: IDocumentoFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  status: RequestStatus;
  error: IDocumentoError | null;
}

/**
 * Error personalizado
 */
export interface IDocumentoError {
  type: ErrorType;
  message: string;
  details?: any;
}
