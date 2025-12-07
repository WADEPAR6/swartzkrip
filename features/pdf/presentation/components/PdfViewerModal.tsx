"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  Download, 
  RotateCw,
  Maximize2,
  Minimize2
} from "lucide-react";

// Configurar worker de PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  fileName?: string;
  title?: string;
  onDownload?: () => void;
}

/**
 * Modal visor de PDF con controles completos
 * Permite visualizar PDFs en un modal con navegación, zoom, rotación y descarga
 */
export default function PdfViewerModal({ 
  isOpen, 
  onClose, 
  pdfUrl, 
  fileName = "documento.pdf",
  title = "Visualizar PDF",
  onDownload
}: PdfViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Resetear estado al abrir/cerrar modal
  useEffect(() => {
    if (isOpen) {
      setPageNumber(1);
      setScale(1.2);
      setRotation(0);
      setIsFullscreen(false);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

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

  const goToPage = (page: number) => {
    setPageNumber(Math.min(Math.max(1, page), numPages));
  };

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation(prev => (prev + 90) % 360);
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      link.click();
    }
  };

  // Navegación con teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') changePage(-1);
      if (e.key === 'ArrowRight') changePage(1);
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, numPages, pageNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div 
        className={`relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col transition-all ${
          isFullscreen 
            ? 'w-screen h-screen rounded-none' 
            : 'w-[95vw] h-[95vh] max-w-7xl'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex items-center justify-between rounded-t-xl shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{title}</h2>
            <p className="text-sm text-blue-100 truncate mt-1">{fileName}</p>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
              title="Cerrar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 dark:bg-slate-700 border-b border-slate-300 dark:border-slate-600 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Navegación de páginas */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => changePage(-1)}
                disabled={pageNumber <= 1}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página anterior (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
                  className="w-16 px-3 py-2 text-center text-sm font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  de {numPages || "..."}
                </span>
              </div>

              <button
                onClick={() => changePage(1)}
                disabled={pageNumber >= numPages}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Página siguiente (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Controles de zoom y rotación */}
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                title="Alejar (-)"
              >
                <ZoomOut className="w-5 h-5" />
              </button>

              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-3 min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>

              <button
                onClick={zoomIn}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                title="Acercar (+)"
              >
                <ZoomIn className="w-5 h-5" />
              </button>

              <div className="w-px h-6 bg-slate-300 dark:bg-slate-500 mx-2"></div>

              <button
                onClick={rotate}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                title="Rotar 90°"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button
                onClick={handleDownload}
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
        <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-6">
          <div className="flex justify-center min-h-full">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Cargando PDF...</p>
                </div>
              }
              error={
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 max-w-md">
                  <p className="text-red-800 dark:text-red-300 font-bold text-lg mb-2">
                    ❌ Error al cargar el PDF
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Verifique que el archivo existe y es un PDF válido.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-2xl"
              />
            </Document>
          </div>
        </div>

        {/* Footer con información y atajos */}
        <div className="bg-slate-100 dark:bg-slate-700 border-t border-slate-300 dark:border-slate-600 px-6 py-3 shrink-0">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                📄 {numPages} página{numPages !== 1 ? "s" : ""}
              </span>
              <span>•</span>
              <span>Usa ← → para navegar</span>
              <span>•</span>
              <span>+ / - para zoom</span>
              <span>•</span>
              <span>ESC para cerrar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
