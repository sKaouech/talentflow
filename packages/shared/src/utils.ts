import slugify from 'slugify'
import { format, parseISO, isValid } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * Génère un slug à partir d'une chaîne
 */
export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    locale: 'fr',
  })
}

/**
 * Formate une date selon le format spécifié
 */
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    if (!isValid(dateObj)) return ''
    return format(dateObj, formatStr, { locale: fr })
  } catch {
    return ''
  }
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Génère un nom complet à partir du prénom et nom
 */
export function getFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

/**
 * Génère des initiales à partir du prénom et nom
 */
export function getInitials(firstName: string, lastName: string): string {
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()
  return `${firstInitial}${lastInitial}`
}

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Génère une couleur hexadécimale aléatoire
 */
export function generateRandomColor(): string {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - ellipsis.length) + ellipsis
}

/**
 * Capitalise la première lettre d'une chaîne
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convertit une taille en bytes en format lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Génère un nom de fichier unique
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '')
  const safeName = createSlug(nameWithoutExtension)
  
  return `${safeName}-${timestamp}-${random}.${extension}`
}

/**
 * Détermine si une URL est absolue
 */
export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//.test(url)
}

/**
 * Nettoie et valide une URL
 */
export function cleanUrl(url: string): string | null {
  if (!url) return null
  
  // Ajoute https:// si aucun protocole n'est spécifié
  if (!/^https?:\/\//.test(url)) {
    url = `https://${url}`
  }
  
  try {
    const urlObj = new URL(url)
    return urlObj.toString()
  } catch {
    return null
  }
}

/**
 * Génère un token aléatoire
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Valide un slug
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * Extrait le domaine d'une URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return null
  }
}

/**
 * Génère un avatar par défaut basé sur les initiales
 */
export function generateAvatarUrl(firstName: string, lastName: string): string {
  const initials = getInitials(firstName, lastName)
  const backgroundColor = generateRandomColor().substring(1) // Remove #
  return `https://ui-avatars.com/api/?name=${initials}&background=${backgroundColor}&color=ffffff&size=200`
}

/**
 * Calcule la différence en jours entre deux dates
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Vérifie si une date est dans le futur
 */
export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj > new Date()
}

/**
 * Vérifie si une date est dans le passé
 */
export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj < new Date()
}
