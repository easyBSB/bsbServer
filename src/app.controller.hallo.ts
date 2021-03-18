import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController2 {
  constructor(private readonly appService: AppService) {}

  @Get('/JR=:id')
  // @ApiResponse({
  //   type: postHelloBody,
  // })
  getHello7(@Param('id') id: number): string {
    return (this.appService.getHello() + ' ' + id) as any;
  }
}
