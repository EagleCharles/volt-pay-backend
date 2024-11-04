import { ApiProperty } from '@nestjs/swagger';
import { NETWORK_OPERATOR } from 'lib/enums/vtu.enum';

export class NetworkOperatorDto {
  @ApiProperty({
    enum: NETWORK_OPERATOR,
  })
  operator: NETWORK_OPERATOR;

  @ApiProperty()
  operatorImage: string;
}

export class DataPackageItemDto {
  @ApiProperty()
  operator: string;

  @ApiProperty()
  plan: string;

  @ApiProperty()
  label: string;

  @ApiProperty()
  validity: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  description: string;
}

export class DataPackagesDto extends NetworkOperatorDto {
  @ApiProperty({ type: DataPackageItemDto, isArray: true })
  packages: DataPackageItemDto[];
}

export class TransactionHistoryDto {
  @ApiProperty()
  address: string;

  @ApiProperty()
  package: string;

  @ApiProperty()
  provider: { name: NETWORK_OPERATOR; image: string };

  @ApiProperty()
  recipient: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  type: 'airtime' | 'data';

  @ApiProperty()
  date: Date;
}

export class SocketNotificationDto {
  topic: string;
  payload: TransactionHistoryDto;
}
