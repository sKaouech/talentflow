import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Response } from 'express'
import { TalentFlowError, createErrorResponse } from '@talentflow/shared'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest()

    let status: number
    let errorResponse: any

    if (exception instanceof TalentFlowError) {
      // Erreurs métier personnalisées
      status = exception.statusCode
      errorResponse = createErrorResponse(exception)
    } else if (exception instanceof HttpException) {
      // Erreurs HTTP NestJS
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      errorResponse = {
        success: false,
        error: {
          code: 'HTTP_EXCEPTION',
          message:
            typeof exceptionResponse === 'string'
              ? exceptionResponse
              : (exceptionResponse as any).message || exception.message,
          details:
            typeof exceptionResponse === 'object'
              ? exceptionResponse
              : undefined,
        },
      }
    } else {
      // Erreurs inattendues
      status = HttpStatus.INTERNAL_SERVER_ERROR
      errorResponse = {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
        },
      }

      // Log des erreurs inattendues
      this.logger.error(
        `Unexpected error: ${exception}`,
        (exception as Error).stack,
        `${request.method} ${request.url}`
      )
    }

    // Ajouter les métadonnées
    errorResponse.meta = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      version: 'v1',
    }

    response.status(status).json(errorResponse)
  }
}
