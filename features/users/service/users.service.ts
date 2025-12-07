import axiosClient from '@/core/Axios/AxiosClient';
import {
  IUser,
  IUserListResponse,
  IUserCreateRequest,
  IUserUpdateRequest,
  IUserPasswordChangeRequest,
  IUserFilters
} from '../data/interface/IUser';
import { 
  validateCedulaEcuatoriana, 
  validateInstitutionalEmail,
  validatePassword,
  generateFullName
} from '../data/validators/userValidators';

/**
 * Servicio para gestión de usuarios ecuatorianos
 * Incluye validación de cédula y email institucional
 */
class UsersService {
  private static instance: UsersService;
  private readonly basePath = '/api/users';

  private constructor() {}

  public static getInstance(): UsersService {
    if (!UsersService.instance) {
      UsersService.instance = new UsersService();
    }
    return UsersService.instance;
  }

  /**
   * Validar datos antes de crear/actualizar usuario
   */
  private validateUserData(data: IUserCreateRequest | IUserUpdateRequest): void {
    // Validar cédula si está presente
    if ('cedula' in data && data.cedula) {
      const cedulaValidation = validateCedulaEcuatoriana(data.cedula);
      if (!cedulaValidation.isValid) {
        throw new Error(cedulaValidation.message || 'Cédula inválida');
      }
    }

    // Validar email si está presente
    if ('email' in data && data.email) {
      const emailValidation = validateInstitutionalEmail(data.email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.message || 'Email inválido');
      }
    }

    // Validar contraseña si está presente
    if ('password' in data && data.password) {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message || 'Contraseña inválida');
      }
    }

    // Validar contraseña de admin si está presente
    if ('adminPassword' in data && data.adminPassword) {
      const adminPasswordValidation = validatePassword(data.adminPassword);
      if (!adminPasswordValidation.isValid) {
        throw new Error(`Contraseña de administrador: ${adminPasswordValidation.message}`);
      }
    }
  }

  /**
   * Obtener lista de usuarios con paginación y filtros
   */
  async getUsers(
    filters?: IUserFilters,
    page: number = 1,
    limit: number = 10
  ): Promise<IUserListResponse> {
    try {
      const response = await axiosClient.get<IUserListResponse>(this.basePath, {
        params: {
          ...filters,
          page,
          limit
        }
      });

      const hasMore = (response.page * response.limit) < response.total;

      return {
        ...response,
        hasMore
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener un usuario por ID
   */
  async getUserById(id: string): Promise<IUser> {
    try {
      const response = await axiosClient.get<{ success: boolean; data: IUser }>(
        `${this.basePath}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios destinatarios (para selector de documentos)
   */
  async getDestinatarios(): Promise<IUser[]> {
    try {
      const response = await axiosClient.get<IUserListResponse>(this.basePath, {
        params: {
          esDestinatario: true,
          activo: true,
          limit: 1000 // Obtener todos los destinatarios activos
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al obtener destinatarios:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async createUser(data: IUserCreateRequest): Promise<IUser> {
    try {
      // Validar datos antes de enviar
      this.validateUserData(data);

      // Generar nombre completo
      const payload = {
        ...data,
        nombreCompleto: generateFullName(data.nombre, data.apellido),
        esDestinatario: data.esDestinatario !== false // Por defecto true
      };

      console.log('📤 Creando usuario:', {
        cedula: data.cedula,
        nombre: payload.nombreCompleto,
        email: data.email,
        role: data.role,
        department: data.department,
        tieneAdminPassword: !!data.adminPassword
      });

      const response = await axiosClient.post<{ success: boolean; message: string; data: IUser }>(
        this.basePath,
        payload
      );

      console.log('✅ Usuario creado:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar un usuario
   */
  async updateUser(data: IUserUpdateRequest): Promise<IUser> {
    try {
      const { id, ...updateData } = data;

      // Validar datos antes de enviar
      this.validateUserData(data);

      // Generar nombre completo si se actualizan nombre o apellido
      const payload: any = { ...updateData };
      if (updateData.nombre || updateData.apellido) {
        const currentUser = await this.getUserById(id);
        payload.nombreCompleto = generateFullName(
          updateData.nombre || currentUser.nombre,
          updateData.apellido || currentUser.apellido
        );
      }

      console.log('📤 Actualizando usuario:', {
        id,
        campos: Object.keys(updateData)
      });

      const response = await axiosClient.put<{ success: boolean; message: string; data: IUser }>(
        `${this.basePath}/${id}`,
        payload
      );

      console.log('✅ Usuario actualizado:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  /**
   * Eliminar un usuario
   */
  async deleteUser(id: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando usuario:', id);

      await axiosClient.delete(`${this.basePath}/${id}`);

      console.log('✅ Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  /**
   * Buscar usuarios por nombre, cédula o email
   */
  async searchUsers(
    query: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IUserListResponse> {
    try {
      const response = await axiosClient.get<IUserListResponse>(
        `${this.basePath}/search`,
        {
          params: { q: query, page, limit }
        }
      );

      const hasMore = (response.page * response.limit) < response.total;

      return {
        ...response,
        hasMore
      };
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña de un usuario
   */
  async changePassword(
    userId: string,
    passwordData: IUserPasswordChangeRequest
  ): Promise<void> {
    try {
      // Validar nueva contraseña
      const passwordValidation = validatePassword(passwordData.newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      // Verificar que las contraseñas coincidan
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      console.log('🔒 Cambiando contraseña para usuario:', userId);

      await axiosClient.put(
        `${this.basePath}/${userId}/password`,
        passwordData
      );

      console.log('✅ Contraseña actualizada exitosamente');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw error;
    }
  }

  /**
   * Obtener usuarios por rol
   */
  async getUsersByRole(
    role: 'admin' | 'secretaria' | 'docente' | 'viewer',
    page: number = 1,
    limit: number = 10
  ): Promise<IUserListResponse> {
    return this.getUsers({ role }, page, limit);
  }

  /**
   * Obtener usuarios por departamento
   */
  async getUsersByDepartment(
    department: string,
    page: number = 1,
    limit: number = 10
  ): Promise<IUserListResponse> {
    return this.getUsers({ department }, page, limit);
  }

  /**
   * Activar/Desactivar usuario
   */
  async toggleUserStatus(userId: string, activo: boolean): Promise<IUser> {
    return this.updateUser({ id: userId, activo });
  }

  /**
   * Verificar si una cédula ya existe
   */
  async checkCedulaExists(cedula: string, excludeUserId?: string): Promise<boolean> {
    try {
      const response = await axiosClient.get<{ exists: boolean }>(
        `${this.basePath}/check-cedula`,
        {
          params: { cedula, excludeUserId }
        }
      );
      return response.exists;
    } catch (error) {
      console.error('Error al verificar cédula:', error);
      return false;
    }
  }

  /**
   * Verificar si un email ya existe
   */
  async checkEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const response = await axiosClient.get<{ exists: boolean }>(
        `${this.basePath}/check-email`,
        {
          params: { email, excludeUserId }
        }
      );
      return response.exists;
    } catch (error) {
      console.error('Error al verificar email:', error);
      return false;
    }
  }
}

// Exportar instancia singleton
const usersService = UsersService.getInstance();
export default usersService;
