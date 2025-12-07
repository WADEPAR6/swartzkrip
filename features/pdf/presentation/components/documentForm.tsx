"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Select from "react-select";
import DocumentEditor from "./documentEditor";
// Import dinámico para PdfViewer (usa react-pdf que no funciona en SSR)
const PdfViewer = dynamic(() => import("./pdfViewer"), { ssr: false });
import { useDocumento } from "../../hooks/useDocumento";
import { IDocumentoCreateRequest } from "../../data/interfaces/documento.interface";
import { 
  FileText, 
  Upload, 
  Send, 
  Save, 
  QrCode,
  UserPlus,
  X,
  AlertCircle,
  FilePlus,
  Edit3
} from "lucide-react";
import QRCode from "qrcode";

interface Recipient {
  value: string;
  label: string;
  email: string;
}

interface DocumentFormData {
  tipo: "Oficio" | "Memorando";
  categoria: "Normal" | "Cifrado";
  asunto: string;
  referencia: string;
  destinatarios: Recipient[];
  contenido: string;
  documentoPrincipal?: File; // Documento principal (PDF subido O contenido del editor)
  esDocumentoSubido: boolean; // Si es PDF subido o creado con editor
}

const tipoDocumentoOptions = [
  { value: "Oficio", label: "Oficio (Se puede responder)" },
  { value: "Memorando", label: "Memorando (No se puede responder)" }
];

const categoriaOptions = [
  { 
    value: "Normal", 
    label: "Normal (Editable, almacenado con clave)",
    description: "Se almacena en servidor con clave, se puede editar"
  },
  { 
    value: "Cifrado", 
    label: "Cifrado (Solo lectura, descarga local)",
    description: "Se descarga como PDF cifrado con permisos de solo lectura"
  }
];

// Usuarios de ejemplo - en producción cargar desde API
const usuariosDisponibles: Recipient[] = [
  { value: "1", label: "Oscar Fernando Ibarra Torres", email: "oscar.ibarra@uta.edu.ec" },
  { value: "2", label: "Franklin Mayorga", email: "franklin.mayorga@uta.edu.ec" },
  { value: "3", label: "Luis Alberto Morales", email: "luis.morales@uta.edu.ec" },
  { value: "4", label: "María García", email: "maria.garcia@uta.edu.ec" },
  { value: "5", label: "Juan Pérez", email: "juan.perez@uta.edu.ec" },
];

