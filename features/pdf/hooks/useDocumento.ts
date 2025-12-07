"use client";

import { useEffect, useState, useCallback } from 'react';
import { documentoStore } from '../context/documento.store';
import {
  IDocumentoState,
  IDocumentoCreateRequest,
  IDocumentoDraftRequest,
  IDocumentoEnviarRequest,
  IDocumentoFilters
} from '../data/interfaces/documento.interface';

/**
 * Hook personalizado para gestión de Documentos Oficiales
 * Conecta la presentación con el store
 */
export function useDocumento() {
  const [state, setState] = useState<IDocumentoState>(documentoStore.getState());

  useEffect(() => {
    // Suscribirse a cambios del store
    const unsubscribe = documentoStore.subscribe(() => {
      setState(documentoStore.getState());
    });

    return unsubscribe;
  }, []);

  /**
   * Cargar lista de documentos
   */
  const cargarDocumentos = useCallback(async (
    filters?: IDocumentoFilters,
    page: number = 1,
    limit: number = 10
  ) => {
    await documentoStore.fetchDocumentos(filters, page, limit);
  }, []);

  /**
   * Crear nuevo documento
   */
  const crearDocumento = useCallback(async (
    data: IDocumentoCreateRequest
  ): Promise<boolean> => {
    return await documentoStore.crearDocumento(data);
  }, []);

  /**
   * Guardar borrador
   */
  const guardarBorrador = useCallback(async (
    data: IDocumentoDraftRequest
  ): Promise<boolean> => {
    return await documentoStore.guardarBorrador(data);
  }, []);

  /**
   * Enviar documento (firmar y enviar)
   */
  const enviarDocumento = useCallback(async (
    data: IDocumentoEnviarRequest
  ): Promise<boolean> => {
    return await documentoStore.enviarDocumento(data);
  }, []);

  /**
   * Eliminar documento
   */
  const eliminarDocumento = useCallback(async (id: string): Promise<boolean> => {
    return await documentoStore.eliminarDocumento(id);
  }, []);

  /**
   * Seleccionar documento
   */
  const seleccionarDocumento = useCallback(async (id: string) => {
    await documentoStore.seleccionarDocumento(id);
  }, []);

  /**
   * Limpiar selección
   */
  const limpiarSeleccion = useCallback(() => {
    documentoStore.limpiarSeleccion();
  }, []);

  /**
   * Aplicar filtros
   */
  const aplicarFiltros = useCallback((filters: IDocumentoFilters) => {
    documentoStore.aplicarFiltros(filters);
  }, []);

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    documentoStore.clearError();
  }, []);

  /**
   * Resetear store
   */
  const reset = useCallback(() => {
    documentoStore.reset();
  }, []);

  return {
    // Estado
    documentos: state.documentos,
    documentoSeleccionado: state.documentoSeleccionado,
    filtros: state.filtros,
    pagination: state.pagination,
    status: state.status,
    error: state.error,
    isLoading: state.status === 'loading',
    
    // Acciones
    cargarDocumentos,
    crearDocumento,
    guardarBorrador,
    enviarDocumento,
    eliminarDocumento,
    seleccionarDocumento,
    limpiarSeleccion,
    aplicarFiltros,
    clearError,
    reset,
  };
}
