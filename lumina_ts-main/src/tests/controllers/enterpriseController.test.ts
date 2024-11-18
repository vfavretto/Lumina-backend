import { register } from "../../controllers/enterpriseController";
import { Empresa } from "../../models/enterpriseModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock dependencies
jest.mock("../../models/enterpriseModel");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Enterprise Controller - register", () => {
  const mockRequest = (body: any) => ({ body } as any);
  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new enterprise successfully", async () => {
    const req = mockRequest({
      nomeEmpresa: "Empresa Teste",
      email: "teste@empresa.com",
      password: "senha123",
    });
    const res = mockResponse();

    // Mocking database and dependencies
    (Empresa.findOne as jest.Mock).mockResolvedValue(null); // No existing empresa
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
    (Empresa.prototype.save as jest.Mock).mockResolvedValue({});
    (jwt.sign as jest.Mock).mockReturnValue("mockToken");

    await register(req, res);

    expect(Empresa.findOne).toHaveBeenCalledWith({ "auth.email": "teste@empresa.com" });
    expect(bcrypt.hash).toHaveBeenCalledWith("senha123", 10);
    expect(Empresa.prototype.save).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalledWith({ empresaId: expect.any(String) }, expect.any(String), {
      expiresIn: "1h",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "mockToken" });
  });

  it("should return 400 if the enterprise already exists", async () => {
    const req = mockRequest({
      nomeEmpresa: "Empresa Teste",
      email: "teste@empresa.com",
      password: "senha123",
    });
    const res = mockResponse();

    // Mocking database
    (Empresa.findOne as jest.Mock).mockResolvedValue({});

    await register(req, res);

    expect(Empresa.findOne).toHaveBeenCalledWith({ "auth.email": "teste@empresa.com" });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "User already exists" });
  });

  it("should handle database errors", async () => {
    const req = mockRequest({
      nomeEmpresa: "Empresa Teste",
      email: "teste@empresa.com",
      password: "senha123",
    });
    const res = mockResponse();

    // Mocking database
    (Empresa.findOne as jest.Mock).mockRejectedValue(new Error("Database error"));

    await register(req, res);

    expect(Empresa.findOne).toHaveBeenCalledWith({ "auth.email": "teste@empresa.com" });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
  });
});
