import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/supabase/supabase.service';

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let supabaseService: SupabaseService;

  const testAdmin = {
    fullName: 'Admin Test',
    email: 'admin.test@example.com',
    role: 'ADMIN',
    password: 'TestPassword123!'
  };

  const testLogin = {
    email: 'admin.test@example.com',
    password: 'TestPassword123!'
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    supabaseService = moduleFixture.get<SupabaseService>(SupabaseService);
    await app.init();
  });

  afterAll(async () => {
    try {
      const supabase = supabaseService.getClient();
      await supabase.from('profiles').delete().eq('email', testAdmin.email);
    } catch (error) {
      console.log('Cleanup error (expected):', error.message);
    }
    await app.close();
  });

  describe('/api/v1/auth/register (POST)', () => {
    it('deve registrar o administrador inicial com sucesso', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testAdmin)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('email', testAdmin.email);
          expect(res.body.user).toHaveProperty('profile');
          expect(res.body.user.profile).toHaveProperty('role', 'ADMIN');
        });
    });

    it('deve falhar ao tentar registrar segundo administrador', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...testAdmin,
          email: 'second.admin@example.com'
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Initial admin registration is only allowed for the first user');
        });
    });

    it('deve falhar com dados inválidos', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          fullName: '',
          email: 'invalid-email',
          role: 'ADMIN',
          password: '123'
        })
        .expect(400);
    });

    it('deve falhar sem campos obrigatórios', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com'
          // Faltando fullName, role, password
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('deve fazer login com credenciais válidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(testLogin)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message', 'Login successful');
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('session');
          expect(res.body.user).toHaveProperty('email', testLogin.email);
          expect(res.body.user.profile).toHaveProperty('role', 'ADMIN');
          expect(res.body.session).toHaveProperty('access_token');
          expect(res.body.session).toHaveProperty('refresh_token');
        });
    });

    it('deve falhar com credenciais inválidas', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testLogin.email,
          password: 'wrongpassword'
        })
        .expect(401);
    });

    it('deve falhar com email inexistente', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        })
        .expect(401);
    });

    it('deve falhar com dados inválidos', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'invalid-email',
          password: ''
        })
        .expect(400);
    });
  });

  describe('/api/v1/auth/reset-password (POST)', () => {
    it('deve iniciar reset de senha para email existente', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          email: testLogin.email
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('password reset email has been sent');
        });
    });

    it('deve retornar sucesso mesmo para email inexistente (segurança)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          email: 'nonexistent@example.com'
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body.message).toContain('password reset email has been sent');
        });
    });

    it('deve falhar com email inválido', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          email: 'invalid-email'
        })
        .expect(400);
    });

    it('deve falhar sem email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({})
        .expect(400);
    });
  });

  describe('Endpoints protegidos', () => {
    let authToken: string;

    beforeAll(async () => {
      // Fazer login para obter token para testes de endpoints protegidos
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send(testLogin);
      
      authToken = loginResponse.body.session.access_token;
    });

    describe('/api/v1/auth/me (GET)', () => {
      it('deve retornar perfil do usuário autenticado', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });

      it('deve falhar sem token', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .expect(401);
      });

      it('deve falhar com token inválido', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/me')
          .set('Authorization', 'Bearer invalid_token')
          .expect(401);
      });
    });

    describe('/api/v1/auth/session (GET)', () => {
      it('deve retornar informações da sessão', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/session')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
      });

      it('deve falhar sem token', () => {
        return request(app.getHttpServer())
          .get('/api/v1/auth/session')
          .expect(401);
      });
    });

    describe('/api/v1/auth/logout (POST)', () => {
      it('deve fazer logout com sucesso', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/logout')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('message');
          });
      });

      it('deve falhar sem token', () => {
        return request(app.getHttpServer())
          .post('/api/v1/auth/logout')
          .expect(401);
      });
    });
  });
}); 