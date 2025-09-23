'use client'

import Link from 'next/link'
import {
  Briefcase,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  ArrowUpRight,
  
  Target,
  Award,
  Activity,
  Plus,
  
} from 'lucide-react'
import { Button, Card, Badge } from '@talentflow/ui'
import { cn } from '@/lib/utils'

const stats = [
  {
    title: "Appels d'offres actifs",
    value: '12',
    change: '+2 cette semaine',
    changeType: 'positive' as const,
    icon: Briefcase,
    color: 'bg-blue-500',
  },
  {
    title: 'Candidats qualifiés',
    value: '248',
    change: '+15 ce mois',
    changeType: 'positive' as const,
    icon: Users,
    color: 'bg-green-500',
  },
  {
    title: 'Taux de conversion',
    value: '24%',
    change: '+3% vs mois dernier',
    changeType: 'positive' as const,
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
  {
    title: 'Revenue ce mois',
    value: '€45,230',
    change: '+12% vs mois dernier',
    changeType: 'positive' as const,
    icon: DollarSign,
    color: 'bg-orange-500',
  },
]

const recentTenders = [
  {
    id: 1,
    title: 'Développeur Full-Stack React/Node.js',
    client: 'TechStartup Inc.',
    status: 'active',
    applications: 8,
    deadline: '2024-01-15',
    budget: '550€/jour',
  },
  {
    id: 2,
    title: 'Chef de Projet Digital',
    client: 'IndustrialCorp',
    status: 'draft',
    applications: 0,
    deadline: '2024-01-20',
    budget: '60k€/an',
  },
  {
    id: 3,
    title: 'UX/UI Designer Senior',
    client: 'Design Agency',
    status: 'active',
    applications: 12,
    deadline: '2024-01-18',
    budget: '450€/jour',
  },
]

const recentActivity = [
  {
    id: 1,
    type: 'candidate',
    message: 'Nouveau candidat ajouté - Marie Dubois',
    time: 'Il y a 30 minutes',
    icon: Users,
    color: 'text-blue-600',
  },
  {
    id: 2,
    type: 'tender',
    message: "Appel d'offres publié - Développeur Backend",
    time: 'Il y a 2 heures',
    icon: Briefcase,
    color: 'text-green-600',
  },
  {
    id: 3,
    type: 'application',
    message: '5 nouvelles candidatures reçues',
    time: 'Il y a 4 heures',
    icon: Target,
    color: 'text-purple-600',
  },
  {
    id: 4,
    type: 'success',
    message: 'Candidat placé avec succès chez TechCorp',
    time: 'Hier',
    icon: Award,
    color: 'text-orange-600',
  },
]

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-slate-600 mt-1">
            Aperçu de votre activité TalentFlow
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Derniers 30 jours
          </Button>
          <Link href="/tenders">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau projet
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {stat.value}
                </p>
                <p
                  className={cn(
                    'text-sm mt-2 font-medium',
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : 'text-red-600'
                  )}
                >
                  {stat.change}
                </p>
              </div>
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center',
                  stat.color
                )}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tenders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Appels d'offres récents
            </h2>
            <Link href="/tenders">
              <Button variant="ghost" size="sm">
                Voir tout
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentTenders.map(tender => (
              <div
                key={tender.id}
                className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900 mb-1">
                      {tender.title}
                    </h3>
                    <p className="text-sm text-slate-600">{tender.client}</p>
                  </div>
                  <Badge
                    variant={
                      tender.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {tender.status === 'active' ? 'Actif' : 'Brouillon'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {tender.applications} candidatures
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(tender.deadline).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {tender.budget}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Activité récente
            </h2>
            <Button variant="ghost" size="sm">
              <Activity className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-4">
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100',
                    activity.color
                      .replace('text-', 'bg-')
                      .replace('-600', '-100')
                  )}
                >
                  <activity.icon className={cn('h-5 w-5', activity.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {activity.message}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/tenders">
            <Button
              variant="outline"
              className="h-auto p-4 flex-col gap-2 w-full"
            >
              <Briefcase className="h-6 w-6" />
              <span>Créer un appel d'offres</span>
            </Button>
          </Link>
          <Button variant="outline" className="h-auto p-4 flex-col gap-2">
            <Users className="h-6 w-6" />
            <span>Ajouter un candidat</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col gap-2">
            <TrendingUp className="h-6 w-6" />
            <span>Voir les analytics</span>
          </Button>
          <Button variant="outline" className="h-auto p-4 flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span>Planifier un entretien</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}
