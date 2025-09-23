// Types utilitaires génériques

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

export interface SearchFilters {
  [key: string]: any
}

export interface SortOptions {
  field: string
  order: 'asc' | 'desc'
}

export interface FileUploadResult {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
}

export interface NotificationData {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  actions?: Array<{
    label: string
    action: string
    data?: any
  }>
}

export interface AuditLogData {
  id: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  metadata: Record<string, any>
  ipAddress?: string
  userAgent?: string
  userId?: string
  tenantId?: string
  occurredAt: string
}

export interface WebhookPayload {
  event: string
  data: any
  timestamp: string
  signature: string
}

export interface IntegrationConfig {
  enabled: boolean
  settings: Record<string, any>
  webhookUrl?: string
  apiKey?: string
}

export interface CVGenerationOptions {
  templateId: string
  customization?: {
    colors?: {
      primary?: string
      secondary?: string
    }
    fonts?: {
      heading?: string
      body?: string
    }
    sections?: {
      [key: string]: boolean
    }
  }
  format: 'pdf' | 'docx'
}

export interface PublicationOptions {
  platform: 'linkedin' | 'indeed' | 'apec' | 'leboncoin'
  scheduledAt?: string
  customContent?: {
    title?: string
    description?: string
    hashtags?: string[]
  }
}

export interface AnalyticsData {
  period: {
    start: string
    end: string
  }
  metrics: {
    [key: string]: {
      value: number
      change?: number
      changePercent?: number
    }
  }
  charts: {
    [key: string]: Array<{
      date: string
      value: number
    }>
  }
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down'
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'degraded' | 'down'
      responseTime?: number
      lastCheck: string
      error?: string
    }
  }
  uptime: number
  version: string
}
