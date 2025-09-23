import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'

// Configuration de base pour l'API
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

// Instance Axios principale
export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    // En développement, on simule un token
    // En production, récupérer le token depuis le contexte d'authentification
    const token = process.env.NODE_ENV === 'development' 
      ? 'dev-token-simulation' 
      : localStorage.getItem('access_token')
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    // Extraire les données de la réponse standardisée
    return response.data.success ? response.data.data : response.data
  },
  (error) => {
    // Gestion centralisée des erreurs
    if (error.response) {
      // Erreur HTTP avec réponse du serveur
      const errorData = error.response.data
      
      if (error.response.status === 401) {
        // Token expiré ou invalide
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
      }
      
      // Retourner l'erreur formatée
      throw new Error(errorData?.error?.message || 'Une erreur est survenue')
    } else if (error.request) {
      // Erreur réseau
      throw new Error('Erreur de connexion au serveur')
    } else {
      // Autre erreur
      throw new Error(error.message)
    }
  }
)

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      pages: number
    }
    timestamp: string
    version: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Client API spécialisé pour les tenders
export const tendersApi = {
  // Rechercher des tenders
  search: (params: any): Promise<PaginatedResponse<any>> =>
    api.get('/tenders', { params }),

  // Créer un tender
  create: (data: any): Promise<any> =>
    api.post('/tenders', data),

  // Récupérer un tender par ID
  getById: (id: string): Promise<any> =>
    api.get(`/tenders/${id}`),

  // Mettre à jour un tender
  update: (id: string, data: any): Promise<any> =>
    api.put(`/tenders/${id}`, data),

  // Supprimer un tender
  delete: (id: string): Promise<void> =>
    api.delete(`/tenders/${id}`),

  // Publier un tender
  publish: (id: string): Promise<any> =>
    api.post(`/tenders/${id}/publish`),

  // Archiver un tender
  archive: (id: string): Promise<any> =>
    api.post(`/tenders/${id}/archive`),

  // Obtenir les statistiques
  getStats: (): Promise<any> =>
    api.get('/tenders/stats'),

  // Publications
  getPublications: (tenderId: string): Promise<any[]> =>
    api.get(`/tenders/${tenderId}/publications`),

  createPublication: (tenderId: string, data: any): Promise<any> =>
    api.post(`/tenders/${tenderId}/publications`, data),

  publishPublication: (tenderId: string, publicationId: string): Promise<any> =>
    api.post(`/tenders/${tenderId}/publications/${publicationId}/publish`),
}

export default api
