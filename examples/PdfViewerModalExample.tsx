"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";
import PdfViewerModal from "../features/pdf/presentation/components/PdfViewerModal";
import { usePdf } from "../features/pdf/hooks/usePdf";
import { IPdf } from "../features/pdf/data/interfaces/pdf.interface";

/**
 * Ejemplo de uso del PdfViewerModal con el hook usePdf
 * Muestra cómo integrar el visor modal en cualquier componente
 */
export default function PdfViewerExample() {
  const { pdfs, loading, getPdfById, downloadPdf } = usePdf();
  const [selectedPdf, setSelectedPdf] = useState<{
    isOpen: boolean;
    pdfUrl: string;
    fileName: string;
    title: string;
    pdfId: string;
  }>({
    isOpen: false,
    pdfUrl: "",
    fileName: "",
    title: "",
    pdfId: ""
  });

  const handleViewPdf = async (pdfId: string) => {
    try {
      const pdf = await getPdfById(pdfId);
      
      setSelectedPdf({
        isOpen: true,
        pdfUrl: pdf.fileUrl, // URL del PDF desde el backend
        fileName: pdf.fileName,
        title: pdf.title,
        pdfId: pdf.id
      });
    } catch (error) {
      console.error("Error al cargar el PDF:", error);
      alert("No se pudo cargar el PDF");
    }
  };

  const handleDownloadPdf = async () => {
    if (selectedPdf.pdfId) {
      try {
        await downloadPdf(selectedPdf.pdfId);
      } catch (error) {
        console.error("Error al descargar el PDF:", error);
        alert("No se pudo descargar el PDF");
      }
    }
  };

  const closeModal = () => {
    setSelectedPdf({
      isOpen: false,
      pdfUrl: "",
      fileName: "",
      title: "",
      pdfId: ""
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Ejemplo: Visor Modal de PDFs
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Haz clic en el ícono del ojo para visualizar un documento en el modal
          </p>
        </div>

        {/* Lista de PDFs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Documentos Disponibles
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : pdfs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  No hay documentos disponibles
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pdfs.map((pdf: IPdf) => (
                  <div
                    key={pdf.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 dark:text-white truncate">
                        {pdf.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {pdf.fileName} • {(pdf.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {pdf.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-500 mt-1 truncate">
                          {pdf.description}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewPdf(pdf.id)}
                      className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      title="Ver documento"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="font-medium">Ver PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
            💡 Características del Visor Modal
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
            <li>✅ Navegación entre páginas con botones o flechas del teclado (← →)</li>
            <li>✅ Zoom con botones o teclas + / -</li>
            <li>✅ Rotación de 90° del documento</li>
            <li>✅ Modo pantalla completa</li>
            <li>✅ Descarga directa del PDF</li>
            <li>✅ Cierre con tecla ESC o botón X</li>
            <li>✅ Entrada directa del número de página</li>
            <li>✅ Responsive y con soporte dark mode</li>
          </ul>
        </div>

        {/* Código de ejemplo */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6 overflow-x-auto">
          <h3 className="font-semibold text-white mb-3">📝 Código de Ejemplo</h3>
          <pre className="text-sm text-slate-300">
            <code>{`import PdfViewerModal from "./PdfViewerModal";

const [viewerModal, setViewerModal] = useState({
  isOpen: false,
  pdfUrl: "",
  fileName: "",
  title: ""
});

// Abrir el modal
const handleViewPdf = (pdf) => {
  setViewerModal({
    isOpen: true,
    pdfUrl: pdf.fileUrl,
    fileName: pdf.fileName,
    title: pdf.title
  });
};

// En el JSX
<PdfViewerModal
  isOpen={viewerModal.isOpen}
  onClose={() => setViewerModal({ ...viewerModal, isOpen: false })}
  pdfUrl={viewerModal.pdfUrl}
  fileName={viewerModal.fileName}
  title={viewerModal.title}
  onDownload={() => downloadPdf(pdfId)}
/>`}</code>
          </pre>
        </div>
      </div>

      {/* Modal Visor */}
      <PdfViewerModal
        isOpen={selectedPdf.isOpen}
        onClose={closeModal}
        pdfUrl={selectedPdf.pdfUrl}
        fileName={selectedPdf.fileName}
        title={selectedPdf.title}
        onDownload={handleDownloadPdf}
      />
    </div>
  );
}
