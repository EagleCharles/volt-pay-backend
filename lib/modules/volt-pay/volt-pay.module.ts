import { Module } from '@nestjs/common';
import { VoltPayService } from './volt-pay.service';
import { VtuApiService } from './vtu-api.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  VoltPayTransaction,
  VoltPayTransactionSchema,
} from 'lib/schema/volt-pay-transaction.schema';
import { SocketGateway } from './socket.provider';

@Module({
  providers: [VoltPayService, VtuApiService, SocketGateway],
  exports: [VoltPayService, VtuApiService],
  imports: [
    MongooseModule.forFeature([
      { name: VoltPayTransaction.name, schema: VoltPayTransactionSchema },
    ]),
  ],
})
export class VoltPayModule {}
