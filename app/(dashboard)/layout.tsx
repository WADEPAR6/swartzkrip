import DashboardHeader from "@/features/auth/presentation/components/dashboardHeader";

/**
 * Layout específico para rutas del dashboard
 * Incluye el header con navegación y autenticación
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <DashboardHeader />
      <main>{children}</main>
    </div>
  );
}
