import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * Décorateur pour extraire le tenant_id depuis le JWT
 */
export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    if (!user || !user.tenant_id) {
      throw new Error('Tenant ID not found in JWT token')
    }

    // Définir le tenant_id global pour le middleware Prisma
    ;(global as any).currentTenantId = user.tenant_id

    return user.tenant_id
  }
)

/**
 * Décorateur pour extraire l'utilisateur complet depuis le JWT
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
