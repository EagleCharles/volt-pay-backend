import { Module } from '@nestjs/common';
import { OracleService } from './oracle.service';
import { OracleCronService } from './oracle-cron.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VoltPayTransaction,
  VoltPayTransactionSchema,
} from 'lib/schema/volt-pay-transaction.schema';
import { IndexerLog, IndexerLogSchema } from 'lib/schema/indexer-log.schema';
import { VoltPayModule } from '../volt-pay/volt-pay.module';

@Module({
  providers: [OracleService, OracleCronService],
  exports: [OracleService, OracleCronService],
  imports: [
    MongooseModule.forFeature([
      { name: VoltPayTransaction.name, schema: VoltPayTransactionSchema },
      { name: IndexerLog.name, schema: IndexerLogSchema },
    ]),
    VoltPayModule,
  ],
})
export class OracleModule {}
