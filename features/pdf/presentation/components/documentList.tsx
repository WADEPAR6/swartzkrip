"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { 
  FileText, 
  Send, 
  Inbox, 
  Archive, 
  XCircle,
  Edit,
  Eye,
  Trash2,
  Download,
  Reply,
  Lock,
  LockOpen
} from "lucide-react";
// Import dinámico para PdfViewerModal (usa react-pdf que no funciona en SSR)
const PdfViewerModal = dynamic(() => import("./PdfViewerModal"), { ssr: false });

type DocumentStatus = "elaboracion" | "enviados" | "recibidos" | "no_enviados" | "enviar";

interface Document {
  id: string;
  tipo: "Oficio" | "Memorando";
  categoria: "Normal" | "Cifrado";
  asunto: string;
  referencia: string;
  destinatarios: string[];
  remitente?: string;
  fecha: string;
  estado: DocumentStatus;
  puedeResponder: boolean;
}

// Documentos de ejemplo
const mockDocuments: Document[] = [
  {
    id: "1",
    tipo: "Oficio",
    categoria: "Normal",
    asunto: "Reunión de Trabajo Revisión del Indicador N07 del criterio 1 del Modelo de Acreditación de Carrera CACES 2025",
    referencia: "2025-03-07-111:23:12",
    destinatarios: ["Luis Alberto Morales Parrazo (UTA)"],
    fecha: "2025-03-07",
    estado: "enviados",
    puedeResponder: true
  },
  {
    id: "2",
    tipo: "Memorando",
    categoria: "Cifrado",
    asunto: "SUSPENSIÓN DEL PROCESO DE AUTOEVALUACIÓN DEL DESEMPEÑO DEL PERSONAL ACADÉMICO Y APOYO ACADÉMICO DE LA UTA",
    referencia: "UTR-FSEI-2025-0034-",
    destinatarios: ["Franklin Mayorga (UTA)"],
    fecha: "2025-03-05",
    estado: "recibidos",
    puedeResponder: false,
    remitente: "Oscar Fernando Ibarra Torres"
  },
  {
    id: "3",
    tipo: "Oficio",
    categoria: "Normal",
    asunto: "Resolución 0326-0-CD-FSEI-UTA-2025 APROBAR LA MODALIDAD DE TITULACIÓN: ARTÍCULO ACADÉMICO PRESENTADA POR LOS SEÑORES ÁNGEL ISRAEL PILAMONTA QUISQUITUNA Y MARLON ALEXIS CODENA ALLUCA",
    referencia: "UTR-FSEI-2025-1390-6",
    destinatarios: ["Franklin Mayorga (UTA)"],
    fecha: "2024-12-03",
    estado: "elaboracion",
    puedeResponder: true
  },
  {
    id: "4",
    tipo: "Oficio",
    categoria: "Normal",
    asunto: "Solicitud de reunión urgente",
    referencia: "2025-03-01-09:45:31",
    destinatarios: ["María García", "Juan Pérez"],
    fecha: "2025-03-01",
    estado: "no_enviados",
    puedeResponder: true
  }
];

