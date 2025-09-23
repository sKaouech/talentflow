import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './providers'
import { AuthLayout } from '@/components/layout/auth-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TalentFlow - Plateforme de Gestion des Talents',
  description:
    "Plateforme SaaS moderne pour la gestion des appels d'offres et des talents. Simplifiez votre processus de recrutement.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <AuthProvider>
          <AuthLayout>{children}</AuthLayout>
        </AuthProvider>
      </body>
    </html>
  )
}
