import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getAdminHello(): string {
    return 'Hello Admin!';
  }

  getHealth(): string {
    return 'OK';
  }
}
