/**
 * Validadores para usuarios ecuatorianos
 * Incluye validación de cédula y email institucional
 */

import { ICedulaValidation, IEmailValidation } from '../interface/IUser';

/**
 * Validar cédula de identidad ecuatoriana
 * Algoritmo módulo 10
 */
export function validateCedulaEcuatoriana(cedula: string): ICedulaValidation {
  // Remover espacios y guiones
  const cedulaLimpia = cedula.replace(/[\s-]/g, '');

  // Verificar que tenga 10 dígitos
  if (cedulaLimpia.length !== 10) {
    return {
      isValid: false,
      message: 'La cédula debe tener 10 dígitos'
    };
  }

  // Verificar que solo contenga números
  if (!/^\d+$/.test(cedulaLimpia)) {
    return {
      isValid: false,
      message: 'La cédula solo debe contener números'
    };
  }

  // Verificar que los dos primeros dígitos sean válidos (01-24)
  const provincia = parseInt(cedulaLimpia.substring(0, 2));
  if (provincia < 1 || provincia > 24) {
    return {
      isValid: false,
      message: 'Los dos primeros dígitos deben estar entre 01 y 24'
    };
  }

  // Verificar el tercer dígito (debe ser menor a 6 para personas naturales)
  const tercerDigito = parseInt(cedulaLimpia.charAt(2));
  if (tercerDigito >= 6) {
    return {
      isValid: false,
      message: 'El tercer dígito debe ser menor a 6'
    };
  }

  // Algoritmo módulo 10
  const digitos = cedulaLimpia.split('').map(Number);
  const digitoVerificador = digitos[9];
  
  let suma = 0;
  for (let i = 0; i < 9; i++) {
    let valor = digitos[i];
    
    // Multiplicar por 2 los dígitos en posiciones impares (índice par)
    if (i % 2 === 0) {
      valor *= 2;
      if (valor > 9) {
        valor -= 9;
      }
    }
    
    suma += valor;
  }

  const residuo = suma % 10;
  const resultado = residuo === 0 ? 0 : 10 - residuo;

  if (resultado !== digitoVerificador) {
    return {
      isValid: false,
      message: 'La cédula no es válida (dígito verificador incorrecto)'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Validar email institucional UTA
 */
export function validateInstitutionalEmail(email: string): IEmailValidation {
  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      isInstitutional: false,
      message: 'El formato del email no es válido'
    };
  }

  // Verificar que sea del dominio institucional
  const dominiosValidos = [
    '@uta.edu.ec',
    '@uta.ec' // Por si hay un dominio alternativo
  ];

  const esInstitucional = dominiosValidos.some(dominio => 
    email.toLowerCase().endsWith(dominio)
  );

  if (!esInstitucional) {
    return {
      isValid: false,
      isInstitutional: false,
      message: 'Debe usar un email institucional (@uta.edu.ec)'
    };
  }

  return {
    isValid: true,
    isInstitutional: true
  };
}

/**
 * Validar contraseña segura
 */
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'La contraseña debe tener al menos 8 caracteres'
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos una mayúscula'
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos una minúscula'
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos un número'
    };
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      isValid: false,
      message: 'La contraseña debe contener al menos un carácter especial'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Formatear cédula (agregar guiones)
 */
export function formatCedula(cedula: string): string {
  const cedulaLimpia = cedula.replace(/[\s-]/g, '');
  if (cedulaLimpia.length === 10) {
    return `${cedulaLimpia.substring(0, 3)}-${cedulaLimpia.substring(3, 10)}`;
  }
  return cedula;
}

/**
 * Generar nombre completo
 */
export function generateFullName(nombre: string, apellido: string): string {
  return `${nombre.trim()} ${apellido.trim()}`;
}

/**
 * Obtener descripción del rol
 */
export function getRoleDescription(role: string): string {
  const roles: Record<string, string> = {
    admin: 'Administrador del Sistema',
    secretaria: 'Secretaria/Asistente Administrativa',
    docente: 'Docente/Profesor',
    viewer: 'Visualizador (Solo lectura)'
  };
  
  return roles[role] || role;
}

/**
 * Validar que el role requiera contraseña de admin
 */
export function requiresAdminPassword(role: string): boolean {
  return ['admin', 'secretaria'].includes(role);
}
