"use client";

import { useState, useEffect } from "react";
import { useUser } from "../../hooks/useUser";
import { IUserCreateRequest, UserRole } from "../../data/interface/IUser";
import {
  validateCedulaEcuatoriana,
  validateInstitutionalEmail,
  validatePassword,
  formatCedula,
  getRoleDescription,
  requiresAdminPassword
} from "../../data/validators/userValidators";
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Briefcase,
  Shield,
  X,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  CreditCard,
  Save,
  UserPlus
} from "lucide-react";

interface UserFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const roleOptions: { value: UserRole; label: string; description: string }[] = [
  { 
    value: "admin", 
    label: "Administrador", 
    description: "Acceso completo al sistema, puede gestionar usuarios y configuración" 
  },
  { 
    value: "secretaria", 
    label: "Secretaria/Asistente", 
    description: "Puede crear, enviar y gestionar documentos oficiales" 
  },
  { 
    value: "docente", 
    label: "Docente/Profesor", 
    description: "Puede crear documentos y recibir como destinatario" 
  },
  { 
    value: "viewer", 
    label: "Visualizador", 
    description: "Solo puede ver documentos donde es destinatario" 
  }
];

const departamentos = [
  "Facultad de Sistemas",
  "Facultad de Ciencias Administrativas",
  "Facultad de Ciencias Humanas y de la Educación",
  "Facultad de Ingeniería Civil y Mecánica",
  "Facultad de Ciencias de la Salud",
  "Facultad de Contabilidad y Auditoría",
  "Facultad de Jurisprudencia y Ciencias Sociales",
  "Rectorado",
  "Vicerrectorado Académico",
  "Vicerrectorado Administrativo",
  "Secretaría General"
];

