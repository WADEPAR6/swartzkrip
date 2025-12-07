"use client";

import { useState, useRef, useEffect } from "react";
import { IUser } from "../../data/interfaces/pdf.interface";
import { X, Search, UserPlus } from "lucide-react";

interface UserSelectorProps {
  label: string;
  placeholder?: string;
  selectedUsers: IUser[];
  onUsersChange: (users: IUser[]) => void;
  availableUsers: IUser[];
}

/**
 * Componente para seleccionar usuarios (estilo Quipux)
 * Permite buscar y seleccionar múltiples usuarios para Para: y CC:
 */
export default function UserSelector({
  label,
  placeholder = "Buscar usuarios...",
  selectedUsers,
  onUsersChange,
  availableUsers
}: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar usuarios disponibles
  const filteredUsers = availableUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const notSelected = !selectedUsers.some(selected => selected.id === user.id);
    
    return matchesSearch && notSelected;
  });

  const handleSelectUser = (user: IUser) => {
    onUsersChange([...selectedUsers, user]);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleRemoveUser = (userId: string) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label}
      </label>

      {/* Usuarios seleccionados */}
      <div className="min-h-[44px] border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-white dark:bg-slate-800 flex flex-wrap gap-2 items-center">
        {selectedUsers.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
          >
            {user.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-5 h-5 rounded-full"
              />
            )}
            <span className="font-medium">{user.name}</span>
            <span className="text-blue-600 dark:text-blue-400 text-xs">
              ({user.email})
            </span>
            <button
              type="button"
              onClick={() => handleRemoveUser(user.id)}
              className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* Botón para agregar */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <UserPlus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      {/* Dropdown de búsqueda */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-xl max-h-80 overflow-hidden">
          {/* Input de búsqueda */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                autoFocus
              />
            </div>
          </div>

          {/* Lista de usuarios */}
          <div className="max-h-60 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                No se encontraron usuarios
              </div>
            ) : (
              <div className="py-2">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
