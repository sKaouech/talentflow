import { Module } from '@nestjs/common'
import { TendersController } from './tenders.controller'
import { TendersService } from './tenders.service'
import { PublicationsService } from './publications.service'

@Module({
  controllers: [TendersController],
  providers: [TendersService, PublicationsService],
  exports: [TendersService],
})
export class TendersModule {}
