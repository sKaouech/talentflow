import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tendersApi } from '@/lib/api'
import {
  SearchTendersInput,
  CreateTenderInput,
  UpdateTenderInput,
} from '@talentflow/validation'
import { toast } from '@/hooks/use-toast'

// Clés de query pour la gestion du cache
export const tenderKeys = {
  all: ['tenders'] as const,
  lists: () => [...tenderKeys.all, 'list'] as const,
  list: (filters: SearchTendersInput) =>
    [...tenderKeys.lists(), filters] as const,
  details: () => [...tenderKeys.all, 'detail'] as const,
  detail: (id: string) => [...tenderKeys.details(), id] as const,
  stats: () => [...tenderKeys.all, 'stats'] as const,
}

// Hook pour rechercher des tenders
export function useTenders(
  params: SearchTendersInput = { page: 1, limit: 20 }
) {
  return useQuery({
    queryKey: tenderKeys.list(params),
    queryFn: () => tendersApi.search(params),
    placeholderData: previousData => previousData,
  })
}

// Hook pour récupérer un tender par ID
export function useTender(id: string) {
  return useQuery({
    queryKey: tenderKeys.detail(id),
    queryFn: () => tendersApi.getById(id),
    enabled: !!id,
  })
}

// Hook pour les statistiques des tenders
export function useTenderStats() {
  return useQuery({
    queryKey: tenderKeys.stats(),
    queryFn: () => tendersApi.getStats(),
  })
}

// Hook pour créer un tender
export function useCreateTender() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTenderInput) => tendersApi.create(data),
    onSuccess: data => {
      // Invalider les listes de tenders
      queryClient.invalidateQueries({ queryKey: tenderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tenderKeys.stats() })

      // Ajouter le nouveau tender au cache
      queryClient.setQueryData(tenderKeys.detail(data.id), data)

      toast({
        title: 'Succès',
        description: "Appel d'offres créé avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook pour mettre à jour un tender
export function useUpdateTender() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTenderInput }) =>
      tendersApi.update(id, data),
    onSuccess: (data, variables) => {
      // Mettre à jour le cache
      queryClient.setQueryData(tenderKeys.detail(variables.id), data)

      // Invalider les listes pour refléter les changements
      queryClient.invalidateQueries({ queryKey: tenderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tenderKeys.stats() })

      toast({
        title: 'Succès',
        description: "Appel d'offres mis à jour avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook pour supprimer un tender
export function useDeleteTender() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tendersApi.delete(id),
    onSuccess: (_, id) => {
      // Retirer du cache
      queryClient.removeQueries({ queryKey: tenderKeys.detail(id) })

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: tenderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tenderKeys.stats() })

      toast({
        title: 'Succès',
        description: "Appel d'offres supprimé avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook pour publier un tender
export function usePublishTender() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tendersApi.publish(id),
    onSuccess: (data, id) => {
      // Mettre à jour le cache
      queryClient.setQueryData(tenderKeys.detail(id), data)

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: tenderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tenderKeys.stats() })

      toast({
        title: 'Succès',
        description: "Appel d'offres publié avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

// Hook pour archiver un tender
export function useArchiveTender() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => tendersApi.archive(id),
    onSuccess: (data, id) => {
      // Mettre à jour le cache
      queryClient.setQueryData(tenderKeys.detail(id), data)

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: tenderKeys.lists() })
      queryClient.invalidateQueries({ queryKey: tenderKeys.stats() })

      toast({
        title: 'Succès',
        description: "Appel d'offres archivé avec succès",
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
