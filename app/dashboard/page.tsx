"use client";

import { SessionProvider, useSession } from "next-auth/react";

function DashboardContent() {
  const { data: session } = useSession();

  return (
    <div>
      <p>dashboard page</p>
      <p>User email: {session?.user?.email ?? "No hay sesión"}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SessionProvider>
      <DashboardContent />
    </SessionProvider>
  );
}
