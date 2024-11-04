import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.schema';
import { ApiProperty } from '@nestjs/swagger';
import { NETWORK_OPERATOR } from 'lib/enums/vtu.enum';
import { HydratedDocument } from 'mongoose';

export type VoltPayTransactionDocument = HydratedDocument<VoltPayTransaction>;

@Schema()
export class VoltPayTransaction extends Base {
  @ApiProperty()
  @Prop({ default: '' })
  address: string;

  @ApiProperty()
  @Prop({ default: '' })
  package: string;

  @ApiProperty()
  @Prop({ default: '' })
  provider: NETWORK_OPERATOR | '';

  @ApiProperty()
  @Prop({ default: '' })
  providerImage: string;

  @ApiProperty()
  @Prop({ default: '' })
  recipient: string;

  @ApiProperty()
  @Prop({ default: 0 })
  amount: number;

  @ApiProperty()
  @Prop({ default: 0 })
  algoPrice: number;

  @ApiProperty()
  @Prop({ default: '' })
  type: 'airtime' | 'data';
}

export const VoltPayTransactionSchema = SchemaFactory.createForClass(VoltPayTransaction);
