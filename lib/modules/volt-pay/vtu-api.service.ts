import { Injectable, RequestMethod } from '@nestjs/common';
import axios, { Method } from 'axios';
import { NETWORK_OPERATOR } from 'lib/enums/vtu.enum';
import { ITopupRes, IVtuBalance, IVtuDataPlans } from 'lib/interfaces/vtu.interface';
import { env } from 'lib/utils/env';

@Injectable()
export class VtuApiService {
  async getHello(): Promise<string> {
    return 'Hello World!';
  }

  async checkBalance(): Promise<IVtuBalance> {
    return this.request({
      method: 'POST',
      endpoint: '/check_balance',
      body: { currency: 'NGN' },
    });
  }

  async checkDataPlans(operator: NETWORK_OPERATOR): Promise<IVtuDataPlans> {
    return this.request({
      method: 'POST',
      endpoint: '/fetch_data_plans',
      body: { operator },
    });
  }

  async lookupOperator(phone: string) {
    return this.request({
      method: 'POST',
      endpoint: '/number_operator',
      body: { phone },
    });
  }

  async topupAirtime({
    phone,
    amount,
    operator,
  }: {
    phone: string;
    amount: number;
    operator: NETWORK_OPERATOR;
  }): Promise<ITopupRes> {
    return this.request({
      method: 'POST',
      endpoint: '/topup',
      body: { phone, value: amount, operator, type: 'airtime' },
    });
  }

  async topupData({
    phone,
    operator,
    plan,
  }: {
    phone: string;
    operator: NETWORK_OPERATOR;
    plan: string;
  }): Promise<ITopupRes> {
    return this.request({
      method: 'POST',
      endpoint: '/topup',
      body: { phone, value: plan, operator, type: 'data' },
    });
  }

  async queryTransaction(txId: string) {
    return this.request({
      method: 'POST',
      endpoint: '/query_transaction',
      body: { transaction_id: txId },
    });
  }

  async fetchTransactions() {
    return this.request({
      method: 'POST',
      endpoint: '/list_transactions',
      body: { limit: 0 },
    });
  }

  async test() {
    return this.checkDataPlans(NETWORK_OPERATOR.MTN);
  }

  private async request({
    method,
    endpoint,
    body,
  }: {
    method: Method;
    endpoint: string;
    body: Record<string, any>;
  }) {
    let parsedEndpoint = endpoint[0] === '/' ? endpoint : `/${endpoint}`;

    let parsedBody = new URLSearchParams();

    for (let key in body) {
      parsedBody.append(key, body[key]);
    }

    const url = `${env.VTU_API_URL}/${env.VTU_API_KEY}${parsedEndpoint}`;

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Api-Token': env.VTU_API_TOKEN,
      'Request-Id': `${Date.now()}`,
    };

    const res = await axios({ method, url, data: parsedBody, headers });
    return res.data;
  }
}
