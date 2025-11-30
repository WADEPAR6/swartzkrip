/**
 * Estados posibles de una petición
 */
export enum RequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Tipos de errores
 */
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  UNAUTHORIZED = 'unauthorized',
  NOT_FOUND = 'not_found',
  UNKNOWN = 'unknown',
}

/**
 * Tipos de filtros para PDFs
 */
export enum PdfFilterType {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BY_DATE = 'by_date',
  BY_TAG = 'by_tag',
}

/**
 * Orden de clasificación
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Campos por los que se puede ordenar
 */
export enum SortBy {
  TITLE = 'title',
  DATE = 'uploadedAt',
  SIZE = 'fileSize',
}
