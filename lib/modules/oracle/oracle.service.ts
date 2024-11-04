import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import algosdk from 'algosdk';
import { NETWORK_OPERATOR } from 'lib/enums/vtu.enum';
import { IDecodedTransaction } from 'lib/interfaces/oracle.interface';
import { ITopup } from 'lib/interfaces/vtu.interface';
import { IndexerLog } from 'lib/schema/indexer-log.schema';
import { env } from 'lib/utils/env';
import { Model } from 'mongoose';
import { VoltPayService } from '../volt-pay/volt-pay.service';

@Injectable()
export class OracleService {
  private readonly NOTE_PREFIX = Buffer.from(env.VTU_TX_NOTE_PREFIX, 'utf-8');
  private readonly logger = new Logger(OracleService.name);
  private readonly applicationId = BigInt(env.VTU_CONTRACT_ID);
  indexerClient: algosdk.Indexer;
  constructor(
    @InjectModel(IndexerLog.name) private readonly indexerLogModel: Model<IndexerLog>,
    private readonly voltPayService: VoltPayService,
  ) {
    this.indexerClient = new algosdk.Indexer(
      process.env.INDEXER_TOKEN,
      process.env.INDEXER_SERVER,
      process.env.INDEXER_PORT,
    );
  }

  async triggerRequestLoading() {
    const lastRound = await this.getLastProcessedRound();
    this.logger.debug(`Last round processed was ${lastRound}`);

    const newLastRound = await this.loadOracleRequestsFromRound(lastRound + BigInt(1));
    this.logger.debug(`Loaded new requests until round ${newLastRound}`);

    await this.updateLastProcessedRound(newLastRound);
  }

  async loadOracleRequestsFromRound(startRound: bigint): Promise<bigint> {
    let nextToken: string | null = '';
    let lastIndexedRound = await this.getLastIndexedRound();

    while (nextToken !== null) {
      const searchParams = this.indexerClient
        .searchForTransactions()
        .notePrefix(this.NOTE_PREFIX)
        .minRound(startRound)
        .maxRound(lastIndexedRound);

      if (nextToken) searchParams.nextToken(nextToken);

      try {
        const response = await searchParams.do();

        const oracleRequests = response.transactions.filter((transaction) =>
          this.isSupportedTransaction(transaction),
        );

        await this.createOracleRequests(oracleRequests);

        nextToken = response['next-token'] || null; // Assigns `nextToken` for the next page
      } catch (error) {
        this.logger.error('An error occurred while querying transactions', error);
        throw error;
      }
    }
    return lastIndexedRound;
  }

  private isSupportedTransaction(transaction: algosdk.indexerModels.Transaction): boolean {
    // Check transaction fields here
    const isSupported =
      transaction.txType === 'appl' &&
      transaction.applicationTransaction.onCompletion === 'noop' && // NOOP meaning the transaction was successful
      transaction.applicationTransaction.applicationId === this.applicationId &&
      transaction.applicationTransaction.applicationArgs.length === 5;

    this.logger.debug(
      `Found ${isSupported ? '' : 'not '}supported transaction:`,
      // JSON.parse(
      //   JSON.stringify(transaction, (key, value) =>
      //     typeof value === 'bigint' ? value.toString() : value,
      //   ),
      // ),
    );

    return isSupported;
  }

  private async getLastIndexedRound(): Promise<bigint> {
    try {
      const response = await this.indexerClient.makeHealthCheck().do();

      return response.round;
    } catch (error) {
      throw new Error('Could not get the last indexed round.' + error);
    }
  }

  private async getLastProcessedRound(): Promise<bigint> {
    const lastProcessed = await this.indexerLogModel.findOne().sort({ blockNumber: -1 });

    if (!lastProcessed) {
      const lastIndexedRound = await this.getLastIndexedRound();

      await this.indexerLogModel.create({ blockNumber: lastIndexedRound - BigInt(10) });

      return lastIndexedRound - BigInt(10);
    }

    return lastProcessed.blockNumber;
  }

  private async updateLastProcessedRound(round: bigint): Promise<void> {
    // empty document then create new entry
    await this.indexerLogModel.deleteMany({});
    await this.indexerLogModel.create({ blockNumber: round });
  }

  private async createOracleRequests(
    transactions: algosdk.indexerModels.Transaction[],
  ): Promise<void> {
    /* Implement as needed */
    // console.log(transactions);
    this.logger.debug(`Creating ${transactions.length} oracle requests`);

    for (const transaction of transactions) {
      try {
        const tx = this.decodeTransaction(transaction);

        await this.voltPayService.completeTransaction(tx);
        this.logger.log('Completed transaction to ' + tx.sender);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private decodeTransaction(transaction: algosdk.indexerModels.Transaction): IDecodedTransaction {
    console.log('--------Decoding Transaction--------');
    const { sender } = transaction; //address of sender
    let index = 0;
    const topup: ITopup = {} as ITopup;

    for (const arg of transaction.applicationTransaction.applicationArgs) {
      if (index === 0) {
        index++;
        continue;
      }
      // change uint8array to string
      const valueWithLength = new TextDecoder().decode(arg);
      const lengthPrefix = valueWithLength.charCodeAt(1); // Extract the length from the second byte
      const value: any = valueWithLength.slice(2, 2 + lengthPrefix); // Slice to get the actual value string

      switch (index) {
        case 1:
          topup.phone = value;
          break;
        case 2:
          topup.operator = value;
          break;
        case 3:
          topup.type = value;
          break;
        case 4:
          topup.plan = value;
          break;
      }

      index++;
    }

    const decodedTransaction: IDecodedTransaction = {
      topupParams: topup,
      sender,
      microAlgos: transaction.innerTxns[0]?.paymentTransaction?.amount || BigInt(0),
    };
    console.log(decodedTransaction);
    console.log('--------End Decoding Transaction--------');
    return decodedTransaction;
  }
}
