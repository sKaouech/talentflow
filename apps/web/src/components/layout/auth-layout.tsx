'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { MainLayout } from './main-layout'

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Pages d'authentification qui ne nécessitent pas le layout principal
  const isAuthPage = pathname.startsWith('/auth/')

  // Affichage pendant le chargement de la session
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-xl">TF</span>
          </div>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si c'est une page d'auth, afficher directement le contenu
  if (isAuthPage) {
    return <>{children}</>
  }

  // Si l'utilisateur n'est pas connecté et ce n'est pas une page d'auth,
  // le middleware s'occupera de la redirection

  // Si l'utilisateur est connecté, utiliser le layout principal
  return <MainLayout>{children}</MainLayout>
}