export default function DocumentForm() {
  const router = useRouter();
  const { crearDocumento, guardarBorrador, enviarDocumento, isLoading, error, clearError } = useDocumento();
  
  const [formData, setFormData] = useState<DocumentFormData>({
    tipo: "Oficio",
    categoria: "Normal",
    asunto: "",
    referencia: "",
    destinatarios: [],
    contenido: "",
    documentoPrincipal: undefined,
    esDocumentoSubido: false
  });

  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string>("");
  const [documentoId, setDocumentoId] = useState<string>("");

  // Generar firma electrónica QR
  const generarFirmaQR = async () => {
    const dataFirma = {
      documento: formData.asunto,
      fecha: new Date().toISOString(),
      autor: "Usuario Actual", // Obtener del session
      hash: Math.random().toString(36).substring(2) // En producción: hash real del documento
    };

    const qrData = JSON.stringify(dataFirma);
    const qrUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff"
      }
    });

    setQrCodeUrl(qrUrl);
    return qrUrl;
  };
  // Guardar borrador
  const handleSaveDraft = async () => {
    clearError();

    // Convertir destinatarios a array de emails
    const emailsDestinatarios = formData.destinatarios.map(dest => dest.email);

    const success = await guardarBorrador({
      tipo: formData.tipo,
      categoria: formData.categoria,
      asunto: formData.asunto,
      referencia: formData.referencia,
      contenido: formData.contenido,
      destinatarios: emailsDestinatarios,
      anexos: formData.documentoPrincipal ? [formData.documentoPrincipal] : undefined,
      pdfPrincipal: formData.esDocumentoSubido ? formData.documentoPrincipal : undefined,
      esDocumentoSubido: formData.esDocumentoSubido
    });

    if (success) {
      alert("Borrador guardado exitosamente");
    }
  };

  // Enviar documento
  const handleSendDocument = async () => {
    clearError();

    // Convertir destinatarios a array de emails
    const emailsDestinatarios = formData.destinatarios.map(dest => dest.email);

    try {
      // 1. Generar firma QR
      const qrCode = await generarFirmaQR();

      // 2. Crear el documento
      const documentoCreado = await crearDocumento({
        tipo: formData.tipo,
        categoria: formData.categoria,
        asunto: formData.asunto,
        referencia: formData.referencia,
        contenido: formData.contenido,
        destinatarios: emailsDestinatarios,
        anexos: formData.documentoPrincipal ? [formData.documentoPrincipal] : undefined,
        pdfPrincipal: formData.esDocumentoSubido ? formData.documentoPrincipal : undefined,
        esDocumentoSubido: formData.esDocumentoSubido
      });

      if (!documentoCreado) {
        return;
      }

      // 3. Enviar el documento (con firma)
      const enviado = await enviarDocumento({
        documentoId: documentoId || "temp-id",
        firmaQR: qrCode,
        destinatarios: emailsDestinatarios
      });

      if (enviado) {
        alert(`Documento enviado exitosamente a ${emailsDestinatarios.length} destinatario(s)`);
        router.push("/pdf");
      }
    } catch (error) {
      console.error("Error al enviar documento:", error);
    }
  };

  // Adjuntar PDFs
  // Subir PDF principal (en lugar de usar el editor)
  const handleMainPdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfPreviewUrl(url);
      setFormData(prev => ({
        ...prev,
        esDocumentoSubido: true,
        documentoPrincipal: file,
        contenido: "" // Limpiar contenido del editor
      }));
    }
  };

  // Cambiar a modo editor (eliminar PDF subido)
  const switchToEditor = () => {
    setPdfPreviewUrl("");
    setFormData(prev => ({
      ...prev,
      esDocumentoSubido: false,
      documentoPrincipal: undefined
    }));
  };
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-700 p-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            Crear Nuevo Documento
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Complete la información del documento oficial
          </p>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  {error.message}
                </p>
              </div>
              <button
                onClick={clearError}
                className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded"
              >
                <X className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          )}

          {/* Información del Documento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Documento */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <Select
                options={tipoDocumentoOptions}
                value={tipoDocumentoOptions.find(opt => opt.value === formData.tipo)}
                onChange={(option) => setFormData(prev => ({ ...prev, tipo: option?.value as any }))}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Seleccione el tipo..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {formData.tipo === "Oficio" 
                  ? "Este documento se puede responder" 
                  : "Este documento NO se puede responder"}
              </p>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <Select
                options={categoriaOptions}
                value={categoriaOptions.find(opt => opt.value === formData.categoria)}
                onChange={(option) => setFormData(prev => ({ ...prev, categoria: option?.value as any }))}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Seleccione la categoría..."
              />
              <p className="text-xs text-slate-500 mt-1">
                {categoriaOptions.find(opt => opt.value === formData.categoria)?.description}
              </p>
            </div>

            {/* Número de Referencia */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                No. Referencia
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData(prev => ({ ...prev, referencia: e.target.value }))}
                placeholder="Ej: 0144-M"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Asunto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.asunto}
                onChange={(e) => setFormData(prev => ({ ...prev, asunto: e.target.value }))}
                placeholder="Ej: Solicitud de Acreditación"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>

          {/* Destinatarios */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Destinatarios <span className="text-red-500">*</span>
              <span className="ml-2 text-xs font-normal text-slate-500">
                (Puede seleccionar múltiples destinatarios)
              </span>
            </label>
            <Select
              isMulti
              options={usuariosDisponibles}
              value={formData.destinatarios}
              onChange={(selected) => setFormData(prev => ({ ...prev, destinatarios: selected as Recipient[] }))}
              className="react-select-container"
              classNamePrefix="react-select"
              placeholder="Seleccione destinatarios..."
              noOptionsMessage={() => "No hay más destinatarios disponibles"}
            />
            
            {/* Lista de destinatarios seleccionados */}
            {formData.destinatarios.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.destinatarios.map((dest, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg px-3 py-1"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-900 dark:text-blue-300">{dest.label}</span>
                    <span className="text-xs text-blue-600 dark:text-blue-400">({dest.email})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor de Contenido */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Cuerpo del Documento <span className="text-red-500">*</span>
              </label>
              
              {/* Toggle: Editor vs PDF Subido */}
              <div className="flex items-center gap-3">
                {!formData.esDocumentoSubido ? (
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                      <FilePlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Subir PDF existente
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleMainPdfUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <button
                    onClick={switchToEditor}
                    className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Usar editor de texto
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Mostrar Editor o Visor de PDF */}
            {formData.esDocumentoSubido && pdfPreviewUrl ? (
              <div>
                <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    📄 <strong>Modo PDF:</strong> Está usando un documento PDF subido. 
                    El contenido no se puede editar en el editor de texto.
                  </p>
                </div>
                <PdfViewer 
                  pdfUrl={pdfPreviewUrl} 
                  fileName={formData.documentoPrincipal?.name || "documento.pdf"} 
                />
              </div>
            ) : (
              <div>
                <DocumentEditor
                  content={formData.contenido}
                  onChange={(html) => setFormData(prev => ({ ...prev, contenido: html }))}
                />
              </div>
            )}
          </div>

          {/* Firma QR Preview */}
          {qrCodeUrl && (
            <div className="border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <QrCode className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">Firma Electrónica Generada</h3>
              </div>
              <img src={qrCodeUrl} alt="QR Firma" className="w-32 h-32 border border-blue-300 rounded" />
            </div>
          )}

          {/* Advertencias */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-semibold mb-1">Importante:</p>
              <ul className="list-disc ml-4 space-y-1">
                <li>El documento se firmará electrónicamente antes de enviarse (QR)</li>
                <li>Los documentos cifrados se descargarán como PDF con permisos de solo lectura</li>
                <li>Los documentos normales se pueden editar posteriormente</li>
                <li>Un mismo documento puede enviarse a múltiples destinatarios</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-6 bg-slate-50 dark:bg-slate-700/50 flex justify-between">
          <button
            onClick={() => router.push("/pdf")}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Borrador
                </>
              )}
            </button>

            <button
              onClick={handleSendDocument}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Documento
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}