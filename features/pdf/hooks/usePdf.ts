"use client";

import { useEffect, useState, useCallback } from 'react';
import { pdfStore } from '../context/pdf.store';
import { IPdfState, IPdfUpdateRequest } from '../data/interfaces/pdf.interface';

/**
 * Hook personalizado para gestión de PDFs
 * Conecta la presentación con el store
 */
export function usePdf() {
  const [state, setState] = useState<IPdfState>(pdfStore.getState());

  useEffect(() => {
    // Suscribirse a cambios del store
    const unsubscribe = pdfStore.subscribe(() => {
      setState(pdfStore.getState());
    });

    return unsubscribe;
  }, []);

  /**
   * Cargar lista de PDFs
   */
  const loadPdfs = useCallback(async (page: number = 1, limit: number = 10) => {
    await pdfStore.fetchPdfs(page, limit);
  }, []);

  /**
   * Crear nuevo PDF
   */
  const createPdf = useCallback(async (
    file: File,
    title: string,
    description?: string,
    recipients?: string[],
    cc?: string[],
    tags?: string[]
  ): Promise<boolean> => {
    return await pdfStore.createPdf(file, title, description, recipients, cc, tags);
  }, []);

  /**
   * Actualizar PDF
   */
  const updatePdf = useCallback(async (data: IPdfUpdateRequest): Promise<boolean> => {
    return await pdfStore.updatePdf(data);
  }, []);

  /**
   * Eliminar PDF
   */
  const deletePdf = useCallback(async (id: string): Promise<boolean> => {
    return await pdfStore.deletePdf(id);
  }, []);

  /**
   * Buscar PDFs
   */
  const searchPdfs = useCallback(async (query: string) => {
    await pdfStore.searchPdfs(query);
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    pdfStore.clearError();
  }, []);

  /**
   * Resetear estado
   */
  const reset = useCallback(() => {
    pdfStore.reset();
  }, []);

  return {
    // Estado
    pdfs: state.pdfs,
    selectedPdf: state.selectedPdf,
    filters: state.filters,
    pagination: state.pagination,
    status: state.status,
    error: state.error,

    // Estado derivado
    isLoading: state.status === 'loading',
    isError: state.status === 'error',
    isSuccess: state.status === 'success',
    isEmpty: state.pdfs.length === 0,

    // Acciones
    loadPdfs,
    createPdf,
    updatePdf,
    deletePdf,
    searchPdfs,
    clearError,
    reset,
  };
}