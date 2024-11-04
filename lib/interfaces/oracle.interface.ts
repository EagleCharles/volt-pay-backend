import algosdk from 'algosdk';
import { ITopup } from './vtu.interface';

export interface IDecodedTransaction {
  topupParams: ITopup;
  sender: string;
  microAlgos: bigint;
}
