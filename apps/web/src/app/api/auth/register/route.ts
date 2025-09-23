import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  tenantName: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    // Créer le tenant (entreprise)
    const tenant = await prisma.tenant.create({
      data: {
        name: validatedData.tenantName,
        slug: validatedData.tenantName.toLowerCase().replace(/\s+/g, '-'),
        plan: 'trial',
        settings: {},
        branding: {
          primaryColor: '#3b82f6',
          secondaryColor: '#1e40af',
        },
      },
    })

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        passwordHash: hashedPassword,
        role: 'tenant_admin',
        emailVerified: new Date(),
        tenantId: tenant.id, // Lier l'utilisateur au tenant
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    })

    // TODO: Créer les rôles et permissions (pour une version ultérieure)

    return NextResponse.json({
      message: 'Compte créé avec succès',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: tenant.id,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Erreur lors de la création du compte',
        details: error.message || error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
