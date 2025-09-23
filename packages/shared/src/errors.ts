/**
 * Custom error classes for TalentFlow application
 */

export class TalentFlowError extends Error {
  public statusCode: number
  public code: string
  public cause?: unknown

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.name = 'TalentFlowError'
    this.statusCode = statusCode
    this.code = code
  }
}

export class ValidationError extends TalentFlowError {
  constructor(message: string, cause?: unknown) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
    if (cause) {
      this.cause = cause
    }
  }
}

export class NotFoundError extends TalentFlowError {
  constructor(message: string, cause?: unknown) {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
    if (cause) {
      this.cause = cause
    }
  }
}

export class UnauthorizedError extends TalentFlowError {
  constructor(message: string) {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends TalentFlowError {
  constructor(message: string) {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error: unknown) {
  if (error instanceof TalentFlowError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }

  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    }
  }

  return {
    success: false,
    error: "Une erreur inconnue s'est produite",
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  }
}
