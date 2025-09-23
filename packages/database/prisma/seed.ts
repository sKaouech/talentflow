import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Créer un tenant de développement
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'dev-tenant' },
    update: {},
    create: {
      id: 'dev-tenant-id',
      name: 'Tenant de Développement',
      slug: 'dev-tenant',
      plan: 'pro',
      settings: {},
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#1e40af',
        logo: null,
      },
    },
  })

  console.log('✅ Tenant créé:', tenant)

  // Créer quelques appels d'offres de test
  const tender1 = await prisma.tender.upsert({
    where: { id: 'tender-1' },
    update: {},
    create: {
      id: 'tender-1',
      title: 'Développeur Full-Stack React/Node.js',
      description: 'Nous recherchons un développeur expérimenté en React et Node.js',
      content: `
# Mission Développeur Full-Stack

## Contexte
Notre client, une startup en pleine croissance, recherche un développeur full-stack pour renforcer son équipe technique.

## Compétences requises
- React (3+ ans)
- Node.js (3+ ans)
- TypeScript
- PostgreSQL
- Docker

## Conditions
- Remote possible
- TJM : 500-600€
- Durée : 6 mois renouvelables
      `,
      source: 'manual',
      type: 'freelance',
      status: 'active',
      priority: 'high',
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      location: 'Paris',
      remote: 'hybrid',
      dailyRate: 550,
      currency: 'EUR',
      clientName: 'TechStartup Inc.',
      clientIndustry: 'Technology',
      tenantId: 'dev-tenant-id',
      publishedAt: new Date(),
    },
  })

  const tender2 = await prisma.tender.upsert({
    where: { id: 'tender-2' },
    update: {},
    create: {
      id: 'tender-2',
      title: 'Chef de Projet Digital',
      description: 'Mission de management de projet digital pour un grand groupe',
      content: `
# Mission Chef de Projet Digital

## Contexte
Grand groupe industriel cherche un chef de projet expérimenté pour piloter sa transformation digitale.

## Profil recherché
- 5+ ans d'expérience en gestion de projet
- Certification PMP ou équivalent
- Expérience secteur industriel
- Anglais courant

## Conditions
- CDI possible
- Salaire : 55-65k€
- Télétravail 2j/semaine
      `,
      source: 'manual',
      type: 'cdi',
      status: 'draft',
      priority: 'medium',
      skills: ['Project Management', 'Agile', 'Scrum', 'Digital Transformation'],
      location: 'Lyon',
      remote: 'hybrid',
      clientName: 'IndustrialCorp',
      clientIndustry: 'Manufacturing',
      tenantId: 'dev-tenant-id',
    },
  })

  console.log('✅ Tenders créés:', { tender1, tender2 })

  console.log('🎉 Seeding terminé!')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
