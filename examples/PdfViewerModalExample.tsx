"use client";

import { useState } from "react";
import { Eye, FileText } from "lucide-react";
import PdfViewerModal from "@/features/pdf/presentation/components/PdfViewerModal";
import PdfPasswordDialog from "@/features/pdf/presentation/components/PdfPasswordDialog";
import { IPdf } from "@/features/pdf/data/interfaces/pdf.interface";

// Datos mock para demostrar funcionalidad
const mockPdfs: IPdf[] = [
  {
    id: "pdf-001",
    title: "Manual de Usuario - Normal",
    description: "Guía completa del sistema (Sin cifrado)",
    fileName: "manual_usuario.pdf",
    fileUrl: "/sample.pdf",
    fileSize: 2048576,
    mimeType: "application/pdf",
    categoria: "Normal",
    uploadedAt: "2025-12-07T10:30:00Z",
    uploadedBy: "user-123",
    tags: ["manual", "documentación"],
    isActive: true
  },
  {
    id: "pdf-002",
    title: "Informe Confidencial - Cifrado",
    description: "Documento protegido con contraseña",
    fileName: "informe_confidencial.pdf",
    fileUrl: "/sample.pdf",
    fileSize: 1536000,
    mimeType: "application/pdf",
    categoria: "Cifrado",
    uploadedAt: "2025-12-06T14:20:00Z",
    uploadedBy: "user-456",
    tags: ["confidencial", "informe"],
    isActive: true
  },
  {
    id: "pdf-003",
    title: "Reporte Mensual - Normal",
    description: "Estadísticas del mes",
    fileName: "reporte_mensual.pdf",
    fileUrl: "/sample.pdf",
    fileSize: 987654,
    mimeType: "application/pdf",
    categoria: "Normal",
    uploadedAt: "2025-12-05T09:15:00Z",
    uploadedBy: "user-789",
    tags: ["reporte", "mensual"],
    isActive: true
  }
];

/**
 * Ejemplo de uso del PdfViewerModal con el hook usePdf
 * Incluye manejo de PDFs cifrados con diálogo de contraseña
 */
export default function PdfViewerExample() {
  const [pdfs] = useState<IPdf[]>(mockPdfs);
  const [loading] = useState(false);
  
  const [selectedPdf, setSelectedPdf] = useState<{
    isOpen: boolean;
    pdfUrl: string;
    fileName: string;
    title: string;
    pdfId: string;
    categoria?: "Normal" | "Cifrado";
  }>({
    isOpen: false,
    pdfUrl: "",
    fileName: "",
    title: "",
    pdfId: "",
    categoria: "Normal"
  });

  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    pdfId: string;
    title: string;
    loading: boolean;
    error: string;
  }>({
    isOpen: false,
    pdfId: "",
    title: "",
    loading: false,
    error: ""
  });

  const handleViewPdf = (pdfId: string) => {
    const pdf = pdfs.find(p => p.id === pdfId);
    if (!pdf) return;

    // Si el PDF es cifrado, solicitar contraseña primero
    if (pdf.categoria === "Cifrado") {
      setPasswordDialog({
        isOpen: true,
        pdfId: pdf.id,
        title: pdf.title,
        loading: false,
        error: ""
      });
    } else {
      // PDF normal, abrir directamente
      setSelectedPdf({
        isOpen: true,
        pdfUrl: pdf.fileUrl,
        fileName: pdf.fileName,
        title: pdf.title,
        pdfId: pdf.id,
        categoria: pdf.categoria
      });
    }
  };

  const handlePasswordSubmit = (password: string) => {
    setPasswordDialog(prev => ({ ...prev, loading: true, error: "" }));

    // Simular validación de contraseña
    setTimeout(() => {
      // En producción, validar con el backend
      if (password === "demo123" || password.length > 0) {
        const pdf = pdfs.find(p => p.id === passwordDialog.pdfId);
        if (pdf) {
          setPasswordDialog({
            isOpen: false,
            pdfId: "",
            title: "",
            loading: false,
            error: ""
          });

          setSelectedPdf({
            isOpen: true,
            pdfUrl: pdf.fileUrl,
            fileName: pdf.fileName,
            title: pdf.title,
            pdfId: pdf.id,
            categoria: "Cifrado"
          });
        }
      } else {
        setPasswordDialog(prev => ({
          ...prev,
          loading: false,
          error: "Contraseña incorrecta. Intenta con 'demo123' o cualquier texto."
        }));
      }
    }, 1000);
  };

  const handleDownloadPdf = () => {
    if (selectedPdf.pdfId) {
      // En producción, usar el servicio real
      console.log("Descargando PDF:", selectedPdf.pdfId);
      alert(`PDF "${selectedPdf.fileName}" descargado (simulado)`);
    }
  };

  const closeModal = () => {
    setSelectedPdf({
      isOpen: false,
      pdfUrl: "",
      fileName: "",
      title: "",
      pdfId: "",
      categoria: "Normal"
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-slate-900 dark:text-white truncate">
                          {pdf.title}
                        </h3>
                        {pdf.categoria === "Cifrado" && (
                          <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs font-semibold rounded">
                            🔒 Cifrado
                          </span>
                        )}
                      </div>
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
            <li>✅ Soporte para PDFs cifrados con solicitud de contraseña</li>
            <li>✅ Responsive y con soporte dark mode</li>
          </ul>
        </div>

        {/* Código de ejemplo */}
        <div className="mt-6 bg-slate-800 rounded-lg p-6 overflow-x-auto">
          <h3 className="font-semibold text-white mb-3">📝 Código de Ejemplo</h3>
          <pre className="text-sm text-slate-300">
            <code>{`import PdfViewerModal from "./PdfViewerModal";
import PdfPasswordDialog from "./PdfPasswordDialog";

const [viewerModal, setViewerModal] = useState({
  isOpen: false,
  pdfUrl: "",
  fileName: "",
  title: "",
  categoria: "Normal"
});

const [passwordDialog, setPasswordDialog] = useState({
  isOpen: false,
  title: "",
  loading: false,
  error: ""
});

// Si el PDF es cifrado, solicitar contraseña
if (pdf.categoria === "Cifrado") {
  setPasswordDialog({
    isOpen: true,
    title: pdf.title,
    loading: false,
    error: ""
  });
}

// En el JSX
<PdfPasswordDialog
  isOpen={passwordDialog.isOpen}
  onClose={() => setPasswordDialog({ ...passwordDialog, isOpen: false })}
  onSubmit={(password) => handlePasswordSubmit(password)}
  loading={passwordDialog.loading}
  error={passwordDialog.error}
  documentTitle={passwordDialog.title}
/>

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

      {/* Diálogo de Contraseña para PDFs Cifrados */}
      <PdfPasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog({ isOpen: false, pdfId: "", title: "", loading: false, error: "" })}
        onSubmit={handlePasswordSubmit}
        loading={passwordDialog.loading}
        error={passwordDialog.error}
        documentTitle={passwordDialog.title}
      />

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
