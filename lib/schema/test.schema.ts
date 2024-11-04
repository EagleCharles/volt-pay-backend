import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Base } from './base.schema';
import { HydratedDocument } from 'mongoose';

export type TestDocument = HydratedDocument<Test>;

@Schema()
export class Test extends Base {
  @ApiProperty()
  @Prop({ default: '' })
  name: string;

  @ApiProperty()
  @Prop({ default: '' })
  description: string;
}

export const TestSchema = SchemaFactory.createForClass(Test);
