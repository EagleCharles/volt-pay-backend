import { NETWORK_OPERATOR } from 'lib/enums/vtu.enum';

interface IVtuBaseRes {
  request: string;
  status: string;
}

export interface IVtuBalance extends IVtuBaseRes {
  balance: string;
  currency: string;
}

export interface IVtuDataPlan {
  plan: string;
  label: string;
  validity: string;
  price: string;
  operator: string;
  currency: string;
}

export interface IVtuDataPlans extends IVtuBaseRes {
  data: IVtuDataPlan[];
}

export interface ITopupRes extends IVtuBaseRes {
  transaction_id: string;
  transaction_status: string;
}

export interface IVtuTransaction {
  transaction_id: string;
  description: string;
  datetime: string;
  phone: string;
  operator: string;
  status: 'completed' | 'queued' | 'failed';
}

export interface IVtuTransactions extends IVtuBaseRes {
  data: IVtuTransaction[];
}

export interface ITopup {
  phone: string;
  plan: string;
  operator: NETWORK_OPERATOR;
  type: 'airtime' | 'data';
}
