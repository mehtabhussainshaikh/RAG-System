import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './common/auth/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  healthCheck(): string {
    return this.appService.getHealth();
  }
}
