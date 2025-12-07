import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware para proteger rutas
 * Usa NextAuth JWT para validar la sesión de Microsoft
 */

const protectedRoutes = ["/pdf", "/addpdf", "/profile"];
const authPageRoutes = ["/login"];
const publicRoutes = ["/", "/api"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas SIEMPRE
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir /login SIEMPRE (ruta pública)
  if (authPageRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Obtener token de NextAuth (para Microsoft login)
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET 
  });
  
  const isAuthenticated = !!token;

  // Logs para debugging
  console.log("🔐 Middleware:", {
    path: pathname,
    isAuthenticated,
    user: token?.email || "No autenticado",
  });

  // Verificar si es ruta protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Si es ruta protegida y NO está autenticado → redirigir a login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    console.log("❌ No autenticado, redirigiendo a login desde:", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Agregar headers de seguridad
  const response = NextResponse.next();
  
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  return response;
}

// Configurar qué rutas ejecutan el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)",
  ],
};

