"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PdfForm, { PdfFormData } from "../components/pdfForm";
import { usePdf } from "../../hooks/usePdf";
import { IUser } from "../../data/interfaces/pdf.interface";
import { ArrowLeft, Loader2 } from "lucide-react";

/**
 * Vista principal para agregar un nuevo PDF
 * Orquesta el formulario y maneja la lógica de envío
 */
export default function PdfSaveView() {
  const router = useRouter();
  const { createPdf, error, isLoading } = usePdf();
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Cargar usuarios disponibles
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        // TODO: En producción, obtener usuarios desde el backend
        // const response = await userService.getUsers();
        // setAvailableUsers(response.data);
        
        // Datos de ejemplo para desarrollo
        const mockUsers: IUser[] = [
          { id: "1", name: "Juan Pérez", email: "juan.perez@empresa.com", avatar: undefined },
          { id: "2", name: "María García", email: "maria.garcia@empresa.com", avatar: undefined },
          { id: "3", name: "Carlos López", email: "carlos.lopez@empresa.com", avatar: undefined },
          { id: "4", name: "Ana Martínez", email: "ana.martinez@empresa.com", avatar: undefined },
          { id: "5", name: "Luis Rodríguez", email: "luis.rodriguez@empresa.com", avatar: undefined },
          { id: "6", name: "Laura Sánchez", email: "laura.sanchez@empresa.com", avatar: undefined },
          { id: "7", name: "Diego Torres", email: "diego.torres@empresa.com", avatar: undefined },
          { id: "8", name: "Sofía Ramírez", email: "sofia.ramirez@empresa.com", avatar: undefined },
        ];
        
        setAvailableUsers(mockUsers);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSubmit = async (data: PdfFormData): Promise<boolean> => {
    try {
      // Preparar los datos para enviar
      const recipientEmails = data.recipients.map(u => u.email);
      const ccEmails = data.cc.map(u => u.email);

      // Llamar al store para crear el PDF
      await createPdf(
        data.file,
        data.title,
        data.description,
        recipientEmails,
        ccEmails,
        data.tags
      );

      // Si no hay error, redirigir a la lista
      if (!error) {
        setTimeout(() => {
          router.push("/pdf");
        }, 2000);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error al enviar PDF:", error);
      return false;
    }
  };

  const handleGoBack = () => {
    router.push("/pdf");
  };

  if (isLoadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="text-slate-600 dark:text-slate-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la lista
          </button>
          
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Nuevo Documento
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Completa el formulario para enviar un nuevo documento PDF a los destinatarios seleccionados.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <PdfForm
            availableUsers={availableUsers}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">
            ℹ️ Información
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• El documento será encriptado antes de ser enviado</li>
            <li>• Los destinatarios en "Para:" tendrán acceso completo al documento</li>
            <li>• Los usuarios en "CC:" recibirán una copia para su conocimiento</li>
            <li>• Tamaño máximo de archivo: 10MB</li>
            <li>• Solo se aceptan archivos en formato PDF</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
