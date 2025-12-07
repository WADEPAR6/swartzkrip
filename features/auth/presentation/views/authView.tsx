import LoginForm from "../components/loginForm";

/**
 * Vista de autenticación
 * Muestra el formulario de login centrado
 */
export default function AuthView() {
  return (
    <div className="flex items-center justify-center">
      <LoginForm />
    </div>
  );
}