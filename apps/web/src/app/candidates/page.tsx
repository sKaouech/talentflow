'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  Badge,
  Input,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@talentflow/ui'
import {
  Plus,
  Search,
  
  MapPin,
  
  DollarSign,
  Users,
  
  Edit,
  
  Mail,
  Phone,
  Download,
  Star,
  Building,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data pour les candidats
const mockCandidates = [
  {
    id: 1,
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    location: 'Paris',
    title: 'Développeuse Full-Stack',
    experience: '5 ans',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
    dailyRate: 550,
    availability: 'Disponible',
    lastContact: '2024-01-10',
    rating: 4.8,
    status: 'active',
    avatar: null,
  },
  {
    id: 2,
    firstName: 'Thomas',
    lastName: 'Martin',
    email: 'thomas.martin@email.com',
    phone: '+33 6 98 76 54 32',
    location: 'Lyon',
    title: 'Chef de Projet Digital',
    experience: '8 ans',
    skills: ['Project Management', 'Agile', 'Scrum', 'Digital Marketing'],
    dailyRate: null,
    availability: 'En mission',
    lastContact: '2024-01-08',
    rating: 4.9,
    status: 'busy',
    avatar: null,
  },
  {
    id: 3,
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@email.com',
    phone: '+33 6 55 44 33 22',
    location: 'Bordeaux',
    title: 'UX/UI Designer',
    experience: '6 ans',
    skills: ['Figma', 'Adobe Creative', 'User Research', 'Prototyping'],
    dailyRate: 450,
    availability: 'Disponible',
    lastContact: '2024-01-12',
    rating: 4.7,
    status: 'active',
    avatar: null,
  },
]

const statusConfig = {
  active: { label: 'Actif', color: 'bg-green-100 text-green-800' },
  busy: { label: 'En mission', color: 'bg-orange-100 text-orange-800' },
  inactive: { label: 'Inactif', color: 'bg-gray-100 text-gray-800' },
}

export default function CandidatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredCandidates = mockCandidates.filter(candidate => {
    const matchesSearch =
      candidate.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills.some(skill =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      )

    const matchesFilter =
      selectedFilter === 'all' || candidate.status === selectedFilter

    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Candidats</h1>
          <p className="text-slate-600 mt-1">Gérez votre vivier de talents</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un candidat
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total candidats
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {mockCandidates.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Disponibles</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {mockCandidates.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
              <Star className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">En mission</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {mockCandidates.filter(c => c.status === 'busy').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <Building className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">TJM moyen</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {Math.round(
                  mockCandidates
                    .filter(c => c.dailyRate)
                    .reduce((acc, c) => acc + (c.dailyRate || 0), 0) /
                    mockCandidates.filter(c => c.dailyRate).length
                )}
                €
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, titre ou compétence..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              Tous ({mockCandidates.length})
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('active')}
            >
              Disponibles (
              {mockCandidates.filter(c => c.status === 'active').length})
            </Button>
            <Button
              variant={selectedFilter === 'busy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('busy')}
            >
              En mission (
              {mockCandidates.filter(c => c.status === 'busy').length})
            </Button>
          </div>
        </div>
      </Card>

      {/* Candidates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCandidates.map(candidate => (
          <Card
            key={candidate.id}
            className="p-6 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src={candidate.avatar || undefined} />
                  <AvatarFallback>
                    {candidate.firstName[0]}
                    {candidate.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {candidate.firstName} {candidate.lastName}
                  </h3>
                  <p className="text-sm text-slate-600">{candidate.title}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'h-3 w-3',
                          i < Math.floor(candidate.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-slate-300'
                        )}
                      />
                    ))}
                    <span className="text-xs text-slate-500 ml-1">
                      {candidate.rating}
                    </span>
                  </div>
                </div>
              </div>
              <Badge
                className={
                  statusConfig[candidate.status as keyof typeof statusConfig]
                    .color
                }
              >
                {
                  statusConfig[candidate.status as keyof typeof statusConfig]
                    .label
                }
              </Badge>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                <span className="truncate">{candidate.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4" />
                <span>{candidate.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4" />
                <span>{candidate.location}</span>
              </div>
            </div>

            {/* Experience and Rate */}
            <div className="flex items-center justify-between mb-4 text-sm">
              <div className="flex items-center gap-1 text-slate-600">
                <GraduationCap className="h-4 w-4" />
                {candidate.experience}
              </div>
              {candidate.dailyRate && (
                <div className="flex items-center gap-1 font-medium text-slate-900">
                  <DollarSign className="h-4 w-4" />
                  {candidate.dailyRate}€/jour
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {candidate.skills.slice(0, 3).map(skill => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {candidate.skills.length > 3 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
                  +{candidate.skills.length - 3}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Contacter
              </Button>
            </div>

            {/* Last contact */}
            <div className="text-xs text-slate-500 mt-2">
              Dernier contact:{' '}
              {new Date(candidate.lastContact).toLocaleDateString('fr-FR')}
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {searchTerm || selectedFilter !== 'all'
              ? 'Aucun candidat trouvé'
              : 'Aucun candidat'}
          </h3>
          <p className="text-slate-600 mb-6">
            {searchTerm || selectedFilter !== 'all'
              ? 'Essayez de modifier vos critères de recherche'
              : 'Commencez par ajouter votre premier candidat'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un candidat
          </Button>
        </Card>
      )}
    </div>
  )
}
