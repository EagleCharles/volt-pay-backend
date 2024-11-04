import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OracleService } from './oracle.service';

@Injectable()
export class OracleCronService {
  private readonly logger = new Logger(OracleCronService.name);

  constructor(private readonly oracleService: OracleService) {}

  // every 10 seconds
  @Cron('*/10 * * * * *')
  handleCron() {
    this.logger.log('Querying indexer for transaction');
    this.oracleService.triggerRequestLoading();
  }
}
