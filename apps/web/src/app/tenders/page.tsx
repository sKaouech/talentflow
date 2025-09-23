'use client'

import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  
  
  Badge,
} from '@talentflow/ui'
import { useTenders, useTenderStats } from '@/hooks/use-tenders'
import { Plus, Search,   Edit, Archive, Share } from 'lucide-react'
import { formatDate, formatCurrency } from '@talentflow/shared'

export default function TendersPage() {
  const [searchParams, setSearchParams] = useState({
    page: 1,
    limit: 20,
    q: '',
    status: '',
    type: '',
  })

  const { data: tenders, isLoading, error } = useTenders(searchParams)
  const { data: stats } = useTenderStats()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La recherche se fait automatiquement via le hook useTenders
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'draft':
        return 'secondary'
      case 'closed':
        return 'destructive'
      case 'archived':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Actif'
      case 'draft':
        return 'Brouillon'
      case 'closed':
        return 'Fermé'
      case 'archived':
        return 'Archivé'
      default:
        return status
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mission':
        return 'Mission'
      case 'cdi':
        return 'CDI'
      case 'freelance':
        return 'Freelance'
      case 'stage':
        return 'Stage'
      default:
        return type
    }
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">
          Erreur lors du chargement des appels d'offres
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Appels d'offres</h1>
          <p className="text-muted-foreground">
            Gérez et publiez vos appels d'offres
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvel appel d'offres
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <div className="text-sm text-muted-foreground">Actifs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.draft}
              </div>
              <div className="text-sm text-muted-foreground">Brouillons</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.published}
              </div>
              <div className="text-sm text-muted-foreground">Publiés</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {stats.applicationsCount}
              </div>
              <div className="text-sm text-muted-foreground">Candidatures</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher des appels d'offres..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchParams.q}
                onChange={e =>
                  setSearchParams(prev => ({ ...prev, q: e.target.value }))
                }
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchParams.status}
              onChange={e =>
                setSearchParams(prev => ({ ...prev, status: e.target.value }))
              }
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="active">Actif</option>
              <option value="closed">Fermé</option>
              <option value="archived">Archivé</option>
            </select>
            <select
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchParams.type}
              onChange={e =>
                setSearchParams(prev => ({ ...prev, type: e.target.value }))
              }
            >
              <option value="">Tous les types</option>
              <option value="mission">Mission</option>
              <option value="cdi">CDI</option>
              <option value="freelance">Freelance</option>
              <option value="stage">Stage</option>
            </select>
            <Button type="submit" variant="outline">
              <Filter className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Tenders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Chargement...</p>
          </div>
        ) : tenders?.items?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aucun appel d'offres trouvé
              </p>
              <Button>Créer votre premier appel d'offres</Button>
            </CardContent>
          </Card>
        ) : (
          tenders?.items?.map((tender: any) => (
            <Card key={tender.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{tender.title}</h3>
                      <Badge variant={getStatusVariant(tender.status)}>
                        {getStatusLabel(tender.status)}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(tender.type)}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {tender.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      {tender.location && <span>📍 {tender.location}</span>}
                      {tender.dailyRate && (
                        <span>💰 {formatCurrency(tender.dailyRate)}/jour</span>
                      )}
                      {tender.startDate && (
                        <span>📅 {formatDate(tender.startDate)}</span>
                      )}
                      <span>
                        📝 {tender.applications?.length || 0} candidatures
                      </span>
                      <span>
                        📢 {tender.publications?.length || 0} publications
                      </span>
                    </div>

                    {tender.skills && tender.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tender.skills.slice(0, 5).map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {tender.skills.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{tender.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Archive className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
                  <span>Créé le {formatDate(tender.createdAt)}</span>
                  {tender.publishedAt && (
                    <span>Publié le {formatDate(tender.publishedAt)}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {tenders?.pagination && tenders.pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={tenders.pagination.page === 1}
            onClick={() =>
              setSearchParams(prev => ({ ...prev, page: prev.page - 1 }))
            }
          >
            Précédent
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {tenders.pagination.page} sur {tenders.pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={tenders.pagination.page === tenders.pagination.pages}
            onClick={() =>
              setSearchParams(prev => ({ ...prev, page: prev.page + 1 }))
            }
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}
