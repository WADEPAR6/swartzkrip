import {
  IDocumento,
  IDocumentoState,
  IDocumentoFilters,
  IDocumentoError,
  IDocumentoCreateRequest,
  IDocumentoDraftRequest,
  IDocumentoEnviarRequest
} from '../data/interfaces/documento.interface';
import { RequestStatus, ErrorType } from '../data/enums/pdf.enums';
import documentoService from '../service/documento.service';

/**
 * Store para gestión de Documentos Oficiales
 * Maneja el estado global, validaciones y llamadas al servicio
 */
class DocumentoStore {
  private static instance: DocumentoStore;
  private state: IDocumentoState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = this.getInitialState();
  }

  public static getInstance(): DocumentoStore {
    if (!DocumentoStore.instance) {
      DocumentoStore.instance = new DocumentoStore();
    }
    return DocumentoStore.instance;
  }

  private getInitialState(): IDocumentoState {
    return {
      documentos: [],
      documentoSeleccionado: null,
      filtros: {},
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: false,
      },
      status: RequestStatus.IDLE,
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
    this.listeners.forEach(listener => listener());
  }

  /**
   * Obtener estado actual
   */
  public getState(): IDocumentoState {
    return this.state;
  }

  /**
   * Actualizar estado
   */
  private setState(newState: Partial<IDocumentoState>): void {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  /**
   * Establecer error
   */
  private setError(type: ErrorType, message: string, details?: any): void {
    const error: IDocumentoError = { type, message, details };
    this.setState({ error, status: RequestStatus.ERROR });
  }

  /**
   * Limpiar error
   */
  public clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Validar datos de documento
   */
  private validarDocumento(data: IDocumentoCreateRequest | IDocumentoDraftRequest): boolean {
    if (!data.asunto || data.asunto.trim().length === 0) {
      this.setError(ErrorType.VALIDATION, 'El asunto es requerido');
      return false;
    }

    if (!data.destinatarios || data.destinatarios.length === 0) {
      this.setError(ErrorType.VALIDATION, 'Debe seleccionar al menos un destinatario');
      return false;
    }

    // Validar que tenga contenido (editor o PDF subido)
    const tieneContenido = data.esDocumentoSubido
      ? !!data.pdfPrincipal
      : data.contenido && data.contenido.trim().length > 0;

    if (!tieneContenido) {
      this.setError(
        ErrorType.VALIDATION,
        'Debe proporcionar contenido (editor de texto o PDF subido)'
      );
      return false;
    }

    // Validar emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailsInvalidos = data.destinatarios.filter(email => !emailRegex.test(email));
    
    if (emailsInvalidos.length > 0) {
      this.setError(
        ErrorType.VALIDATION,
        `Emails inválidos: ${emailsInvalidos.join(', ')}`
      );
      return false;
    }

    return true;
  }

  /**
   * Obtener documentos con filtros
   */
  public async fetchDocumentos(
    filters?: IDocumentoFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<void> {
    this.setState({ status: RequestStatus.LOADING });

    try {
      const response = await documentoService.getDocumentos(filters, page, limit);

      this.setState({
        documentos: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        },
        filtros: filters || {},
        status: RequestStatus.SUCCESS,
        error: null,
      });
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al cargar documentos',
        error
      );
    }
  }

  /**
   * Crear documento (borrador inicial)
   */
  public async crearDocumento(data: IDocumentoCreateRequest): Promise<boolean> {
    if (!this.validarDocumento(data)) {
      return false;
    }

    this.setState({ status: RequestStatus.LOADING });

    try {
      const response = await documentoService.crearDocumento(data);

      console.log('✅ Documento creado:', response);

      // Agregar a la lista local
      this.setState({
        documentos: [response.documento, ...this.state.documentos],
        documentoSeleccionado: response.documento,
        status: RequestStatus.SUCCESS,
        error: null,
      });

      return true;
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al crear documento',
        error
      );
      return false;
    }
  }

  /**
   * Guardar borrador
   */
  public async guardarBorrador(data: IDocumentoDraftRequest): Promise<boolean> {
    if (!this.validarDocumento(data)) {
      return false;
    }

    this.setState({ status: RequestStatus.LOADING });

    try {
      const documento = await documentoService.guardarBorrador(data);

      console.log('💾 Borrador guardado:', documento);

      // Actualizar en la lista local
      const index = this.state.documentos.findIndex(d => d.id === documento.id);
      if (index !== -1) {
        const nuevosDocumentos = [...this.state.documentos];
        nuevosDocumentos[index] = documento;
        this.setState({ documentos: nuevosDocumentos });
      } else {
        this.setState({ documentos: [documento, ...this.state.documentos] });
      }

      this.setState({ status: RequestStatus.SUCCESS, error: null });
      return true;
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al guardar borrador',
        error
      );
      return false;
    }
  }

  /**
   * Enviar documento (firmar y enviar)
   */
  public async enviarDocumento(data: IDocumentoEnviarRequest): Promise<boolean> {
    this.setState({ status: RequestStatus.LOADING });

    try {
      const documento = await documentoService.enviarDocumento(data);

      console.log('📤 Documento enviado:', documento);

      // Actualizar en la lista local
      const index = this.state.documentos.findIndex(d => d.id === documento.id);
      if (index !== -1) {
        const nuevosDocumentos = [...this.state.documentos];
        nuevosDocumentos[index] = documento;
        this.setState({ documentos: nuevosDocumentos });
      }

      this.setState({ status: RequestStatus.SUCCESS, error: null });
      return true;
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al enviar documento',
        error
      );
      return false;
    }
  }

  /**
   * Eliminar documento
   */
  public async eliminarDocumento(id: string): Promise<boolean> {
    this.setState({ status: RequestStatus.LOADING });

    try {
      await documentoService.eliminarDocumento(id);

      // Eliminar de la lista local
      const nuevosDocumentos = this.state.documentos.filter(d => d.id !== id);
      this.setState({
        documentos: nuevosDocumentos,
        documentoSeleccionado: null,
        status: RequestStatus.SUCCESS,
        error: null,
      });

      return true;
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al eliminar documento',
        error
      );
      return false;
    }
  }

  /**
   * Seleccionar documento
   */
  public async seleccionarDocumento(id: string): Promise<void> {
    this.setState({ status: RequestStatus.LOADING });

    try {
      const documento = await documentoService.getDocumentoById(id);
      this.setState({
        documentoSeleccionado: documento,
        status: RequestStatus.SUCCESS,
        error: null,
      });
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al cargar documento',
        error
      );
    }
  }

  /**
   * Limpiar documento seleccionado
   */
  public limpiarSeleccion(): void {
    this.setState({ documentoSeleccionado: null });
  }

  /**
   * Aplicar filtros
   */
  public aplicarFiltros(filters: IDocumentoFilters): void {
    this.fetchDocumentos(filters, 1, this.state.pagination.limit);
  }

  /**
   * Resetear store
   */
  public reset(): void {
    this.setState(this.getInitialState());
  }
}

// Exportar instancia singleton
export const documentoStore = DocumentoStore.getInstance();
export default documentoStore;
