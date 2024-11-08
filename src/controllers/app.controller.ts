import { ClassSerializerInterceptor, Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from '../app.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
