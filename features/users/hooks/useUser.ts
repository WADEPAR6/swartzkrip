import { useCallback, useEffect, useState } from 'react';
import userStore from '../context/user.store';
import usersService from '../service/users.service';
import { 
  IUserCreateRequest, 
  IUserUpdateRequest, 
  IUserPasswordChangeRequest,
  IUserFilters 
} from '../data/interface/IUser';

/**
 * Hook para gestión de usuarios
 * Sincroniza el estado del store con el componente
 */
export const useUser = () => {
  const [state, setState] = useState(userStore.getState());

  useEffect(() => {
    // Suscribirse a cambios del store
    const unsubscribe = userStore.subscribe(() => {
      setState(userStore.getState());
    });

    return unsubscribe;
  }, []);

  /**
   * Cargar usuarios con paginación y filtros
   */
  const loadUsers = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      const response = await usersService.getUsers(state.filters, page, limit);
      
      userStore.setUsers(response.data);
      userStore.setPagination(
        response.page,
        Math.ceil(response.total / response.limit),
        response.total,
        response.hasMore
      );
    } catch (err: any) {
      userStore.setError(err.message || 'Error al cargar usuarios');
      console.error('Error en loadUsers:', err);
    } finally {
      userStore.setLoading(false);
    }
  }, [state.filters]);

  /**
   * Buscar usuarios
   */
  const searchUsers = useCallback(async (query: string, page: number = 1, limit: number = 10) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);
      userStore.setSearchQuery(query);

      if (!query.trim()) {
        await loadUsers(page, limit);
        return;
      }

      const response = await usersService.searchUsers(query, page, limit);
      
      userStore.setUsers(response.data);
      userStore.setPagination(
        response.page,
        Math.ceil(response.total / response.limit),
        response.total,
        response.hasMore
      );
    } catch (err: any) {
      userStore.setError(err.message || 'Error al buscar usuarios');
      console.error('Error en searchUsers:', err);
    } finally {
      userStore.setLoading(false);
    }
  }, [loadUsers]);

  /**
   * Cargar un usuario por ID
   */
  const loadUserById = useCallback(async (id: string) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      const user = await usersService.getUserById(id);
      userStore.setSelectedUser(user);
      
      return user;
    } catch (err: any) {
      userStore.setError(err.message || 'Error al cargar usuario');
      console.error('Error en loadUserById:', err);
      throw err;
    } finally {
      userStore.setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo usuario
   */
  const createUser = useCallback(async (data: IUserCreateRequest) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      const newUser = await usersService.createUser(data);
      userStore.addUser(newUser);
      
      return newUser;
    } catch (err: any) {
      userStore.setError(err.message || 'Error al crear usuario');
      console.error('Error en createUser:', err);
      throw err;
    } finally {
      userStore.setLoading(false);
    }
  }, []);

  /**
   * Actualizar usuario
   */
  const updateUser = useCallback(async (data: IUserUpdateRequest) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      const updatedUser = await usersService.updateUser(data);
      userStore.updateUser(updatedUser);
      
      return updatedUser;
    } catch (err: any) {
      userStore.setError(err.message || 'Error al actualizar usuario');
      console.error('Error en updateUser:', err);
      throw err;
    } finally {
      userStore.setLoading(false);
    }
  }, []);

  /**
   * Eliminar usuario
   */
  const deleteUser = useCallback(async (id: string) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      await usersService.deleteUser(id);
      userStore.removeUser(id);
    } catch (err: any) {
      userStore.setError(err.message || 'Error al eliminar usuario');
      console.error('Error en deleteUser:', err);
      throw err;
    } finally {
      userStore.setLoading(false);
    }
  }, []);

  /**
   * Cambiar contraseña
   */
  const changePassword = useCallback(async (
    userId: string,
    passwordData: IUserPasswordChangeRequest
  ) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      await usersService.changePassword(userId, passwordData);
    } catch (err: any) {
      userStore.setError(err.message || 'Error al cambiar contraseña');
      console.error('Error en changePassword:', err);
      throw err;
    } finally {
      userStore.setLoading(false);
    }
  }, []);

  /**
   * Aplicar filtros
   */
  const applyFilters = useCallback((newFilters: IUserFilters) => {
    userStore.setFilters(newFilters);
  }, []);

  /**
   * Activar/Desactivar usuario
   */
  const toggleUserStatus = useCallback(async (userId: string, activo: boolean) => {
    try {
      userStore.setLoading(true);
      userStore.setError(null);

      const updatedUser = await usersService.toggleUserStatus(userId, activo);
      userStore.updateUser(updatedUser);
      
      return updatedUser;
    } catch (err: any) {
      userStore.setError(err.message || 'Error al cambiar estado del usuario');
      console.error('Error en toggleUserStatus:', err);
      throw err;
    } finally {
      userStore.setLoading(false);
    }
  }, []);

  /**
   * Limpiar usuario seleccionado
   */
  const clearSelectedUser = useCallback(() => {
    userStore.setSelectedUser(null);
  }, []);

  /**
   * Resetear store
   */
  const resetStore = useCallback(() => {
    userStore.reset();
  }, []);

  return {
    // State
    users: state.users,
    selectedUser: state.selectedUser,
    isLoading: state.isLoading,
    error: state.error,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    total: state.total,
    hasMore: state.hasMore,
    filters: state.filters,
    searchQuery: state.searchQuery,
    
    // Actions
    loadUsers,
    searchUsers,
    loadUserById,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    applyFilters,
    toggleUserStatus,
    clearSelectedUser,
    resetStore,
  };
};