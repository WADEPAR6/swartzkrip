import Link from "next/link";
import { FileText, FolderOpen, Upload, Settings, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Swartzkrip</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sistema de Gestión Documental</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 dark:text-white mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Bienvenido a Swartzkrip
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Sistema seguro de gestión documental con cifrado de extremo a extremo
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Gestionar PDFs */}
          <Link href="/login">
            <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Gestionar PDFs
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Visualiza, administra y organiza todos tus documentos PDF de forma segura y eficiente.
              </p>
              <div className="mt-6 flex items-center text-blue-600 dark:text-blue-400 font-semibold group-hover:gap-2 transition-all">
                Acceder
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </div>
          </Link>

          {/* Card 2: Subir Documentos */}
          <Link href="/login">
            <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 cursor-pointer transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                Subir Documentos
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Carga nuevos documentos PDF con cifrado automático para máxima seguridad.
              </p>
              <div className="mt-6 flex items-center text-indigo-600 dark:text-indigo-400 font-semibold group-hover:gap-2 transition-all">
                Acceder
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
              </div>
            </div>
          </Link>

          {/* Card 3: Repositorio */}
          <div className="group bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 cursor-pointer transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Repositorio
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Explora y organiza tu biblioteca de documentos con filtros avanzados.
            </p>
            <div className="mt-6 flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:gap-2 transition-all">
              Próximamente
                <span className="ml-2 group-hover:ml-3 transition-all">→</span>
            </div>
          </div>
        </div>

        {/* Security Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4 mb-4">
            <Shield className="w-8 h-8" />
            <h3 className="text-2xl font-bold">Seguridad Garantizada</h3>
          </div>
          <p className="text-blue-100 text-lg leading-relaxed max-w-3xl">
            Todos tus documentos están protegidos con cifrado Vigenere de extremo a extremo. 
            La información viaja encriptada desde tu navegador hasta nuestros servidores, 
            garantizando la máxima confidencialidad de tus datos.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <p className="text-slate-600 dark:text-slate-400">
            © 2025 Swartzkrip - Sistema de Gestión Documental Seguro
          </p>
        </div>
      </footer>
    </div>
  );
}
