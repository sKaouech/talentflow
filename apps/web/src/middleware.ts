import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware logic si nécessaire
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Vérifier si l'utilisateur est authentifié
        if (req.nextUrl.pathname.startsWith('/auth/')) {
          // Les pages d'auth sont accessibles sans connexion
          return true
        }
        
        // Toutes les autres pages nécessitent une authentification
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}
