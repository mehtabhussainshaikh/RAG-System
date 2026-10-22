import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './common/auth/public.decorator.js';
import { Role } from './common/auth/role.js';
import { Roles } from './common/auth/roles.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Roles(Role.USER, Role.ADMIN)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  getAdminHello(): string {
    return this.appService.getAdminHello();
  }

  @Get('health')
  @Public()
  healthCheck(): string {
    return this.appService.getHealth();
  }
}
