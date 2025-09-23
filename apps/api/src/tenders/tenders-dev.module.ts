import { Module } from '@nestjs/common'
import { TendersDevController } from './tenders-dev.controller'
import { TendersService } from './tenders.service'
import { PublicationsService } from './publications.service'

@Module({
  controllers: [TendersDevController],
  providers: [TendersService, PublicationsService],
  exports: [TendersService],
})
export class TendersDevModule {}
