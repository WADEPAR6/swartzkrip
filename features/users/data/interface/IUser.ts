/**
 * Interfaces para gestión de usuarios del sistema ecuatoriano
 * Incluye validación de cédula, email institucional y roles jerárquicos
 */

export type UserRole = 'admin' | 'secretaria' | 'docente' | 'viewer';

export interface IUser {
  id: string;
  cedula: string; // Cédula de identidad ecuatoriana (10 dígitos)
  nombre: string;
  apellido: string;
  nombreCompleto?: string; // nombre + apellido
  email: string; // Email institucional @uta.edu.ec
  role: UserRole;
  department: string; // Facultad o Departamento
  position: string; // Cargo (Ej: Decano, Docente, Secretaria)
  avatar?: string | null;
  activo: boolean;
  esDestinatario: boolean; // Si puede recibir documentos
  creadoEn: string;
  actualizadoEn?: string;
  ultimoAcceso?: string;
  permisos?: string[];
  metadata?: {
    telefono?: string;
    extension?: string;
    oficina?: string;
    horarioAtencion?: string;
    [key: string]: any;
  };
}

export interface IUserListResponse {
  success: boolean;
  data: IUser[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface IUserCreateRequest {
  cedula: string; // Cédula ecuatoriana (10 dígitos, validada)
  nombre: string;
  apellido: string;
  email: string; // Debe ser @uta.edu.ec
  password: string; // Contraseña para usuarios normales
  adminPassword?: string; // Contraseña de administrador (solo para admin y secretaria)
  role: UserRole;
  department: string;
  position: string;
  activo?: boolean;
  esDestinatario?: boolean; // Por defecto true
  telefono?: string;
  extension?: string;
  oficina?: string;
}

export interface IUserUpdateRequest {
  id: string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  department?: string;
  position?: string;
  role?: UserRole;
  activo?: boolean;
  esDestinatario?: boolean;
  avatar?: string;
  telefono?: string;
  extension?: string;
  oficina?: string;
}

export interface IUserPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  isAdminPassword?: boolean; // true si es contraseña de admin
}

export interface IUserFilters {
  role?: UserRole;
  department?: string;
  activo?: boolean;
  esDestinatario?: boolean;
}

// Validación de cédula ecuatoriana
export interface ICedulaValidation {
  isValid: boolean;
  message?: string;
}

// Validación de email institucional
export interface IEmailValidation {
  isValid: boolean;
  isInstitutional: boolean;
  message?: string;
}
