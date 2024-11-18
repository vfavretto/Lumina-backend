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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enterpriseController_1 = require("../../controllers/enterpriseController");
const enterpriseModel_1 = require("../../models/enterpriseModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock dependencies
jest.mock("../../models/enterpriseModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
describe("Enterprise Controller - register", () => {
    const mockRequest = (body) => ({ body });
    const mockResponse = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        return res;
    };
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should register a new enterprise successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            nomeEmpresa: "Empresa Teste",
            email: "teste@empresa.com",
            password: "senha123",
        });
        const res = mockResponse();
        // Mocking database and dependencies
        enterpriseModel_1.Empresa.findOne.mockResolvedValue(null); // No existing empresa
        bcryptjs_1.default.hash.mockResolvedValue("hashedPassword");
        enterpriseModel_1.Empresa.prototype.save.mockResolvedValue({});
        jsonwebtoken_1.default.sign.mockReturnValue("mockToken");
        yield (0, enterpriseController_1.register)(req, res);
        expect(enterpriseModel_1.Empresa.findOne).toHaveBeenCalledWith({ "auth.email": "teste@empresa.com" });
        expect(bcryptjs_1.default.hash).toHaveBeenCalledWith("senha123", 10);
        expect(enterpriseModel_1.Empresa.prototype.save).toHaveBeenCalled();
        expect(jsonwebtoken_1.default.sign).toHaveBeenCalledWith({ empresaId: expect.any(String) }, expect.any(String), {
            expiresIn: "1h",
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: "mockToken" });
    }));
    it("should return 400 if the enterprise already exists", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            nomeEmpresa: "Empresa Teste",
            email: "teste@empresa.com",
            password: "senha123",
        });
        const res = mockResponse();
        // Mocking database
        enterpriseModel_1.Empresa.findOne.mockResolvedValue({});
        yield (0, enterpriseController_1.register)(req, res);
        expect(enterpriseModel_1.Empresa.findOne).toHaveBeenCalledWith({ "auth.email": "teste@empresa.com" });
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: "User already exists" });
    }));
    it("should handle database errors", () => __awaiter(void 0, void 0, void 0, function* () {
        const req = mockRequest({
            nomeEmpresa: "Empresa Teste",
            email: "teste@empresa.com",
            password: "senha123",
        });
        const res = mockResponse();
        // Mocking database
        enterpriseModel_1.Empresa.findOne.mockRejectedValue(new Error("Database error"));
        yield (0, enterpriseController_1.register)(req, res);
        expect(enterpriseModel_1.Empresa.findOne).toHaveBeenCalledWith({ "auth.email": "teste@empresa.com" });
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    }));
});
