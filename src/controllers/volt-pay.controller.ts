import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataPackagesDto, NetworkOperatorDto } from 'lib/dto/volt-pay.dto';
import { VoltPayService } from 'lib/modules/volt-pay/volt-pay.service';
import { VoltPayTransaction } from 'lib/schema/volt-pay-transaction.schema';

@ApiTags('VoltPay')
@Controller('volt-pay')
export class VoltPayController {
  constructor(private readonly voltPayService: VoltPayService) {}

  @ApiOperation({ summary: 'Fetch all available data packages' })
  @ApiResponse({
    status: 200,
    description: 'Returns all data packages',
    type: DataPackagesDto,
    isArray: true,
  })
  @Get('/data-packages')
  getDataPackages() {
    return this.voltPayService.fetchDataPackages();
  }

  @ApiOperation({ summary: 'Fetch all network operators' })
  @ApiResponse({
    status: 200,
    description: 'Returns all network operators',
    type: NetworkOperatorDto,
    isArray: true,
  })
  @Get('/network-operators')
  getOperators() {
    return this.voltPayService.fetchNetworkOperators();
  }

  @ApiOperation({ summary: 'Fetch all transaction history' })
  @ApiResponse({
    status: 200,
    description: 'Returns all transaction history',
    type: VoltPayTransaction,
    isArray: true,
  })
  @Get('/transactions/:address/:type')
  getTransactionHistory(
    @Param('address') address: string,
    @Param('type') type: 'airtime' | 'data',
  ) {
    if (type !== 'airtime' && type !== 'data') {
      throw new BadRequestException('Invalid transaction type');
    }
    return this.voltPayService.fetchTransactionHistory(address, type);
  }
}
