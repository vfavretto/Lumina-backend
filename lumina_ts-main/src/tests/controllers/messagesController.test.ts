import {
    enviarMensagem,
    buscarMensagensEntreEmpresas,
    buscarUltimaMensagem,
  } from "../../controllers/messagesController";
  import { Mensagem } from "../../models/messagesModel";
  
  jest.mock("../../models/messagesModel");
  
  describe("Messages Controller", () => {
    const mockRequest = (body: any, params: any = {}) => ({ body, params } as any);
    const mockResponse = () => {
      const res: any = {};
      res.status = jest.fn().mockReturnValue(res);
      res.json = jest.fn().mockReturnValue(res);
      return res;
    };
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe("enviarMensagem", () => {
      it("should create and return a new message", async () => {
        const req = mockRequest({
          idEmpresaEnvia: "123",
          idEmpresaRecebe: "456",
          mensagem: "Hello, World!",
        });
        const res = mockResponse();
  
        (Mensagem.prototype.save as jest.Mock).mockResolvedValue(req.body);
  
        await enviarMensagem(req, res);
  
        expect(Mensagem.prototype.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(req.body);
      });
  
      it("should handle errors during message creation", async () => {
        const req = mockRequest({
          idEmpresaEnvia: "123",
          idEmpresaRecebe: "456",
          mensagem: "Hello, World!",
        });
        const res = mockResponse();
  
        (Mensagem.prototype.save as jest.Mock).mockRejectedValue(new Error("Database error"));
  
        await enviarMensagem(req, res);
  
        expect(Mensagem.prototype.save).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
      });
    });
  
    describe("buscarMensagensEntreEmpresas", () => {
      it("should fetch all messages between two companies", async () => {
        const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
        const res = mockResponse();
  
        const mockMessages = [
          { idEmpresaEnvia: "123", idEmpresaRecebe: "456", mensagem: "Message 1" },
          { idEmpresaEnvia: "456", idEmpresaRecebe: "123", mensagem: "Message 2" },
        ];
        (Mensagem.find as jest.Mock).mockResolvedValue(mockMessages);
  
        await buscarMensagensEntreEmpresas(req, res);
  
        expect(Mensagem.find).toHaveBeenCalledWith({
          $or: [
            { idEmpresaEnvia: "123", idEmpresaRecebe: "456" },
            { idEmpresaEnvia: "456", idEmpresaRecebe: "123" },
          ],
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMessages);
      });
  
      it("should handle errors during message fetching", async () => {
        const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
        const res = mockResponse();
  
        (Mensagem.find as jest.Mock).mockRejectedValue(new Error("Database error"));
  
        await buscarMensagensEntreEmpresas(req, res);
  
        expect(Mensagem.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
      });
    });
  
    describe("buscarUltimaMensagem", () => {
      it("should fetch the last message between two companies", async () => {
        const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
        const res = mockResponse();
  
        const mockMessage = { idEmpresaEnvia: "123", idEmpresaRecebe: "456", mensagem: "Last message" };
        (Mensagem.findOne as jest.Mock).mockResolvedValue(mockMessage);
  
        await buscarUltimaMensagem(req, res);
  
        expect(Mensagem.findOne).toHaveBeenCalledWith({
          $or: [
            { idEmpresaEnvia: "123", idEmpresaRecebe: "456" },
            { idEmpresaEnvia: "456", idEmpresaRecebe: "123" },
          ],
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(mockMessage);
      });
  
      it("should handle errors during last message fetching", async () => {
        const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
        const res = mockResponse();
  
        (Mensagem.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));
  
        await buscarUltimaMensagem(req, res);
  
        expect(Mensagem.findOne).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
      });
    });
  });
  