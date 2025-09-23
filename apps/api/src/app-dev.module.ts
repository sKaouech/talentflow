import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'

import { DatabaseModule } from './common/database.module'
import { TendersDevModule } from './tenders/tenders-dev.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Logging
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    }),

    // Application modules
    DatabaseModule,
    TendersDevModule,
    HealthModule,
  ],
})
export class AppDevModule {}
