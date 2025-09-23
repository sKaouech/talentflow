import slugify from 'slugify'
import { format, parseISO } from 'date-fns'

/**
 * Generate a URL-friendly slug from text
 */
export function createSlug(text: string): string {
  return slugify(text, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  })
}

/**
 * Format a date string
 */
export function formatDate(dateString: string, formatStr = 'dd/MM/yyyy'): string {
  return format(parseISO(dateString), formatStr)
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}