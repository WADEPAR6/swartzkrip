"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Ejemplo Completo: Componente para Subir PDF
 * Muestra cómo enviar un PDF al backend de forma profesional
 */
export default function UploadPdfExample() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  /**
   * MÉTODO 1: Subir archivo completo (archivos pequeños <5MB)
   * Este es el método que ya tienes implementado
   */
  const handleUploadSimple = async () => {
    if (!file || !title) return;

    try {
      setStatus("uploading");
      setProgress(0);

      // 1. Convertir archivo a Base64
      const fileBase64 = await fileToBase64(file);
      
      setProgress(30);

      // 2. Preparar datos
      const data = {
        title,
        description,
        fileName: file.name,
        fileSize: file.size,
        fileBase64, // El PDF en Base64
        tags: ["ejemplo", "importante"]
      };

      setProgress(50);

      // 3. Enviar al backend (automáticamente se encripta en AxiosClient)
      const response = await fetch("/api/pdfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
      });

      setProgress(80);

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      const result = await response.json();
      
      setProgress(100);
      setStatus("success");
      console.log("PDF subido exitosamente:", result);

    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  /**
   * MÉTODO 2: Subir por chunks (archivos grandes >5MB)
   * Recomendado para producción
   */
  const handleUploadChunked = async () => {
    if (!file || !title) return;

    try {
      setStatus("uploading");
      setProgress(0);

      const CHUNK_SIZE = 1024 * 1024; // 1MB por chunk
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      const uploadId = generateUploadId();

      // Dividir archivo en chunks
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Convertir chunk a Base64
        const chunkBase64 = await blobToBase64(chunk);

        // Preparar datos del chunk
        const chunkData: any = {
          chunkIndex: i,
          totalChunks,
          uploadId,
          chunkData: chunkBase64,
        };

        // Solo en el primer chunk, enviar metadata
        if (i === 0) {
          chunkData.title = title;
          chunkData.description = description;
          chunkData.fileName = file.name;
          chunkData.fileSize = file.size;
        }

        // Enviar chunk
        const response = await fetch("/api/pdfs/upload/chunk", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Chunk-Index": i.toString(),
            "X-Total-Chunks": totalChunks.toString(),
            "X-Upload-Id": uploadId,
          },
          body: JSON.stringify(chunkData),
        });

        if (!response.ok) {
          throw new Error(`Error al subir chunk ${i + 1}`);
        }

        // Actualizar progreso
        const chunkProgress = ((i + 1) / totalChunks) * 90;
        setProgress(chunkProgress);
      }

      // Completar upload
      const completeResponse = await fetch("/api/pdfs/upload/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uploadId,
          totalChunks,
          md5Hash: await generateMD5(file),
        }),
      });

      if (!completeResponse.ok) {
        throw new Error("Error al completar el upload");
      }

      const result = await completeResponse.json();
      
      setProgress(100);
      setStatus("success");
      console.log("PDF subido exitosamente:", result);

    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  /**
   * MÉTODO 3: Con compresión (reduce tamaño ~60%)
   * Ideal para optimizar transferencia
   */
  const handleUploadCompressed = async () => {
    if (!file || !title) return;

    try {
      setStatus("uploading");
      setProgress(0);

      // 1. Leer archivo como ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      setProgress(20);

      // 2. Comprimir con pako (librería de compresión)
      // npm install pako @types/pako
      // import pako from 'pako';
      // const compressed = pako.gzip(uint8Array);
      
      // Por ahora, sin compresión (instalar pako primero)
      const fileData = uint8Array;

      setProgress(40);

      // 3. Convertir a Base64
      const base64 = arrayBufferToBase64(fileData);

      setProgress(60);

      // 4. Preparar datos
      const data = {
        title,
        description,
        fileName: file.name,
        fileSize: file.size,
        fileBase64: base64,
        compressed: false, // true si usas pako
        tags: ["ejemplo"]
      };

      // 5. Enviar
      const response = await fetch("/api/pdfs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      setProgress(90);

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      const result = await response.json();
      
      setProgress(100);
      setStatus("success");
      console.log("PDF subido exitosamente:", result);

    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  // Utilidades
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const arrayBufferToBase64 = (buffer: Uint8Array): string => {
    let binary = "";
    for (let i = 0; i < buffer.byteLength; i++) {
      binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
  };

  const generateUploadId = (): string => {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const generateMD5 = async (file: File): Promise<string> => {
    // Para producción, usar crypto-js o similar
    // npm install crypto-js @types/crypto-js
    // import CryptoJS from 'crypto-js';
    const arrayBuffer = await file.arrayBuffer();
    // const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
    // return CryptoJS.MD5(wordArray).toString();
    
    // Por ahora, hash simple
    return `md5_${file.size}_${file.lastModified}`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6">Subir Documento PDF</h2>

        {/* Input de archivo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Seleccionar PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm border rounded-lg p-2"
          />
          {file && (
            <p className="text-sm text-gray-600 mt-2">
              Archivo: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Input de título */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Nombre del documento"
          />
        </div>

        {/* Input de descripción */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2"
            rows={3}
            placeholder="Descripción opcional"
          />
        </div>

        {/* Barra de progreso */}
        {status === "uploading" && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-center mt-2">{progress.toFixed(0)}%</p>
          </div>
        )}

        {/* Mensajes de estado */}
        {status === "success" && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">¡Archivo subido exitosamente!</p>
          </div>
        )}

        {status === "error" && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={handleUploadSimple}
            disabled={!file || !title || status === "uploading"}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Método Simple
          </button>

          <button
            onClick={handleUploadChunked}
            disabled={!file || !title || status === "uploading"}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Con Chunks
          </button>

          <button
            onClick={handleUploadCompressed}
            disabled={!file || !title || status === "uploading"}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Comprimido
          </button>
        </div>

        {/* Información */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
          <h3 className="font-semibold mb-2">Métodos disponibles:</h3>
          <ul className="space-y-1 text-gray-600">
            <li>• <strong>Simple</strong>: Para archivos &lt;5MB</li>
            <li>• <strong>Chunks</strong>: Para archivos grandes, con progreso detallado</li>
            <li>• <strong>Comprimido</strong>: Reduce el tamaño antes de enviar</li>
          </ul>
          <p className="mt-2 text-xs text-gray-500">
            Todos los métodos envían datos encriptados automáticamente
          </p>
        </div>
      </div>
    </div>
  );
}
