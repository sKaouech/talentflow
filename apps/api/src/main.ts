import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import compression from 'compression'
import { AppModule } from './app.module'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const logger = new Logger('Bootstrap')

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
    })
  )

  // Compression
  app.use(compression())

  // CORS
  app.enableCors({
    origin: configService
      .get('CORS_ORIGINS', 'http://localhost:3000')
      .split(','),
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  )

  // Global filters
  app.useGlobalFilters(new AllExceptionsFilter())

  // Global interceptors
  app.useGlobalInterceptors(new ResponseInterceptor(), new LoggingInterceptor())

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('TalentFlow API')
      .setDescription(
        "API pour la plateforme TalentFlow - Gestion des appels d'offres et candidats"
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentification et autorisation')
      .addTag('tenders', "Gestion des appels d'offres")
      .addTag('candidates', 'Gestion des candidats')
      .addTag('users', 'Gestion des utilisateurs')
      .addTag('health', "Santé de l'application")
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)
  }

  const port = configService.get('PORT', 3001)
  await app.listen(port)

  logger.log(`🚀 Application is running on: http://localhost:${port}`)
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`)
}

bootstrap()
