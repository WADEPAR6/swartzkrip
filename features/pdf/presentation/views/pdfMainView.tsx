"use client";

import { useEffect } from "react";
import { usePdf } from "../../hooks/usePdf";
import PdfFilter from "../components/pdfFilter";
import PdfPaginator from "../components/pdfPaginator";
import PdfView from "../components/pdfView";
import { FileText } from "lucide-react";

export default function PdfMainView() {
  const {
    pdfs,
    pagination,
    isLoading,
    isError,
    isEmpty,
    error,
    loadPdfs,
    searchPdfs,
    deletePdf,
  } = usePdf();

  // Cargar PDFs al montar el componente
  useEffect(() => {
    loadPdfs(1, 10);
  }, []);

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      await searchPdfs(query);
    } else {
      await loadPdfs(1, 10);
    }
  };

  const handlePageChange = async (page: number) => {
    await loadPdfs(page, pagination.limit);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este PDF?")) {
      await deletePdf(id);
    }
  };

  const handleDownload = async (id: string) => {
    // TODO: Implementar descarga
    console.log("Descargar PDF:", id);
  };

  // Calcular total de páginas
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Gestión de PDFs
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Administra y organiza tus documentos PDF de forma segura
              </p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <PdfFilter onSearch={handleSearch} isLoading={isLoading} />

        {/* Lista de PDFs */}
        <PdfView
          pdfs={pdfs}
          isLoading={isLoading}
          isError={isError}
          isEmpty={isEmpty}
          errorMessage={error?.message}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />

        {/* Paginación */}
        {!isLoading && !isError && !isEmpty && (
          <PdfPaginator
            currentPage={pagination.page}
            totalPages={totalPages}
            hasMore={pagination.hasMore}
            onPageChange={handlePageChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
