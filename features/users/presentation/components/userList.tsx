"use client";

import { useEffect, useState } from "react";
import { useUser } from "../../hooks/useUser";
import { IUser, UserRole } from "../../data/interface/IUser";
import { formatCedula, getRoleDescription } from "../../data/validators/userValidators";
import {
  User,
  Mail,
  Building2,
  Shield,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Phone,
  MapPin,
  MoreVertical
} from "lucide-react";

interface UserListProps {
  onEdit?: (user: IUser) => void;
  onSelectDestinatario?: (user: IUser) => void;
  mode?: "manage" | "select"; // manage = gestión completa, select = selector de destinatarios
}

export default function UserList({ onEdit, onSelectDestinatario, mode = "manage" }: UserListProps) {
  const {
    users,
    isLoading,
    error,
    currentPage,
    totalPages,
    total,
    hasMore,
    filters,
    searchQuery,
    loadUsers,
    searchUsers,
    deleteUser,
    toggleUserStatus,
    applyFilters
  } = useUser();

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    if (mode === "select") {
      // Para selector de destinatarios, cargar solo activos y que puedan recibir
      applyFilters({ activo: true, esDestinatario: true });
    }
    loadUsers(1, 10);
  }, [mode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      searchUsers(search, 1, 10);
    } else {
      loadUsers(1, 10);
    }
  };

  const handleApplyFilters = () => {
    applyFilters(localFilters);
    loadUsers(1, 10);
    setShowFilters(false);
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`¿Está seguro de eliminar al usuario ${userName}?`)) {
      try {
        await deleteUser(userId);
        alert("Usuario eliminado exitosamente");
        loadUsers(currentPage, 10);
      } catch (err) {
        alert("Error al eliminar usuario");
      }
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    const action = currentStatus ? "desactivar" : "activar";
    if (confirm(`¿Está seguro de ${action} al usuario ${userName}?`)) {
      try {
        await toggleUserStatus(userId, !currentStatus);
        alert(`Usuario ${action}do exitosamente`);
        loadUsers(currentPage, 10);
      } catch (err) {
        alert(`Error al ${action} usuario`);
      }
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800 border-purple-200",
      secretaria: "bg-blue-100 text-blue-800 border-blue-200",
      docente: "bg-green-100 text-green-800 border-green-200",
      viewer: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[role] || colors.viewer;
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
        <p className="text-red-800 font-medium mb-2">Error al cargar usuarios</p>
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={() => loadUsers(1, 10)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header con búsqueda y filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, cédula o email..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>

          {mode === "manage" && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtros
            </button>
          )}
        </div>

        {/* Panel de filtros */}
        {showFilters && mode === "manage" && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">Filtrar por:</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Rol</label>
                <select
                  value={localFilters.role || ""}
                  onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value as UserRole || undefined })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Todos</option>
                  <option value="admin">Administrador</option>
                  <option value="secretaria">Secretaria</option>
                  <option value="docente">Docente</option>
                  <option value="viewer">Visualizador</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Estado</label>
                <select
                  value={localFilters.activo === undefined ? "" : localFilters.activo.toString()}
                  onChange={(e) => setLocalFilters({ ...localFilters, activo: e.target.value === "" ? undefined : e.target.value === "true" })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Destinatarios</label>
                <select
                  value={localFilters.esDestinatario === undefined ? "" : localFilters.esDestinatario.toString()}
                  onChange={(e) => setLocalFilters({ ...localFilters, esDestinatario: e.target.value === "" ? undefined : e.target.value === "true" })}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Todos</option>
                  <option value="true">Sí</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={() => {
                  setLocalFilters({});
                  applyFilters({});
                  loadUsers(1, 10);
                  setShowFilters(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Limpiar
              </button>
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="mt-4 text-sm text-gray-600">
          {searchQuery ? (
            <p>Resultados para "{searchQuery}": <span className="font-semibold">{total}</span> usuarios</p>
          ) : (
            <p>Total de usuarios: <span className="font-semibold">{total}</span></p>
          )}
        </div>
      </div>

      {/* Lista de usuarios */}
      <div className="divide-y divide-gray-200">
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No se encontraron usuarios</p>
            <p className="text-sm mt-2">Intenta con otros criterios de búsqueda</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => mode === "select" && onSelectDestinatario && onSelectDestinatario(user)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.nombreCompleto || `${user.nombre} ${user.apellido}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      <Shield className="w-3 h-3 inline mr-1" />
                      {getRoleDescription(user.role)}
                    </span>
                    {!user.activo && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Inactivo
                      </span>
                    )}
                    {user.esDestinatario && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        Destinatario
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span>{formatCedula(user.cedula)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span>{user.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{user.position}</span>
                    </div>
                    {user.metadata?.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{user.metadata.telefono}</span>
                      </div>
                    )}
                    {user.metadata?.oficina && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{user.metadata.oficina}</span>
                      </div>
                    )}
                  </div>
                </div>

                {mode === "manage" && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(user.id, user.activo, user.nombreCompleto || `${user.nombre} ${user.apellido}`);
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        user.activo
                          ? 'hover:bg-red-100 text-red-600'
                          : 'hover:bg-green-100 text-green-600'
                      }`}
                      title={user.activo ? "Desactivar" : "Activar"}
                    >
                      {user.activo ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                    </button>
                    {onEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(user);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(user.id, user.nombreCompleto || `${user.nombre} ${user.apellido}`);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadUsers(currentPage - 1, 10)}
              disabled={currentPage === 1 || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <button
              onClick={() => loadUsers(currentPage + 1, 10)}
              disabled={!hasMore || isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
