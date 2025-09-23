import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, body, query, params } = request
    const userAgent = request.get('user-agent') || ''
    const ip = request.ip
    const userId = request.user?.sub
    const tenantId = request.user?.tenant_id

    const now = Date.now()

    this.logger.log(
      `Incoming Request: ${method} ${url} - ${userAgent} ${ip} - User: ${userId} - Tenant: ${tenantId}`
    )

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse()
        const { statusCode } = response
        const responseTime = Date.now() - now

        this.logger.log(
          `Outgoing Response: ${method} ${url} ${statusCode} - ${responseTime}ms - User: ${userId} - Tenant: ${tenantId}`
        )
      })
    )
  }
}
