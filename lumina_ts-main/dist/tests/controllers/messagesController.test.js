"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const messagesController_1 = require("../../controllers/messagesController");
const messagesModel_1 = require("../../models/messagesModel");
jest.mock("../../models/messagesModel");
describe("Messages Controller", () => {
    const mockRequest = (body, params = {}) => ({ body, params });
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("enviarMensagem", () => {
        it("should create and return a new message", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                idEmpresaEnvia: "123",
                idEmpresaRecebe: "456",
                mensagem: "Hello, World!",
            });
            const res = mockResponse();
            messagesModel_1.Mensagem.prototype.save.mockResolvedValue(req.body);
            yield (0, messagesController_1.enviarMensagem)(req, res);
            expect(messagesModel_1.Mensagem.prototype.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(req.body);
        }));
        it("should handle errors during message creation", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({
                idEmpresaEnvia: "123",
                idEmpresaRecebe: "456",
                mensagem: "Hello, World!",
            });
            const res = mockResponse();
            messagesModel_1.Mensagem.prototype.save.mockRejectedValue(new Error("Database error"));
            yield (0, messagesController_1.enviarMensagem)(req, res);
            expect(messagesModel_1.Mensagem.prototype.save).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        }));
    });
    describe("buscarMensagensEntreEmpresas", () => {
        it("should fetch all messages between two companies", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
            const res = mockResponse();
            const mockMessages = [
                { idEmpresaEnvia: "123", idEmpresaRecebe: "456", mensagem: "Message 1" },
                { idEmpresaEnvia: "456", idEmpresaRecebe: "123", mensagem: "Message 2" },
            ];
            messagesModel_1.Mensagem.find.mockResolvedValue(mockMessages);
            yield (0, messagesController_1.buscarMensagensEntreEmpresas)(req, res);
            expect(messagesModel_1.Mensagem.find).toHaveBeenCalledWith({
                $or: [
                    { idEmpresaEnvia: "123", idEmpresaRecebe: "456" },
                    { idEmpresaEnvia: "456", idEmpresaRecebe: "123" },
                ],
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMessages);
        }));
        it("should handle errors during message fetching", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
            const res = mockResponse();
            messagesModel_1.Mensagem.find.mockRejectedValue(new Error("Database error"));
            yield (0, messagesController_1.buscarMensagensEntreEmpresas)(req, res);
            expect(messagesModel_1.Mensagem.find).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        }));
    });
    describe("buscarUltimaMensagem", () => {
        it("should fetch the last message between two companies", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
            const res = mockResponse();
            const mockMessage = { idEmpresaEnvia: "123", idEmpresaRecebe: "456", mensagem: "Last message" };
            messagesModel_1.Mensagem.findOne.mockResolvedValue(mockMessage);
            yield (0, messagesController_1.buscarUltimaMensagem)(req, res);
            expect(messagesModel_1.Mensagem.findOne).toHaveBeenCalledWith({
                $or: [
                    { idEmpresaEnvia: "123", idEmpresaRecebe: "456" },
                    { idEmpresaEnvia: "456", idEmpresaRecebe: "123" },
                ],
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(mockMessage);
        }));
        it("should handle errors during last message fetching", () => __awaiter(void 0, void 0, void 0, function* () {
            const req = mockRequest({}, { idEmpresa1: "123", idEmpresa2: "456" });
            const res = mockResponse();
            messagesModel_1.Mensagem.findOne.mockRejectedValue(new Error("Database error"));
            yield (0, messagesController_1.buscarUltimaMensagem)(req, res);
            expect(messagesModel_1.Mensagem.findOne).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
        }));
    });
});
