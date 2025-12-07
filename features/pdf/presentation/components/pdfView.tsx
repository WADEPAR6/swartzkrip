"use client";

import { IPdf } from "../../data/interfaces/pdf.interface";
import { FileText, Download, Trash2, Calendar, HardDrive } from "lucide-react";

interface PdfViewProps {
  pdfs: IPdf[];
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage?: string;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function PdfView({
  pdfs,
  isLoading,
  isError,
  isEmpty,
  errorMessage,
  onDownload,
  onDelete
}: PdfViewProps) {
  // Estado de carga
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Cargando PDFs...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (isError) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-900 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Error en la Conexión</h3>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            {errorMessage || "No se pudieron cargar los documentos. Por favor, intenta nuevamente."}
          </p>
        </div>
      </div>
    );
  }

  // Estado vacío
  if (isEmpty) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No hay documentos</h3>
          <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
            Aún no has subido ningún documento PDF. Comienza subiendo tu primer archivo.
          </p>
        </div>
      </div>
    );
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Formatear fecha
  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Lista de PDFs
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Documento</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Fecha</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">Tamaño</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {pdfs.map((pdf) => (
              <tr key={pdf.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{pdf.title}</p>
                      {pdf.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{pdf.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(pdf.uploadedAt)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <HardDrive className="w-4 h-4" />
                    {formatFileSize(pdf.fileSize)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {onDownload && (
                      <button
                        onClick={() => onDownload(pdf.id)}
                        className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                        title="Descargar"
                      >
                        <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(pdf.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}