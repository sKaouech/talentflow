'use client'

import { Button, Card, Badge, Progress } from '@talentflow/ui'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Target,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const stats = [
  {
    title: 'Revenus ce mois',
    value: '€45,230',
    change: '+12%',
    changeType: 'positive' as const,
    icon: DollarSign,
    color: 'bg-green-500',
  },
  {
    title: 'Placements réussis',
    value: '23',
    change: '+8%',
    changeType: 'positive' as const,
    icon: Target,
    color: 'bg-blue-500',
  },
  {
    title: 'Taux de conversion',
    value: '24%',
    change: '-3%',
    changeType: 'negative' as const,
    icon: TrendingUp,
    color: 'bg-purple-500',
  },
  {
    title: 'Temps de placement',
    value: '18 jours',
    change: '-2 jours',
    changeType: 'positive' as const,
    icon: Calendar,
    color: 'bg-orange-500',
  },
]

const topTenders = [
  {
    title: 'Développeur Full-Stack React/Node.js',
    applications: 24,
    views: 156,
    conversionRate: 15.4,
  },
  {
    title: 'Chef de Projet Digital',
    applications: 18,
    views: 89,
    conversionRate: 20.2,
  },
  {
    title: 'UX/UI Designer Senior',
    applications: 31,
    views: 203,
    conversionRate: 15.3,
  },
]

const recentPlacements = [
  {
    candidate: 'Marie Dubois',
    position: 'Développeur Full-Stack',
    client: 'TechStartup Inc.',
    value: 2200,
    date: '2024-01-15',
  },
  {
    candidate: 'Thomas Martin',
    position: 'Chef de Projet',
    client: 'IndustrialCorp',
    value: 3500,
    date: '2024-01-12',
  },
  {
    candidate: 'Sophie Bernard',
    position: 'UX Designer',
    client: 'Design Agency',
    value: 1800,
    date: '2024-01-10',
  },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">
            Analysez les performances de votre activité
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
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
                <div className="flex items-center gap-1 mt-2">
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span
                    className={cn(
                      'text-sm font-medium',
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    )}
                  >
                    {stat.change}
                  </span>
                </div>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Évolution du chiffre d'affaires
            </h2>
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {/* Mock chart data */}
            <div className="flex items-end gap-2 h-40">
              {[40, 65, 45, 80, 55, 70, 85, 60, 75, 90, 65, 85].map(
                (height, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t-sm opacity-80 hover:opacity-100 transition-opacity"
                    style={{ height: `${height}%` }}
                  />
                )
              )}
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Jan</span>
              <span>Fév</span>
              <span>Mar</span>
              <span>Avr</span>
              <span>Mai</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aoû</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Déc</span>
            </div>
          </div>
        </Card>

        {/* Conversion Funnel */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Entonnoir de conversion
            </h2>
            <Button variant="ghost" size="sm">
              <PieChart className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Vues des offres</span>
                <span className="text-sm text-slate-600">1,234</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Candidatures</span>
                <span className="text-sm text-slate-600">156</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Entretiens</span>
                <span className="text-sm text-slate-600">45</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Placements</span>
                <span className="text-sm text-slate-600">23</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Performing Tenders */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Top des appels d'offres
          </h2>
          <div className="space-y-4">
            {topTenders.map((tender, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 mb-1">
                    {tender.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>{tender.applications} candidatures</span>
                    <span>{tender.views} vues</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    {tender.conversionRate}%
                  </div>
                  <div className="text-xs text-slate-500">conversion</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Placements */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">
            Placements récents
          </h2>
          <div className="space-y-4">
            {recentPlacements.map((placement, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 mb-1">
                    {placement.candidate}
                  </h3>
                  <p className="text-sm text-slate-600 mb-1">
                    {placement.position}
                  </p>
                  <p className="text-xs text-slate-500">{placement.client}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">
                    €{placement.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(placement.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          Résumé d'activité - 30 derniers jours
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-lg bg-slate-50">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">12</div>
            <div className="text-sm text-slate-600">
              Nouveaux appels d'offres
            </div>
          </div>
          <div className="text-center p-6 rounded-lg bg-slate-50">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">47</div>
            <div className="text-sm text-slate-600">Nouveaux candidats</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-slate-50">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900">8</div>
            <div className="text-sm text-slate-600">Placements réussis</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
