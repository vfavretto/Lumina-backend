import { Request, Response } from 'express';
import { Empresa } from '../../src/models/enterpriseModel';
import * as empresaController from '../../src/controllers/enterpriseController';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// Mock do model Empresa
jest.mock('../../src/models/enterpriseModel');

// Mock do bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock do jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

describe('Empresa Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const mockEmpresa = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    auth: {
      nomeEmpresa: 'Empresa Teste',
      email: 'teste@empresa.com',
      password: 'hashedPassword123'
    }
  };

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    beforeEach(() => {
      mockRequest.body = {
        nomeEmpresa: 'Empresa Teste',
        email: 'teste@empresa.com',
        password: 'senha123'
      };
    });

    it('should successfully register a new company', async () => {
      // Mock implementations
      (Empresa.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword123');
      (Empresa.prototype.save as jest.Mock).mockResolvedValue(mockEmpresa);
      (jwt.sign as jest.Mock).mockReturnValue('mockedToken123');

      await empresaController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        empresa: expect.any(Object),
        token: 'mockedToken123'
      });
    });

    it('should return error if company already exists', async () => {
      (Empresa.findOne as jest.Mock).mockResolvedValue(mockEmpresa);

      await empresaController.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User already exists'
      });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockRequest.body = {
        email: 'teste@empresa.com',
        password: 'senha123'
      };
    });

    it('should successfully login a company', async () => {
      (Empresa.findOne as jest.Mock).mockResolvedValue(mockEmpresa);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mockedToken123');

      await empresaController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        empresa: mockEmpresa,
        token: 'mockedToken123'
      });
    });

    it('should return error if company not found', async () => {
      (Empresa.findOne as jest.Mock).mockResolvedValue(null);

      await empresaController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not found'
      });
    });

    it('should return error if password is invalid', async () => {
      (Empresa.findOne as jest.Mock).mockResolvedValue(mockEmpresa);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await empresaController.login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid password'
      });
    });
  });

  describe('checkAuth', () => {
    const mockNext = jest.fn();

    beforeEach(() => {
      mockRequest.headers = {
        authorization: 'Bearer mockedToken123'
      };
    });

    it('should successfully authenticate token', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ empresaId: mockEmpresa._id });
      (Empresa.findById as jest.Mock).mockResolvedValue(mockEmpresa);

      await empresaController.checkAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body.authenticatedEmpresa).toEqual(mockEmpresa);
    });

    it('should return error if no token provided', async () => {
      mockRequest.headers = {};

      await empresaController.checkAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'No token provided'
      });
    });
  });

  describe('getEmpresa', () => {
    beforeEach(() => {
      mockRequest.params = { id: mockEmpresa._id.toString() };
    });

    it('should successfully get company by id', async () => {
      (Empresa.findById as jest.Mock).mockResolvedValue(mockEmpresa);

      await empresaController.getEmpresa(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockEmpresa);
    });

    it('should return error if company not found', async () => {
      (Empresa.findById as jest.Mock).mockResolvedValue(null);

      await empresaController.getEmpresa(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Empresa not found'
      });
    });
  });

  describe('updateEmpresa', () => {
    beforeEach(() => {
      mockRequest.params = { id: mockEmpresa._id.toString() };
      mockRequest.body = {
        nomeEmpresa: 'Empresa Atualizada',
        telefoneEmpresa: '123456789',
        emailEmpresa: 'novo@empresa.com'
      };
    });

    it('should successfully update company', async () => {
      const updatedEmpresa = { ...mockEmpresa, ...mockRequest.body };
      (Empresa.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedEmpresa);

      await empresaController.updateEmpresa(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Dados da empresa atualizados com sucesso!',
        empresa: updatedEmpresa
      });
    });

    it('should return error if company not found', async () => {
      (Empresa.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await empresaController.updateEmpresa(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Empresa not found'
      });
    });
  });

  describe('deleteEmpresa', () => {
    beforeEach(() => {
      mockRequest.params = { id: mockEmpresa._id.toString() };
    });

    it('should successfully delete company', async () => {
      (Empresa.findByIdAndDelete as jest.Mock).mockResolvedValue(mockEmpresa);

      await empresaController.deleteEmpresa(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.json).toHaveBeenCalled();
    });

    it('should return error if company not found', async () => {
      (Empresa.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      await empresaController.deleteEmpresa(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Empresa not found'
      });
    });
  });
});