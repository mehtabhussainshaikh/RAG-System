import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { JwtService } from '@nestjs/jwt';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET) is public', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ success: true, statusCode: 200, data: 'OK' });
  });

  it('/ (GET) rejects a request without an access token', () => {
    return request(app.getHttpServer()).get('/').expect(401).expect({
      success: false,
      statusCode: 401,
      message: 'A valid Bearer access token is required',
      data: null,
    });
  });

  it('/ (GET) rejects an invalid access token', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401)
      .expect({
        success: false,
        statusCode: 401,
        message: 'A valid Bearer access token is required',
        data: null,
      });
  });

  it('/ (GET) accepts a valid access token', async () => {
    const accessToken = await app.get(JwtService).signAsync({ userId: 1 });

    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({ success: true, statusCode: 200, data: 'Hello World!' });
  });

  afterEach(async () => {
    await app.close();
  });
});
