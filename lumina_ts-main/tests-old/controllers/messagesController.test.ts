import { Request, Response } from 'express';
import { Mensagem } from '../../src/models/messagesModel';
import * as messageController from '../../src/controllers/messagesController';
import mongoose from 'mongoose';

// Mock do model Mensagem
jest.mock('../../src/models/messagesModel');

// Estendendo o tipo Request para garantir que params existe
interface MockRequest extends Request {
  params: {
    [key: string]: string;
  };
  body: any;
}

describe('Messages Controller', () => {
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  
  // Mock de mensagem para usar nos testes
  const mockMensagem = {
    _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
    idEmpresaEnvia: new mongoose.Types.ObjectId('507f1f77bcf86cd799439012'),
    idEmpresaRecebe: new mongoose.Types.ObjectId('507f1f77bcf86cd799439013'),
    mensagem: 'Mensagem de teste',
    data: new Date(),
  };

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    } as MockRequest;
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('enviarMensagem', () => {
    beforeEach(() => {
      mockRequest.body = {
        idEmpresaEnvia: mockMensagem.idEmpresaEnvia,
        idEmpresaRecebe: mockMensagem.idEmpresaRecebe,
        mensagem: mockMensagem.mensagem,
      };
    });

    it('should successfully send a message', async () => {
      // Mock do método save
      (Mensagem.prototype.save as jest.Mock).mockResolvedValue(mockMensagem);

      await messageController.enviarMensagem(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        idEmpresaEnvia: mockMensagem.idEmpresaEnvia,
        idEmpresaRecebe: mockMensagem.idEmpresaRecebe,
        mensagem: mockMensagem.mensagem,
      }));
    });

    it('should return error if message sending fails', async () => {
      const error = new Error('Database error');
      (Mensagem.prototype.save as jest.Mock).mockRejectedValue(error);

      await messageController.enviarMensagem(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: error.message,
      });
    });
  });

  describe('buscarMensagensEntreEmpresas', () => {
    const mockMensagens = [
      mockMensagem,
      { ...mockMensagem, mensagem: 'Segunda mensagem' },
    ];

    beforeEach(() => {
      mockRequest.params = {
        idEmpresa1: mockMensagem.idEmpresaEnvia.toString(),
        idEmpresa2: mockMensagem.idEmpresaRecebe.toString(),
      };
    });

    it('should successfully fetch messages between companies', async () => {
      const mockFind = {
        sort: jest.fn().mockResolvedValue(mockMensagens),
      };
      (Mensagem.find as jest.Mock).mockReturnValue(mockFind);

      await messageController.buscarMensagensEntreEmpresas(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Mensagem.find).toHaveBeenCalledWith({
        $or: [
          {
            idEmpresaEnvia: mockRequest.params.idEmpresa1,
            idEmpresaRecebe: mockRequest.params.idEmpresa2,
          },
          {
            idEmpresaEnvia: mockRequest.params.idEmpresa2,
            idEmpresaRecebe: mockRequest.params.idEmpresa1,
          },
        ],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMensagens);
    });

    it('should return error if fetching messages fails', async () => {
      const error = new Error('Database error');
      const mockFind = {
        sort: jest.fn().mockRejectedValue(error),
      };
      (Mensagem.find as jest.Mock).mockReturnValue(mockFind);

      await messageController.buscarMensagensEntreEmpresas(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: error.message,
      });
    });
  });

  describe('buscarUltimaMensagem', () => {
    beforeEach(() => {
      mockRequest.params = {
        idEmpresa1: mockMensagem.idEmpresaEnvia.toString(),
        idEmpresa2: mockMensagem.idEmpresaRecebe.toString(),
      };
    });

    it('should successfully fetch last message between companies', async () => {
      const mockFindOne = {
        sort: jest.fn().mockResolvedValue(mockMensagem),
      };
      (Mensagem.findOne as jest.Mock).mockReturnValue(mockFindOne);

      await messageController.buscarUltimaMensagem(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(Mensagem.findOne).toHaveBeenCalledWith({
        $or: [
          {
            idEmpresaEnvia: mockRequest.params.idEmpresa1,
            idEmpresaRecebe: mockRequest.params.idEmpresa2,
          },
          {
            idEmpresaEnvia: mockRequest.params.idEmpresa2,
            idEmpresaRecebe: mockRequest.params.idEmpresa1,
          },
        ],
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockMensagem);
    });

    it('should return error if fetching last message fails', async () => {
      const error = new Error('Database error');
      const mockFindOne = {
        sort: jest.fn().mockRejectedValue(error),
      };
      (Mensagem.findOne as jest.Mock).mockReturnValue(mockFindOne);

      await messageController.buscarUltimaMensagem(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: error.message,
      });
    });

    it('should return null if no messages exist between companies', async () => {
      const mockFindOne = {
        sort: jest.fn().mockResolvedValue(null),
      };
      (Mensagem.findOne as jest.Mock).mockReturnValue(mockFindOne);

      await messageController.buscarUltimaMensagem(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(null);
    });
  });
});