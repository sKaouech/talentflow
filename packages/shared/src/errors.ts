// Classes d'erreur personnalisées pour TalentFlow

export class TalentFlowError extends Error {
  public code: string
  public statusCode: number
  public details?: any

  constructor(message: string, code: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = 'TalentFlowError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

// Erreurs d'authentification
export class AuthenticationError extends TalentFlowError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'AUTHENTICATION_FAILED', 401, details)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends TalentFlowError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 'ACCESS_DENIED', 403, details)
    this.name = 'AuthorizationError'
  }
}

export class TokenExpiredError extends TalentFlowError {
  constructor(message: string = 'Token has expired', details?: any) {
    super(message, 'TOKEN_EXPIRED', 401, details)
    this.name = 'TokenExpiredError'
  }
}

// Erreurs de validation
export class ValidationError extends TalentFlowError {
  constructor(message: string = 'Validation failed', details?: any) {
    super(message, 'VALIDATION_FAILED', 400, details)
    this.name = 'ValidationError'
  }
}

export class SchemaValidationError extends ValidationError {
  constructor(message: string = 'Schema validation failed', details?: any) {
    super(message, details)
    this.code = 'SCHEMA_VALIDATION_FAILED'
    this.name = 'SchemaValidationError'
  }
}

// Erreurs de ressources
export class NotFoundError extends TalentFlowError {
  constructor(resource: string = 'Resource', id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`
    super(message, 'RESOURCE_NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends TalentFlowError {
  constructor(message: string = 'Resource conflict', details?: any) {
    super(message, 'RESOURCE_CONFLICT', 409, details)
    this.name = 'ConflictError'
  }
}

export class DuplicateError extends ConflictError {
  constructor(resource: string, field: string, value: string) {
    super(`${resource} with ${field} '${value}' already exists`)
    this.code = 'DUPLICATE_RESOURCE'
    this.name = 'DuplicateError'
  }
}

// Erreurs de tenant/multi-tenancy
export class TenantNotFoundError extends NotFoundError {
  constructor(tenantId?: string) {
    super('Tenant', tenantId)
    this.code = 'TENANT_NOT_FOUND'
    this.name = 'TenantNotFoundError'
  }
}

export class TenantAccessError extends AuthorizationError {
  constructor(tenantId: string) {
    super(`Access denied to tenant '${tenantId}'`)
    this.code = 'TENANT_ACCESS_DENIED'
    this.name = 'TenantAccessError'
  }
}

export class TenantLimitExceededError extends TalentFlowError {
  constructor(limitType: string, limit: number) {
    super(`Tenant limit exceeded for ${limitType}. Maximum allowed: ${limit}`, 'TENANT_LIMIT_EXCEEDED', 402)
    this.name = 'TenantLimitExceededError'
  }
}

// Erreurs de fichiers
export class FileUploadError extends TalentFlowError {
  constructor(message: string = 'File upload failed', details?: any) {
    super(message, 'FILE_UPLOAD_FAILED', 400, details)
    this.name = 'FileUploadError'
  }
}

export class FileSizeLimitError extends FileUploadError {
  constructor(maxSize: number) {
    super(`File size exceeds limit of ${maxSize} bytes`)
    this.code = 'FILE_SIZE_LIMIT_EXCEEDED'
    this.name = 'FileSizeLimitError'
  }
}

export class FileTypeNotAllowedError extends FileUploadError {
  constructor(fileType: string, allowedTypes: string[]) {
    super(`File type '${fileType}' not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    this.code = 'FILE_TYPE_NOT_ALLOWED'
    this.name = 'FileTypeNotAllowedError'
  }
}

// Erreurs d'intégration
export class IntegrationError extends TalentFlowError {
  constructor(service: string, message: string = 'Integration failed', details?: any) {
    super(`${service}: ${message}`, 'INTEGRATION_FAILED', 502, details)
    this.name = 'IntegrationError'
  }
}

export class LinkedInIntegrationError extends IntegrationError {
  constructor(message: string = 'LinkedIn integration failed', details?: any) {
    super('LinkedIn', message, details)
    this.code = 'LINKEDIN_INTEGRATION_FAILED'
    this.name = 'LinkedInIntegrationError'
  }
}

export class N8nIntegrationError extends IntegrationError {
  constructor(message: string = 'n8n integration failed', details?: any) {
    super('n8n', message, details)
    this.code = 'N8N_INTEGRATION_FAILED'
    this.name = 'N8nIntegrationError'
  }
}

// Erreurs de paiement
export class PaymentError extends TalentFlowError {
  constructor(message: string = 'Payment failed', details?: any) {
    super(message, 'PAYMENT_FAILED', 402, details)
    this.name = 'PaymentError'
  }
}

export class SubscriptionError extends PaymentError {
  constructor(message: string = 'Subscription error', details?: any) {
    super(message, details)
    this.code = 'SUBSCRIPTION_ERROR'
    this.name = 'SubscriptionError'
  }
}

// Erreurs de rate limiting
export class RateLimitError extends TalentFlowError {
  constructor(limit: number, windowMs: number) {
    super(`Rate limit exceeded. Maximum ${limit} requests per ${windowMs}ms`, 'RATE_LIMIT_EXCEEDED', 429)
    this.name = 'RateLimitError'
  }
}

// Erreurs de base de données
export class DatabaseError extends TalentFlowError {
  constructor(message: string = 'Database error', details?: any) {
    super(message, 'DATABASE_ERROR', 500, details)
    this.name = 'DatabaseError'
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed') {
    super(message)
    this.code = 'DATABASE_CONNECTION_FAILED'
    this.name = 'ConnectionError'
  }
}

// Utilitaire pour créer une réponse d'erreur standardisée
export function createErrorResponse(error: Error) {
  if (error instanceof TalentFlowError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    }
  }

  // Erreur générique
  return {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  }
}

// Utilitaire pour vérifier le type d'erreur
export function isAppError(error: any): error is TalentFlowError {
  return error instanceof TalentFlowError
}
