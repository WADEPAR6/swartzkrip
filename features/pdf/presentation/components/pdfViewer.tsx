"use client";

import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCw } from "lucide-react";

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string;
  fileName?: string;
}

/**
 * Visor de PDF interno (sin modal externo)
 * Muestra el PDF directamente en la página con controles de navegación
 */
export default function PdfViewer({ pdfUrl, fileName = "documento.pdf" }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return Math.min(Math.max(1, newPage), numPages);
    });
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Toolbar */}
      <div className="bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Navegación de páginas */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-500">
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                Página {pageNumber} de {numPages || "..."}
              </span>
            </div>

            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= numPages}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Controles de zoom y rotación */}
          <div className="flex items-center gap-2">
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title="Alejar"
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-3">
              {Math.round(scale * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title="Acercar"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-slate-300 dark:bg-slate-500 mx-2"></div>

            <button
              onClick={rotate}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
              title="Rotar"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              onClick={downloadPdf}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Descargar PDF"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Descargar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visor de PDF */}
      <div className="overflow-auto bg-slate-50 dark:bg-slate-900 p-6" style={{ maxHeight: "calc(100vh - 300px)" }}>
        <div className="flex justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }
            error={
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <p className="text-red-800 dark:text-red-300 font-medium">
                  Error al cargar el PDF
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  Verifique que el archivo existe y es un PDF válido
                </p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-lg"
            />
          </Document>
        </div>
      </div>

      {/* Footer con información */}
      <div className="bg-slate-100 dark:bg-slate-700 border-t border-slate-300 dark:border-slate-600 px-4 py-3">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <span className="font-medium">{fileName}</span>
          {numPages > 0 && <span className="ml-3">• {numPages} página{numPages > 1 ? "s" : ""}</span>}
        </p>
      </div>
    </div>
  );
}
