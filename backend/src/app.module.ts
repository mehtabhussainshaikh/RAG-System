  import { Module } from '@nestjs/common';
  import { ConfigModule } from '@nestjs/config';
  import { AppController } from './app.controller.js';
  import { AppService } from './app.service.js';
  import { PrismaModule } from './common/prisma/prisma.module.js';
  import { AuthModule } from './auth/auth.module.js';
  import { HashingServiceTsService } from './common/hashing/hashing.service.ts/hashing.service.ts.service.js';
  import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
  import { ResponseInterceptor } from './common/interceptors/response/response.interceptor.js';
  import { HttpExceptionFilter } from './common/filters/http-exception/http-exception.filter.js';
  import { JwtModule } from "@nestjs/jwt";
  import { ConfigService } from "@nestjs/config";

  @Module({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env',
      }),
      JwtModule.registerAsync({
        global: true,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          secret: configService.get('JWT_ACCESS_SECRET'),
          signOptions: { expiresIn: '1h' },
        }),
      }),
      PrismaModule,
      AuthModule
    ],
    controllers: [AppController],
    providers: [
      AppService,
      HashingServiceTsService,
      {
        provide: APP_INTERCEPTOR,
        useClass: ResponseInterceptor
      },
      {
        provide: APP_FILTER,
        useClass: HttpExceptionFilter
      }
    ],
  })
  export class AppModule { }
