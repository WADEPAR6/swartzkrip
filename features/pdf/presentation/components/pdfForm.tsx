"use client";

import { useState, useRef, FormEvent } from "react";
import { IUser } from "../../data/interfaces/pdf.interface";
import UserSelector from "./userSelector";
import { Upload, FileText, Send, AlertCircle, CheckCircle, X } from "lucide-react";

interface PdfFormProps {
  availableUsers: IUser[];
  onSubmit: (data: PdfFormData) => Promise<boolean>;
}

export interface PdfFormData {
  file: File;
  title: string;
  description: string;
  recipients: IUser[];
  cc: IUser[];
  tags: string[];
}

/**
 * Formulario para subir PDF estilo Quipux
 * Incluye selección de destinatarios, CC, archivo y metadatos
 */
export default function PdfForm({ availableUsers, onSubmit }: PdfFormProps) {
  // Estados del formulario
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recipients, setRecipients] = useState<IUser[]>([]);
  const [cc, setCc] = useState<IUser[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validaciones
  const isValidForm = file && title.trim() && recipients.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validar tipo
    if (selectedFile.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF");
      return;
    }

    // Validar tamaño (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError("El archivo no debe superar 10MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Si no hay título, usar el nombre del archivo
    if (!title) {
      setTitle(selectedFile.name.replace(".pdf", ""));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isValidForm || !file) return;

    setIsSubmitting(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const formData: PdfFormData = {
        file,
        title: title.trim(),
        description: description.trim(),
        recipients,
        cc,
        tags
      };

      const result = await onSubmit(formData);

      clearInterval(progressInterval);
      setProgress(100);

      if (result) {
        setSuccess(true);
        // Limpiar formulario
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        setError("Error al enviar el documento");
      }

    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDescription("");
    setRecipients([]);
    setCc([]);
    setTags([]);
    setTagInput("");
    setProgress(0);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Destinatarios (Para:) */}
      <div>
        <UserSelector
          label="Para: *"
          placeholder="Buscar destinatarios..."
          selectedUsers={recipients}
          onUsersChange={setRecipients}
          availableUsers={availableUsers}
        />
        {recipients.length === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Selecciona al menos un destinatario
          </p>
        )}
      </div>

      {/* CC (Copia) */}
      <div>
        <UserSelector
          label="CC: (Opcional)"
          placeholder="Buscar usuarios para copia..."
          selectedUsers={cc}
          onUsersChange={setCc}
          availableUsers={availableUsers}
        />
      </div>

      {/* Asunto/Título */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Asunto: *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del documento"
          required
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Mensaje:
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción o comentarios sobre el documento..."
          rows={4}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white resize-none"
        />
      </div>

      {/* Adjuntar Documento */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Documento: *
        </label>
        
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 bg-slate-50 dark:bg-slate-800/50">
          {!file ? (
            <div className="text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                Arrastra un archivo PDF o haz clic para seleccionar
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Seleccionar Archivo
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Máximo 10MB • Solo archivos PDF
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors group"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
              </button>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Etiquetas */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Etiquetas:
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
            placeholder="Agregar etiqueta..."
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Agregar
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:bg-slate-300 dark:hover:bg-slate-600 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Barra de progreso */}
      {isSubmitting && (
        <div className="space-y-2">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-center text-slate-600 dark:text-slate-400">
            Enviando documento... {progress}%
          </p>
        </div>
      )}

      {/* Mensajes de estado */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-300 text-sm">
            ¡Documento enviado exitosamente!
          </p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={!isValidForm || isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? "Enviando..." : "Enviar Documento"}
        </button>

        <button
          type="button"
          onClick={resetForm}
          disabled={isSubmitting}
          className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
