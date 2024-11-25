import request from 'supertest';
import express from 'express';
import enterpriseRoutes from '../../src/routes/enterpriseRoutes';

const app = express();
app.use(express.json());
app.use('/api/empresas', enterpriseRoutes);

describe('Enterprise Routes', () => {
  const mockEmpresa = {
    _id: '507f1f77bcf86cd799439011',
    auth: {
      nomeEmpresa: 'Empresa Teste',
      email: 'teste@empresa.com',
      password: 'hashedPassword123',
    },
  };

  const mockToken = 'mock-jwt-token';

  describe('POST /register', () => {
    it('should register a new company successfully', async () => {
      const registrationData = {
        nomeEmpresa: 'Nova Empresa',
        email: 'nova@empresa.com',
        password: 'senha123',
      };

      const response = await request(app)
        .post('/api/empresas/register')
        .send(registrationData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('empresa');
    });
  });

  describe('POST /login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'teste@empresa.com',
        password: 'senha123',
      };

      const response = await request(app)
        .post('/api/empresas/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('empresa');
    });

    it('should return 401 with incorrect credentials', async () => {
      const loginData = {
        email: 'teste@empresa.com',
        password: 'wrongpassword',
      };

      await request(app)
        .post('/api/empresas/login')
        .send(loginData)
        .expect(401);
    });
  });

  describe('GET /check', () => {
    it('should verify token successfully', async () => {
      await request(app)
        .get('/api/empresas/check')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);
    });

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/empresas/check')
        .set('Authorization', `Bearer invalid-token`)
        .expect(401);
    });
  });

  describe('GET /profile/:id', () => {
    it('should get company profile with valid token', async () => {
      const response = await request(app)
        .get(`/api/empresas/profile/${mockEmpresa._id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('auth');
      expect(response.body.auth.nomeEmpresa).toBe(mockEmpresa.auth.nomeEmpresa);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .get(`/api/empresas/profile/${mockEmpresa._id}`)
        .expect(401);
    });
  });

  describe('PUT /profile/:id', () => {
    it('should update company profile with valid token', async () => {
      const updateData = {
        nomeEmpresa: 'Empresa Atualizada',
      };

      const response = await request(app)
        .put(`/api/empresas/profile/${mockEmpresa._id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('empresa');
      expect(response.body.empresa.nomeEmpresa).toBe(updateData.nomeEmpresa);
    });

    it('should return 401 without token', async () => {
      const updateData = {
        nomeEmpresa: 'Empresa Atualizada',
      };

      await request(app)
        .put(`/api/empresas/profile/${mockEmpresa._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /profile/:id', () => {
    it('should delete company profile with valid token', async () => {
      await request(app)
        .delete(`/api/empresas/profile/${mockEmpresa._id}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(204);
    });

    it('should return 401 without token', async () => {
      await request(app)
        .delete(`/api/empresas/profile/${mockEmpresa._id}`)
        .expect(401);
    });
  });
});

