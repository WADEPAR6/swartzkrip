import AuthView from "@/features/auth/presentation/views/authView";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <AuthView />
    </div>
  );
}