import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { Public } from 'nest-keycloak-connect'
import { PrismaClient } from '@talentflow/database'
import { ConfigService } from '@nestjs/config'

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly config: ConfigService
  ) {}

  @Get()
  @ApiOperation({ summary: "Vérifier la santé de l'application" })
  @ApiResponse({ status: 200, description: 'Application en bonne santé' })
  @ApiResponse({ status: 503, description: 'Service indisponible' })
  async check() {
    const startTime = Date.now()

    // Vérifier la base de données
    let dbStatus = 'healthy'
    let dbResponseTime = 0
    let dbError = null

    try {
      const dbStart = Date.now()
      await this.prisma.$queryRaw`SELECT 1`
      dbResponseTime = Date.now() - dbStart
    } catch (error) {
      dbStatus = 'down'
      dbError = error.message
    }

    // Vérifier Redis (si configuré)
    let redisStatus = 'healthy'
    const redisHost = this.config.get('REDIS_HOST')
    if (!redisHost) {
      redisStatus = 'not_configured'
    }

    const responseTime = Date.now() - startTime
    const overallStatus = dbStatus === 'healthy' ? 'healthy' : 'degraded'

    const healthData = {
      status: overallStatus,
      services: {
        database: {
          status: dbStatus,
          responseTime: dbResponseTime,
          lastCheck: new Date().toISOString(),
          ...(dbError && { error: dbError }),
        },
        redis: {
          status: redisStatus,
          lastCheck: new Date().toISOString(),
        },
        api: {
          status: 'healthy',
          responseTime,
          lastCheck: new Date().toISOString(),
        },
      },
      uptime: process.uptime(),
      version: this.config.get('npm_package_version', '1.0.0'),
      environment: this.config.get('NODE_ENV', 'development'),
      timestamp: new Date().toISOString(),
    }

    return healthData
  }

  @Get('ready')
  @ApiOperation({ summary: "Vérifier si l'application est prête" })
  @ApiResponse({ status: 200, description: 'Application prête' })
  @ApiResponse({ status: 503, description: 'Application non prête' })
  async ready() {
    try {
      // Vérifier la connexion à la base de données
      await this.prisma.$queryRaw`SELECT 1`

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      throw new Error('Database connection failed')
    }
  }

  @Get('live')
  @ApiOperation({ summary: "Vérifier si l'application est vivante" })
  @ApiResponse({ status: 200, description: 'Application vivante' })
  async live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }
  }
}