export default function DocumentList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<DocumentStatus>("elaboracion");
  const [documents] = useState<Document[]>(mockDocuments);
  
  // Estado para el modal del visor PDF
  const [viewerModal, setViewerModal] = useState<{
    isOpen: boolean;
    pdfUrl: string;
    fileName: string;
    title: string;
  }>({
    isOpen: false,
    pdfUrl: "",
    fileName: "",
    title: ""
  });

  const tabs = [
    { id: "elaboracion", label: "En Elaboración", icon: Edit, count: documents.filter(d => d.estado === "elaboracion").length },
    { id: "enviados", label: "Enviados", icon: Send, count: documents.filter(d => d.estado === "enviados").length },
    { id: "recibidos", label: "Recibidos", icon: Inbox, count: documents.filter(d => d.estado === "recibidos").length },
    { id: "no_enviados", label: "No Enviados", icon: XCircle, count: documents.filter(d => d.estado === "no_enviados").length },
    { id: "enviar", label: "Enviar Documento", icon: FileText, count: 0, action: true }
  ];

  const filteredDocuments = documents.filter(doc => doc.estado === activeTab);

  const handleTabClick = (tabId: string) => {
    if (tabId === "enviar") {
      router.push("/addpdf");
    } else {
      setActiveTab(tabId as DocumentStatus);
    }
  };

  const handleViewDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      // TODO: Obtener URL real del PDF desde el backend
      // Por ahora usamos una URL de ejemplo
      setViewerModal({
        isOpen: true,
        pdfUrl: "/sample.pdf", // Reemplazar con la URL real del documento
        fileName: `${doc.tipo}_${doc.referencia}.pdf`,
        title: doc.asunto
      });
    }
  };

  const handleEditDocument = (docId: string) => {
    console.log("Editar documento:", docId);
    router.push(`/addpdf?id=${docId}`);
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm("¿Está seguro de eliminar este documento?")) {
      console.log("Eliminar documento:", docId);
      // TODO: Llamar API para eliminar
    }
  };

  const handleDownloadDocument = (docId: string) => {
    console.log("Descargar documento:", docId);
    // TODO: Generar y descargar PDF
  };

  const handleReplyDocument = (docId: string) => {
    console.log("Responder documento:", docId);
    router.push(`/addpdf?reply=${docId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Sistema de Gestión Documental
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Universidad Técnica de Ambato - Carrera de Software
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isAction = tab.action;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors
                    ${isActive && !isAction
                      ? "border-blue-600 text-blue-600 dark:text-blue-400" 
                      : isAction
                      ? "border-transparent text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count > 0 && !isAction && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Document List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          {/* Table Header */}
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <div className="col-span-1">Tipo</div>
              <div className="col-span-1">Ref.</div>
              <div className="col-span-1">Categoría</div>
              <div className="col-span-4">Asunto</div>
              <div className="col-span-2">{activeTab === "recibidos" ? "Remitente" : "Destinatario(s)"}</div>
              <div className="col-span-1">Fecha</div>
              <div className="col-span-2 text-center">Acciones</div>
            </div>
          </div>

          {/* Document Rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredDocuments.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Archive className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">
                  No hay documentos en esta categoría
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  Los documentos aparecerán aquí cuando se creen
                </p>
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div 
                  key={doc.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors items-center"
                >
                  {/* Tipo */}
                  <div className="col-span-1">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded
                      ${doc.tipo === "Oficio" 
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300" 
                        : "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                      }
                    `}>
                      {doc.tipo === "Oficio" ? "" : ""} {doc.tipo}
                    </span>
                  </div>

                  {/* Referencia */}
                  <div className="col-span-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                      {doc.referencia.substring(0, 10)}...
                    </span>
                  </div>

                  {/* Categoría */}
                  <div className="col-span-1">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded
                      ${doc.categoria === "Normal" 
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" 
                        : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                      }
                    `}>
                      {doc.categoria === "Normal" ? <LockOpen className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {doc.categoria}
                    </span>
                  </div>

                  {/* Asunto */}
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                      {doc.asunto}
                    </p>
                  </div>

                  {/* Destinatarios/Remitente */}
                  <div className="col-span-2">
                    {activeTab === "recibidos" ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {doc.remitente}
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {doc.destinatarios.slice(0, 2).map((dest, idx) => (
                          <p key={idx} className="text-xs text-slate-600 dark:text-slate-400">
                            {dest}
                          </p>
                        ))}
                        {doc.destinatarios.length > 2 && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            +{doc.destinatarios.length - 2} más
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="col-span-1">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(doc.fecha).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  {/* Acciones */}
                  <div className="col-span-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleViewDocument(doc.id)}
                      className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>

                    {(activeTab === "elaboracion" || (activeTab === "no_enviados")) && doc.categoria === "Normal" && (
                      <button
                        onClick={() => handleEditDocument(doc.id)}
                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDownloadDocument(doc.id)}
                      className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                      title="Descargar PDF"
                    >
                      <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </button>

                    {activeTab === "recibidos" && doc.puedeResponder && (
                      <button
                        onClick={() => handleReplyDocument(doc.id)}
                        className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        title="Responder"
                      >
                        <Reply className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </button>
                    )}

                    {(activeTab === "elaboracion" || activeTab === "no_enviados") && (
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            Mostrando <strong>{filteredDocuments.length}</strong> documento(s) en{" "}
            <strong>{tabs.find(t => t.id === activeTab)?.label}</strong>
          </p>
        </div>
      </div>

      {/* Modal Visor de PDF */}
      <PdfViewerModal
        isOpen={viewerModal.isOpen}
        onClose={() => setViewerModal({ ...viewerModal, isOpen: false })}
        pdfUrl={viewerModal.pdfUrl}
        fileName={viewerModal.fileName}
        title={viewerModal.title}
        onDownload={() => {
          // Extraer el ID del documento actual si es necesario
          const doc = documents.find(d => d.asunto === viewerModal.title);
          if (doc) handleDownloadDocument(doc.id);
        }}
      />
    </div>
  );
}
