"use client";

import { useState } from "react";
import UserForm from "../components/userForm";
import UserList from "../components/userList";
import { IUser } from "../../data/interface/IUser";
import { Users, UserPlus, List } from "lucide-react";

export default function UserView() {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const handleCreateSuccess = () => {
    setView("list");
  };

  const handleEdit = (user: IUser) => {
    setSelectedUser(user);
    setView("edit");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-2">
                Administra usuarios del sistema - Cédula ecuatoriana y email institucional
              </p>
            </div>

            {view === "list" && (
              <button
                onClick={() => setView("create")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                Nuevo Usuario
              </button>
            )}

            {view !== "list" && (
              <button
                onClick={() => {
                  setView("list");
                  setSelectedUser(null);
                }}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <List className="w-5 h-5" />
                Ver Lista
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {view === "list" && (
          <UserList onEdit={handleEdit} mode="manage" />
        )}

        {view === "create" && (
          <UserForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setView("list")}
          />
        )}

        {view === "edit" && selectedUser && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Editar Usuario</h2>
            <p className="text-gray-600">Función de edición en desarrollo...</p>
            <p className="text-sm text-gray-500 mt-2">
              Usuario: {selectedUser.nombreCompleto || `${selectedUser.nombre} ${selectedUser.apellido}`}
            </p>
            <button
              onClick={() => setView("list")}
              className="mt-4 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Volver a la lista
            </button>
          </div>
        )}
      </div>
    </div>
  );
}