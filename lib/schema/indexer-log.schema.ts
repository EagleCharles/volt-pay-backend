import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Base } from './base.schema';
import { HydratedDocument } from 'mongoose';

export type IndexerLogDocument = HydratedDocument<IndexerLog>;

@Schema()
export class IndexerLog extends Base {
  @Prop({ default: 0 })
  blockNumber: bigint;
}

export const IndexerLogSchema = SchemaFactory.createForClass(IndexerLog);
