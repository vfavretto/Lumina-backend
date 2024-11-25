// tests/controllers/admController.test.ts

import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Administrador } from '../../src/models/admModel';
import { Empresa } from '../../src/models/enterpriseModel';
import * as admController from '../../src/controllers/admController';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Mock do modelo Administrador
jest.mock('../../src/models/admModel');
// Mock do modelo Empresa
jest.mock('../../src/models/enterpriseModel');
// Mock do bcrypt
jest.mock('bcryptjs');
// Mock do jsonwebtoken
jest.mock('jsonwebtoken');

describe('AdmController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    // Reseta todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configura o objeto de resposta mock
    responseObject = {
      json: jest.fn(),
    };
    
    // Configura o request e response mock
    mockRequest = {
      body: {},
      params: {},
      headers: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnValue({ json: responseObject.json }),
      json: responseObject.json,
    };

    // Mock do process.env.JWT_SECRET
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('adicionarPrimeiroAdmin', () => {
    it('deve criar o primeiro administrador com sucesso', async () => {
      const adminData = {
        email: 'admin@test.com',
        password: 'password123',
      };

      const hashedPassword = 'hashed_password';
      const mockToken = 'mock_token';
      const mockAdminId = new mongoose.Types.ObjectId();

      mockRequest.body = adminData;
      
      // Mock do findOne retornando null (nenhum admin existente)
      (Administrador.findOne as jest.Mock).mockResolvedValueOnce(null);
      
      // Mock do bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValueOnce(hashedPassword);
      
      // Mock do jwt.sign
      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      // Mock do save
      const mockSave = jest.fn().mockResolvedValueOnce({ 
        _id: mockAdminId,
        ...adminData,
        password: hashedPassword 
      });
      
      (Administrador as any).mockImplementation(() => ({
        save: mockSave
      }));

      await admController.adicionarPrimeiroAdmin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Primeiro administrador criado com sucesso',
        token: mockToken,
        adminId: mockAdminId,
      });
    });

    it('deve retornar erro se já existir um administrador', async () => {
      mockRequest.body = {
        email: 'admin@test.com',
        password: 'password123',
      };

      (Administrador.findOne as jest.Mock).mockResolvedValueOnce({ 
        _id: new mongoose.Types.ObjectId() 
      });

      await admController.adicionarPrimeiroAdmin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: 'Já existe um administrador cadastrado',
      });
    });
  });

  describe('validarAdmin', () => {
    it('deve validar o administrador e retornar token', async () => {
      const adminData = {
        email: 'admin@test.com',
        password: 'password123',
      };

      const mockAdminId = new mongoose.Types.ObjectId();
      const mockToken = 'mock_token';

      mockRequest.body = adminData;

      (Administrador.findOne as jest.Mock).mockResolvedValueOnce({
        _id: mockAdminId,
        email: adminData.email,
        password: 'hashed_password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
      (jwt.sign as jest.Mock).mockReturnValueOnce(mockToken);

      await admController.validarAdmin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.json).toHaveBeenCalledWith({
        message: 'Login de administrador bem-sucedido',
        token: mockToken,
        adminId: mockAdminId,
      });
    });

    it('deve retornar erro se o administrador não for encontrado', async () => {
      mockRequest.body = {
        email: 'nonexistent@test.com',
        password: 'password123',
      };

      (Administrador.findOne as jest.Mock).mockResolvedValueOnce(null);

      await admController.validarAdmin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: 'Administrador não encontrado',
      });
    });

    it('deve retornar erro se a senha for inválida', async () => {
      mockRequest.body = {
        email: 'admin@test.com',
        password: 'wrongpassword',
      };

      (Administrador.findOne as jest.Mock).mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        email: 'admin@test.com',
        password: 'hashed_password',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      await admController.validarAdmin(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: 'Senha inválida',
      });
    });
  });

  describe('verificarAutenticacaoAdmin', () => {
    const mockNext = jest.fn();

    it('deve validar token e passar para o próximo middleware', async () => {
      const mockAdminId = new mongoose.Types.ObjectId();
      const mockToken = 'valid_token';

      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`,
      };

      (jwt.verify as jest.Mock).mockReturnValueOnce({ adminId: mockAdminId });
      (Administrador.findById as jest.Mock).mockResolvedValueOnce({
        _id: mockAdminId,
        email: 'admin@test.com',
      });

      await admController.verificarAutenticacaoAdmin(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });

    it('deve retornar erro se o token não for fornecido', async () => {
      mockRequest.headers = {};

      await admController.verificarAutenticacaoAdmin(
        mockRequest as any,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.json).toHaveBeenCalledWith({
        error: 'Token não fornecido',
      });
    });
  });
});