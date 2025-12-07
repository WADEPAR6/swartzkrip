import { RequestStatus, ErrorType, SortBy, SortOrder } from '../enums/pdf.enums';

/**
 * Entidad PDF
 */
export interface IPdf {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date | string;
  uploadedBy?: string;
  tags?: string[];
  isActive: boolean;
}

/**
 * Respuesta de lista de PDFs
 */
export interface IPdfListResponse {
  data: IPdf[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Usuario/Destinatario
 */
export interface IUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * Request para crear PDF (con archivo en Base64)
 */
export interface IPdfCreateRequest {
  title: string;
  description?: string;
  fileBase64: string; // PDF convertido a Base64
  fileName: string;
  fileSize: number;
  tags?: string[];
  recipients?: string[]; // IDs de usuarios destinatarios (Para:)
  cc?: string[]; // IDs de usuarios en copia (CC:)
}

/**
 * Request para actualizar PDF
 */
export interface IPdfUpdateRequest {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  isActive?: boolean;
}

/**
 * Filtros para búsqueda de PDFs
 */
export interface IPdfFilters {
  search?: string;
  tags?: string[];
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

/**
 * Estado del store
 */
export interface IPdfState {
  pdfs: IPdf[];
  selectedPdf: IPdf | null;
  filters: IPdfFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  status: RequestStatus;
  error: IPdfError | null;
}

/**
 * Error personalizado
 */
export interface IPdfError {
  type: ErrorType;
  message: string;
  details?: any;
}