import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index";
import { Servico } from "../src/models/servicesModel";
import { Empresa } from "../src/models/enterpriseModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

describe("Services Routes", () => {
  const BASE_URL = "/api/v1/services";
  let empresaToken: string;
  let empresaId: string;
  let servicoId: string;

  // Helper function para criar empresa e serviço
  const createEmpresaAndServico = async () => {

    const hashedPassword = await bcrypt.hash("senha123", 10);
    const empresa = new Empresa({
      auth: {
        nomeEmpresa: "Empresa Teste",
        email: "empresa@test.com",
        password: hashedPassword,
      },
    });
    await empresa.save();

    const servico = new Servico({
      nomeServ: "Serviço Teste",
      descServ: "Descrição do serviço teste"
    });
    await servico.save();

    empresa.servicos.push(servico._id as mongoose.Types.ObjectId);
    await empresa.save();

    const token = jwt.sign(
      { id: empresa._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" }
    );

    return { empresa, servico, token };
  };

  beforeEach(async () => {
    await Empresa.deleteMany({});
    await Servico.deleteMany({});
  });

  // Testes para buscar serviço por ID
  describe(`GET ${BASE_URL}/:id`, () => {
    beforeEach(async () => {
      const { empresa, servico, token } = await createEmpresaAndServico();
      empresaId = (empresa._id as string).toString();
      servicoId = (servico._id as string).toString();
      empresaToken = token;
    });

    it("deve buscar serviço por ID com sucesso", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/${servicoId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(200);
      expect(response.body.nomeServ).toBe("Serviço Teste");
      expect(response.body.descServ).toBe("Descrição do serviço teste");
    });

    it("deve retornar 404 para serviço não encontrado", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`${BASE_URL}/${fakeId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Serviço não encontrado");
    });

    it("deve retornar erro 500 ao falhar ao buscar serviço", async () => {
      jest.spyOn(Servico, "findById").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar serviço");
      });

      const response = await request(app)
        .get(`${BASE_URL}/${servicoId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao buscar serviço");
    });
  });

  // Testes para listar serviços da empresa
  describe(`GET ${BASE_URL}/empresa/:idEmpresa`, () => {
    beforeEach(async () => {
      const { empresa, servico, token } = await createEmpresaAndServico();
      empresaId = (empresa._id as string).toString();
      servicoId = (servico._id as string).toString();
      empresaToken = token;
    });

    it("deve listar serviços da empresa com sucesso", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/empresa/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].nomeServ).toBe("Serviço Teste");
    });

    it("deve retornar 404 para empresa não encontrada", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`${BASE_URL}/empresa/${fakeId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Empresa não encontrada");
    });

    it("deve retornar erro 500 ao falhar ao listar serviços", async () => {
      jest.spyOn(Empresa, "findById").mockImplementationOnce(() => {
        throw new Error("Erro ao listar serviços da empresa");
      });

      const response = await request(app)
        .get(`${BASE_URL}/empresa/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao listar serviços da empresa");
    });

    it("deve retornar lista vazia quando empresa não tem serviços", async () => {

      const empresaSemServicos = new Empresa({
        auth: {
          nomeEmpresa: "Empresa Sem Serviços",
          email: "semservicos@test.com",
          password: await bcrypt.hash("senha123", 10),
        },
      });
      await empresaSemServicos.save();

      const token = jwt.sign(
        { id: empresaSemServicos._id },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1d" }
      );

      const response = await request(app)
        .get(`${BASE_URL}/empresa/${empresaSemServicos._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  afterAll(async () => {
    await Empresa.deleteMany({});
    await Servico.deleteMany({});
  });
});