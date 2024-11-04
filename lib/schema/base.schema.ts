import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export abstract class Base {
  @ApiProperty()
  @Prop({ default: Date.now })
  createdAt: Date;

  @ApiProperty()
  @Prop({ default: Date.now })
  updatedAt: Date;
}
