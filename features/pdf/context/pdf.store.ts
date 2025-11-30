import { IPdf, IPdfState, IPdfFilters, IPdfError, IPdfCreateRequest, IPdfUpdateRequest } from '../data/interfaces/pdf.interface';
import { RequestStatus, ErrorType } from '../data/enums/pdf.enums';
import pdfService from '../service/pdf.service';

/**
 * Store para gestión de PDFs (Guard + Estado)
 * Maneja el estado global, validaciones y llamadas al servicio
 */
class PdfStore {
  private static instance: PdfStore;
  private state: IPdfState;
  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.state = this.getInitialState();
  }

  public static getInstance(): PdfStore {
    if (!PdfStore.instance) {
      PdfStore.instance = new PdfStore();
    }
    return PdfStore.instance;
  }

  private getInitialState(): IPdfState {
    return {
      pdfs: [],
      selectedPdf: null,
      filters: {},
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
   * Obtener el estado actual
   */
  public getState(): IPdfState {
    return { ...this.state };
  }

  /**
   * Actualizar el estado
   */
  private setState(updates: Partial<IPdfState>): void {
    this.state = { ...this.state, ...updates };
    this.notify();
  }

  /**
   * Establecer error
   */
  private setError(type: ErrorType, message: string, details?: any): void {
    const error: IPdfError = { type, message, details };
    this.setState({ status: RequestStatus.ERROR, error });
  }

  /**
   * Limpiar error
   */
  public clearError(): void {
    this.setState({ error: null });
  }

  /**
   * Validar archivo PDF
   */
  private validatePdfFile(file: File): boolean {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      this.setError(ErrorType.VALIDATION, 'El archivo debe ser un PDF');
      return false;
    }

    if (file.size > maxSize) {
      this.setError(ErrorType.VALIDATION, 'El archivo no debe superar 10MB');
      return false;
    }

    return true;
  }

  /**
   * Convertir archivo a Base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Eliminar el prefijo "data:application/pdf;base64,"
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Obtener lista de PDFs
   */
  public async fetchPdfs(page: number = 1, limit: number = 10): Promise<void> {
    try {
      this.setState({ status: RequestStatus.LOADING, error: null });

      const response = await pdfService.getPdfs(page, limit);

      this.setState({
        pdfs: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        },
        status: RequestStatus.SUCCESS,
      });
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al cargar los PDFs',
        error.message
      );
    }
  }

  /**
   * Crear nuevo PDF
   */
  public async createPdf(
    file: File, 
    title: string, 
    description?: string, 
    recipients?: string[],
    cc?: string[],
    tags?: string[]
  ): Promise<boolean> {
    try {
      // Validar archivo
      if (!this.validatePdfFile(file)) {
        return false;
      }

      // Validar que haya al menos un destinatario
      if (!recipients || recipients.length === 0) {
        this.setError(ErrorType.VALIDATION, 'Debe especificar al menos un destinatario');
        return false;
      }

      this.setState({ status: RequestStatus.LOADING, error: null });

      // Convertir a Base64
      const fileBase64 = await this.fileToBase64(file);

      const request: IPdfCreateRequest = {
        title,
        description,
        fileBase64,
        fileName: file.name,
        fileSize: file.size,
        recipients,
        cc,
        tags,
      };

      const newPdf = await pdfService.createPdf(request);

      // Agregar al inicio de la lista
      this.setState({
        pdfs: [newPdf, ...this.state.pdfs],
        status: RequestStatus.SUCCESS,
      });

      return true;
    } catch (error: any) {
      this.setError(
        ErrorType.SERVER,
        'Error al crear el PDF',
        error.message
      );
      return false;
    }
  }

  /**
   * Actualizar PDF
   */
  public async updatePdf(data: IPdfUpdateRequest): Promise<boolean> {
    try {
      this.setState({ status: RequestStatus.LOADING, error: null });

      const updatedPdf = await pdfService.updatePdf(data);

      // Actualizar en la lista
      const pdfs = this.state.pdfs.map(pdf =>
        pdf.id === updatedPdf.id ? updatedPdf : pdf
      );

      this.setState({
        pdfs,
        status: RequestStatus.SUCCESS,
      });

      return true;
    } catch (error: any) {
      this.setError(
        ErrorType.SERVER,
        'Error al actualizar el PDF',
        error.message
      );
      return false;
    }
  }

  /**
   * Eliminar PDF
   */
  public async deletePdf(id: string): Promise<boolean> {
    try {
      this.setState({ status: RequestStatus.LOADING, error: null });

      await pdfService.deletePdf(id);

      // Eliminar de la lista
      const pdfs = this.state.pdfs.filter(pdf => pdf.id !== id);

      this.setState({
        pdfs,
        status: RequestStatus.SUCCESS,
      });

      return true;
    } catch (error: any) {
      this.setError(
        ErrorType.SERVER,
        'Error al eliminar el PDF',
        error.message
      );
      return false;
    }
  }

  /**
   * Buscar PDFs
   */
  public async searchPdfs(query: string): Promise<void> {
    try {
      this.setState({ status: RequestStatus.LOADING, error: null });

      const response = await pdfService.searchPdfs(query, 1, 10);

      this.setState({
        pdfs: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          hasMore: response.hasMore,
        },
        status: RequestStatus.SUCCESS,
      });
    } catch (error: any) {
      this.setError(
        ErrorType.NETWORK,
        'Error al buscar PDFs',
        error.message
      );
    }
  }

  /**
   * Resetear el estado
   */
  public reset(): void {
    this.state = this.getInitialState();
    this.notify();
  }
}

export const pdfStore = PdfStore.getInstance();
export default pdfStore;