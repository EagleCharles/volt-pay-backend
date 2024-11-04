import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { AppController, VoltPayController } from './controllers';
import { VoltPayModule } from 'lib/modules/volt-pay/volt-pay.module';
import { MongooseModule } from '@nestjs/mongoose';
import { env } from 'lib/utils/env';
import { ScheduleModule } from '@nestjs/schedule';
import { OracleModule } from 'lib/modules/oracle/oracle.module';

@Module({
  imports: [
    MongooseModule.forRoot(env.MONGODB_URI, { dbName: env.MONGODB_DATABASE }),
    VoltPayModule,
    ScheduleModule.forRoot(),
    OracleModule,
  ],
  controllers: [AppController, VoltPayController],
  providers: [AppService],
})
export class AppModule {}
