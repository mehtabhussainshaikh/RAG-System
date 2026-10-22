import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';
import { JwtService } from '@nestjs/jwt';
import { AuthorizationService } from '../src/common/auth/authorization.service.js';
import { Role } from '../src/common/auth/role.js';
import { AuthService } from '../src/auth/auth.service.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  const authorizationService = {
    findAuthenticatedUser: vi.fn(async (userId: number) => {
      if (userId === 999) {
        return undefined;
      }

      return {
        userId,
        email: userId === 2 ? 'admin@example.com' : 'user@example.com',
        role: userId === 2 ? Role.ADMIN : Role.USER,
      };
    }),
  };

  const authService = {
    registerUser: vi.fn(async () => ({
      id: 3,
      email: 'new@example.com',
      role: Role.USER,
    })),
    loginUser: vi.fn(async () => ({
      id: 1,
      email: 'user@example.com',
      role: Role.USER,
      accessToken: 'access-token',
    })),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthorizationService)
      .useValue(authorizationService)
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = app.get(JwtService);
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

  it('/ (GET) rejects an expired access token', async () => {
    const accessToken = await jwtService.signAsync(
      { userId: 1 },
      { expiresIn: -1 },
    );

    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });

  it('/ (GET) rejects a token for a deleted or unknown user', async () => {
    const accessToken = await jwtService.signAsync({ userId: 999 });

    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });

  it.each([
    ['USER', 1],
    ['ADMIN', 2],
  ])('/ (GET) accepts a valid %s', async (_role, userId) => {
    const accessToken = await jwtService.signAsync({ userId });

    return request(app.getHttpServer())
      .get('/')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({ success: true, statusCode: 200, data: 'Hello World!' });
  });

  it('/admin (GET) rejects a USER with 403', async () => {
    const accessToken = await jwtService.signAsync({
      userId: 1,
      role: Role.ADMIN,
    });

    return request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403)
      .expect({
        success: false,
        statusCode: 403,
        message: 'Insufficient permissions',
        data: null,
      });
  });

  it('/admin (GET) accepts an ADMIN', async () => {
    const accessToken = await jwtService.signAsync({ userId: 2 });

    return request(app.getHttpServer())
      .get('/admin')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect({ success: true, statusCode: 200, data: 'Hello Admin!' });
  });

  it('/auth/register and /auth/login remain public', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'New User',
        email: 'new@example.com',
        password: 'password',
        phone: '1234567890',
        role: 999,
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.data.role).toBe(Role.USER);
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password' })
      .expect(201)
      .expect(({ body }) => {
        expect(body.data.accessToken).toBe('access-token');
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
