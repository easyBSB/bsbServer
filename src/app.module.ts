import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppController2 } from './app.controller.hallo';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController, AppController2],
  providers: [AppService],
})
export class AppModule {}
