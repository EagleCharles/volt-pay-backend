import { Injectable, Logger } from '@nestjs/common';
import { VtuApiService } from './vtu-api.service';
import { DataPackagesDto, NetworkOperatorDto, TransactionHistoryDto } from 'lib/dto/volt-pay.dto';
import { NETWORK_OPERATOR } from 'lib/enums/vtu.enum';
import { NETWORK_OPERATOR_IMAGE } from 'lib/constants';
import { commaFormat } from 'lib/utils/comma-format';
import { InjectModel } from '@nestjs/mongoose';
import { VoltPayTransaction } from 'lib/schema/volt-pay-transaction.schema';
import { Model } from 'mongoose';
import { ITopup } from 'lib/interfaces/vtu.interface';
import { IDecodedTransaction } from 'lib/interfaces/oracle.interface';
import { ngnToAlgo } from 'lib/constants/ngn-to-algo.constant';
import { SocketGateway } from './socket.provider';

@Injectable()
export class VoltPayService {
  private readonly logger = new Logger(VoltPayService.name);
  constructor(
    private readonly vtuApiService: VtuApiService,
    @InjectModel(VoltPayTransaction.name)
    private readonly voltPayTransactionModel: Model<VoltPayTransaction>,

    private readonly socketGateway: SocketGateway,
  ) {}

  async fetchDataPackages(): Promise<DataPackagesDto[]> {
    const dataPackages: DataPackagesDto[] = [];
    for (const operator of Object.values(NETWORK_OPERATOR)) {
      const res = await this.vtuApiService.checkDataPlans(operator);

      dataPackages.push({
        operator,
        operatorImage: NETWORK_OPERATOR_IMAGE[operator],
        packages: res.data.map((pkg) => ({
          operator,
          plan: pkg.plan,
          label: pkg.label,
          validity: pkg.validity,
          price: parseFloat(pkg.price),
          description: `${pkg.label} for ${pkg.validity} days ₦${commaFormat(parseFloat(pkg.price))}`,
        })),
      });
    }

    return dataPackages;
  }

  async fetchNetworkOperators(): Promise<NetworkOperatorDto[]> {
    return Object.values(NETWORK_OPERATOR).map((operator) => ({
      operator,
      operatorImage: NETWORK_OPERATOR_IMAGE[operator],
    }));
  }

  async fetchTransactionHistory(
    address: string,
    type: 'airtime' | 'data',
  ): Promise<TransactionHistoryDto[]> {
    const res = await this.voltPayTransactionModel
      .find({ address, type })
      .sort({ createdAt: -1 })
      .exec();

    return res.map((r) => {
      const parsed = r.toJSON();

      return {
        address,
        package: parsed.package,
        provider: {
          name: parsed.provider as NETWORK_OPERATOR,
          image: parsed.providerImage,
        },
        amount: parsed.amount,
        price: parsed.algoPrice,
        type,
        date: parsed.createdAt,
        recipient: parsed.recipient,
      };
    });
  }

  async completeTransaction(data: IDecodedTransaction) {
    const { topupParams, sender, microAlgos } = data;
    let pkg = '';
    let amount = 0;

    if (topupParams.type === 'airtime') {
      const { plan } = topupParams;

      amount = parseFloat(plan);

      const algoAmount = ngnToAlgo(amount);

      if (algoAmount !== Number(microAlgos) / 1000000) {
        // trigger refund
        this.logger.debug(
          `Failed to complete transaction. Algo amounts do not match: ${algoAmount} !== ${Number(microAlgos) / 1000000}`,
        );
      }
    } else {
      const { data: plans } = await this.vtuApiService.checkDataPlans(topupParams.operator);

      const selectedPlan = plans.find((p) => p.plan === topupParams.plan);

      amount = parseFloat(selectedPlan.price);

      const algoAmount = ngnToAlgo(amount);

      if (algoAmount !== Number(microAlgos) / 1000000) {
        //trigger refund
        this.logger.debug(
          `Failed to complete transaction. Algo amounts do not match: ${algoAmount} !== ${Number(microAlgos) / 1000000}`,
        );
      }

      pkg = `${selectedPlan.label} for ${selectedPlan.validity} days`;
    }

    await this.topUpTransaction(topupParams);

    const res = await this.voltPayTransactionModel.create({
      address: sender,
      package: pkg,
      provider: topupParams.operator,
      providerImage: NETWORK_OPERATOR_IMAGE[topupParams.operator],
      recipient: topupParams.phone,
      amount,
      algoPrice: Number(microAlgos) / 1000000,
      type: topupParams.type,
    });
    const parsed = res.toJSON();

    //emit notification
    this.socketGateway.emitNotificationEvent({
      topic: sender,
      payload: {
        address: sender,
        package: parsed.package,
        provider: {
          name: parsed.provider as NETWORK_OPERATOR,
          image: parsed.providerImage,
        },
        amount: parsed.amount,
        price: parsed.algoPrice,
        type: topupParams.type,
        date: parsed.createdAt,
        recipient: parsed.recipient,
      },
    });
  }

  private async topUpTransaction(data: ITopup) {
    const { phone, plan, operator, type } = data;

    if (type === 'airtime') {
      return this.vtuApiService.topupAirtime({
        phone,
        amount: parseFloat(plan),
        operator,
      });
    }

    return this.vtuApiService.topupData({
      phone,
      plan,
      operator,
    });
  }
}