export default function UserForm({ onSuccess, onCancel }: UserFormProps) {
  const { createUser, isLoading, error: globalError } = useUser();
  
  const [formData, setFormData] = useState<IUserCreateRequest>({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    role: "docente",
    department: "",
    position: "",
    activo: true,
    esDestinatario: true
  });

  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmAdminPassword, setConfirmAdminPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showConfirmAdminPassword, setShowConfirmAdminPassword] = useState(false);

  const [validations, setValidations] = useState({
    cedula: { isValid: false, message: "" as string | undefined },
    email: { isValid: false, message: "" as string | undefined },
    password: { isValid: false, message: "" as string | undefined },
    adminPassword: { isValid: false, message: "" as string | undefined }
  });

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Validar cédula en tiempo real
  useEffect(() => {
    if (formData.cedula) {
      const validation = validateCedulaEcuatoriana(formData.cedula);
      setValidations(prev => ({ ...prev, cedula: { isValid: validation.isValid, message: validation.message } }));
    }
  }, [formData.cedula]);

  // Validar email en tiempo real
  useEffect(() => {
    if (formData.email) {
      const validation = validateInstitutionalEmail(formData.email);
      setValidations(prev => ({ ...prev, email: { isValid: validation.isValid, message: validation.message } }));
    }
  }, [formData.email]);

  // Validar contraseña en tiempo real
  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password);
      setValidations(prev => ({ ...prev, password: { isValid: validation.isValid, message: validation.message } }));
    }
  }, [formData.password]);

  // Validar contraseña de admin en tiempo real
  useEffect(() => {
    if (adminPassword && requiresAdminPassword(formData.role)) {
      const validation = validatePassword(adminPassword);
      setValidations(prev => ({ ...prev, adminPassword: { isValid: validation.isValid, message: validation.message } }));
    }
  }, [adminPassword, formData.role]);

  const handleBlur = (field: string) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const showError = (field: string) => {
    return touchedFields.has(field);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marcar todos los campos como tocados
    setTouchedFields(new Set([
      'cedula', 'nombre', 'apellido', 'email', 
      'password', 'department', 'position'
    ]));

    // Validar todos los campos
    if (!validations.cedula.isValid) {
      alert(validations.cedula.message || "Cédula inválida");
      return;
    }

    if (!validations.email.isValid) {
      alert(validations.email.message || "Email inválido");
      return;
    }

    if (!validations.password.isValid) {
      alert(validations.password.message || "Contraseña inválida");
      return;
    }

    if (formData.password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    // Validar contraseña de admin si es necesario
    if (requiresAdminPassword(formData.role)) {
      if (!adminPassword) {
        alert("Se requiere contraseña de administrador para este rol");
        return;
      }

      if (!validations.adminPassword.isValid) {
        alert(validations.adminPassword.message || "Contraseña de administrador inválida");
        return;
      }

      if (adminPassword !== confirmAdminPassword) {
        alert("Las contraseñas de administrador no coinciden");
        return;
      }
    }

    try {
      const payload: IUserCreateRequest = {
        ...formData,
        adminPassword: requiresAdminPassword(formData.role) ? adminPassword : undefined
      };

      await createUser(payload);
      alert("✅ Usuario creado exitosamente");
      
      // Limpiar formulario
      setFormData({
        cedula: "",
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        role: "docente",
        department: "",
        position: "",
        activo: true,
        esDestinatario: true
      });
      setAdminPassword("");
      setConfirmPassword("");
      setConfirmAdminPassword("");
      setTouchedFields(new Set());

      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Nuevo Usuario</h2>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cédula */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard className="w-4 h-4 inline mr-2" />
            Cédula de Identidad *
          </label>
          <input
            type="text"
            value={formData.cedula}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
              setFormData({ ...formData, cedula: value });
            }}
            onBlur={() => handleBlur('cedula')}
            placeholder="1234567890"
            maxLength={10}
            className={`w-full p-3 border rounded-lg ${
              showError('cedula') && !validations.cedula.isValid
                ? 'border-red-500 bg-red-50'
                : validations.cedula.isValid
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            required
          />
          {showError('cedula') && formData.cedula && (
            <div className={`flex items-center gap-2 mt-1 text-sm ${
              validations.cedula.isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {validations.cedula.isValid ? (
                <><CheckCircle className="w-4 h-4" /> Cédula válida</>
              ) : (
                <><AlertCircle className="w-4 h-4" /> {validations.cedula.message}</>
              )}
            </div>
          )}
          {validations.cedula.isValid && (
            <p className="text-xs text-gray-500 mt-1">
              Formato: {formatCedula(formData.cedula)}
            </p>
          )}
        </div>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              onBlur={() => handleBlur('nombre')}
              placeholder="Juan"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              value={formData.apellido}
              onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              onBlur={() => handleBlur('apellido')}
              placeholder="Pérez"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            Email Institucional *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
            onBlur={() => handleBlur('email')}
            placeholder="usuario@uta.edu.ec"
            className={`w-full p-3 border rounded-lg ${
              showError('email') && !validations.email.isValid
                ? 'border-red-500 bg-red-50'
                : validations.email.isValid
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300'
            }`}
            required
          />
          {showError('email') && formData.email && (
            <div className={`flex items-center gap-2 mt-1 text-sm ${
              validations.email.isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {validations.email.isValid ? (
                <><CheckCircle className="w-4 h-4" /> Email institucional válido</>
              ) : (
                <><AlertCircle className="w-4 h-4" /> {validations.email.message}</>
              )}
            </div>
          )}
        </div>

        {/* Rol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-2" />
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full p-3 border border-gray-300 rounded-lg"
            required
          >
            {roleOptions.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {roleOptions.find(r => r.value === formData.role)?.description}
          </p>
        </div>

        {/* Departamento y Cargo */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Departamento/Facultad *
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              onBlur={() => handleBlur('department')}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            >
              <option value="">Seleccione...</option>
              {departamentos.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Briefcase className="w-4 h-4 inline mr-2" />
              Cargo *
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              onBlur={() => handleBlur('position')}
              placeholder="Ej: Docente, Decano, Secretaria"
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Contraseña *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onBlur={() => handleBlur('password')}
                placeholder="Mínimo 8 caracteres"
                className={`w-full p-3 border rounded-lg pr-10 ${
                  showError('password') && !validations.password.isValid
                    ? 'border-red-500 bg-red-50'
                    : validations.password.isValid
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {showError('password') && formData.password && !validations.password.isValid && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {validations.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repetir contraseña"
                className={`w-full p-3 border rounded-lg pr-10 ${
                  confirmPassword && formData.password !== confirmPassword
                    ? 'border-red-500 bg-red-50'
                    : confirmPassword && formData.password === confirmPassword
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300'
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmPassword && formData.password !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
            )}
          </div>
        </div>

        {/* Contraseña de Administrador (solo para admin y secretaria) */}
        {requiresAdminPassword(formData.role) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Contraseña de Administrador (Nivel Superior)
            </h3>
            <p className="text-xs text-yellow-700 mb-4">
              Los roles de {getRoleDescription(formData.role)} requieren una contraseña adicional de administrador
              para operaciones sensibles del sistema.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña Admin *
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Contraseña de administrador"
                    className={`w-full p-3 border rounded-lg pr-10 ${
                      adminPassword && !validations.adminPassword.isValid
                        ? 'border-red-500 bg-red-50'
                        : validations.adminPassword.isValid
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Contraseña Admin *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmAdminPassword ? "text" : "password"}
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Repetir contraseña admin"
                    className={`w-full p-3 border rounded-lg pr-10 ${
                      confirmAdminPassword && adminPassword !== confirmAdminPassword
                        ? 'border-red-500 bg-red-50'
                        : confirmAdminPassword && adminPassword === confirmAdminPassword
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmAdminPassword(!showConfirmAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmAdminPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Opciones adicionales */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.esDestinatario}
              onChange={(e) => setFormData({ ...formData, esDestinatario: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Puede recibir documentos como destinatario</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm text-gray-700">Usuario activo</span>
          </label>
        </div>

        {/* Error global */}
        {globalError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{globalError}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>Creando...</>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Crear Usuario
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
