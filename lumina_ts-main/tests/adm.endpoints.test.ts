import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../src/index";
import { Administrador } from "../src/models/admModel";
import { Empresa } from "../src/models/enterpriseModel";

describe("Admin Routes", () => {
  let adminToken: string;
  let adminId: string;
  const BASE_URL = "/api/v1";

  // Helper function para criar admin
  const createAdmin = async (
    email: string = "admin@test.com",
    password: string = "password123"
  ) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = new Administrador({
      email,
      password: hashedPassword,
    });
    await admin.save();
    return admin;
  };

  // Helper function para criar empresa
  const createEmpresa = async (customData = {}) => {
    const defaultData = {
      auth: {
        nomeEmpresa: "Empresa Teste",
        email: `empresa${Date.now()}@test.com`,
        password: await bcrypt.hash("senha123", 10),
      },
    };

    const empresa = new Empresa({
      ...defaultData,
      ...customData,
    });
    await empresa.save();
    return empresa;
  };

  beforeEach(async () => {
    const admin = await createAdmin();
    adminId = admin._id.toString();
    adminToken = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
  });

  // Testes para adicionarPrimeiroAdmin
  describe(`POST ${BASE_URL}/admin/primeiro`, () => {
    it("deve criar o primeiro admin com sucesso", async () => {
      await Administrador.deleteMany({});

      const response = await request(app)
        .post(`${BASE_URL}/admin/primeiro`)
        .send({
          email: "primeiro@admin.com",
          password: "senha123",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("adminId");
      expect(response.body.message).toBe(
        "Primeiro administrador criado com sucesso"
      );
    });

    it("deve impedir criação de primeiro admin quando já existe um", async () => {
      const response = await request(app)
        .post(`${BASE_URL}/admin/primeiro`)
        .send({
          email: "segundo@admin.com",
          password: "senha123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Já existe um administrador cadastrado");
    });
    it("deve retornar erro 500 quando ocorrer erro no servidor", async () => {
      await Administrador.deleteMany({});

      jest.spyOn(bcrypt, "hash").mockImplementationOnce(() => {
        throw new Error("Erro ao criar hash");
      });

      const response = await request(app)
        .post(`${BASE_URL}/admin/primeiro`)
        .send({
          email: "primeiro@admin.com",
          password: "senha123",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao criar hash");
    });
  });

  // Testes para validarAdmin (login)
  describe(`POST ${BASE_URL}/admin/login`, () => {
    it("deve fazer login com sucesso", async () => {
      const response = await request(app).post(`${BASE_URL}/admin/login`).send({
        email: "admin@test.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.message).toBe("Login de administrador bem-sucedido");
    });

    it("deve rejeitar login com senha incorreta", async () => {
      const response = await request(app).post(`${BASE_URL}/admin/login`).send({
        email: "admin@test.com",
        password: "senhaerrada",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Senha inválida");
    });

    it("deve rejeitar login com email não cadastrado", async () => {
      const response = await request(app).post(`${BASE_URL}/admin/login`).send({
        email: "naocadastrado@test.com",
        password: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Administrador não encontrado");
    });

    it("deve retornar erro 500 quando ocorrer erro no servidor", async () => {

      jest.spyOn(bcrypt, "compare").mockImplementationOnce(() => {
        throw new Error("Erro na comparação");
      });

      const response = await request(app).post(`${BASE_URL}/admin/login`).send({
        email: "admin@test.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro na comparação");
    });
  });

  // Testes para adicionarAdmin
  describe(`POST ${BASE_URL}/admin`, () => {
    it("deve adicionar novo admin com sucesso", async () => {
      const response = await request(app)
        .post(`${BASE_URL}/admin`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "novoadmin@test.com",
          password: "senha123",
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe(
        "Novo administrador criado com sucesso"
      );
      expect(response.body.newAdminEmail).toBe("novoadmin@test.com");
    });

    it("deve impedir criação de admin com email duplicado", async () => {
      const response = await request(app)
        .post(`${BASE_URL}/admin`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "admin@test.com",
          password: "senha123",
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Este email já está em uso");
    });

    it("deve rejeitar criação sem autenticação", async () => {
      const response = await request(app).post(`${BASE_URL}/admin`).send({
        email: "novoadmin@test.com",
        password: "senha123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Token não fornecido");
    });

    it("deve retornar erro 500 quando ocorrer erro no servidor", async () => {

      jest.spyOn(bcrypt, "hash").mockImplementationOnce(() => {
        throw new Error("Erro ao criar hash");
      });

      const response = await request(app)
        .post(`${BASE_URL}/admin`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "novoadmin@test.com",
          password: "senha123",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao criar hash");
    });
  });

  // Testes para verificarAutenticacaoAdmin
  describe('Autenticação de Admin', () => {
    it('deve retornar erro quando o token é inválido', async () => {
      const response = await request(app)
        .get(`${BASE_URL}/admin`)
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Token inválido ou expirado');
    });

    it('deve retornar erro quando o admin não é encontrado após decodificação do token', async () => {
      const fakeAdminId = new mongoose.Types.ObjectId();
      const invalidToken = jwt.sign(
        { adminId: fakeAdminId },
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' }
      );

      const response = await request(app)
        .get(`${BASE_URL}/admin`)
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Administrador não encontrado');
    });
  });
  
  // Testes para listarEmpresas
  describe(`GET ${BASE_URL}/admin`, () => {
    it("deve listar todas as empresas", async () => {
      await createEmpresa();
      await createEmpresa({
        auth: {
          nomeEmpresa: "Empresa Teste 2",
          email: "empresa2@test.com",
          password: await bcrypt.hash("senha123", 10),
        },
      });

      const response = await request(app)
        .get(`${BASE_URL}/admin`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.empresas)).toBeTruthy();
      expect(response.body.empresas.length).toBe(2);
      expect(response.body).toHaveProperty("quantidade", 2);
      expect(response.body.empresas[0].auth).toHaveProperty("nomeEmpresa");
      expect(response.body.empresas[0].auth).toHaveProperty("email");
      expect(response.body.empresas[0].auth).not.toHaveProperty("password");
    });

    it("deve retornar lista vazia quando não há empresas", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/admin`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.empresas).toHaveLength(0);
      expect(response.body.quantidade).toBe(0);
    });

    it("deve retornar erro 500 quando ocorrer erro no servidor", async () => {

      jest.spyOn(Empresa, "find").mockImplementationOnce(() => {
        throw new Error("Erro ao listar empresas");
      });

      const response = await request(app)
        .get(`${BASE_URL}/admin`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao listar empresas");
    });
  });

  // Testes para buscarEmpresa
  describe(`GET ${BASE_URL}/admin/:id`, () => {
    it("deve buscar empresa por ID com sucesso", async () => {
      const empresa = await createEmpresa();

      const response = await request(app)
        .get(`${BASE_URL}/admin/${empresa._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.empresa.auth.nomeEmpresa).toBe("Empresa Teste");
      expect(response.body.empresa.auth).toHaveProperty("email");
      expect(response.body.empresa.auth).not.toHaveProperty("password");
    });

    it("deve retornar erro para ID inválido", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/admin/123456789012`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
    });

    it("deve retornar 404 para empresa não encontrada", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`${BASE_URL}/admin/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Empresa não encontrada");
    });

    it("deve retornar erro 500 quando ocorrer erro no servidor", async () => {
      const empresa = await createEmpresa();

      jest.spyOn(Empresa, "findById").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar empresa");
      });

      const response = await request(app)
        .get(`${BASE_URL}/admin/${empresa._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao buscar empresa");
    });
  });

  // Testes para editarEmpresa
  describe(`PUT ${BASE_URL}/admin/:id`, () => {
    it("deve editar empresa com sucesso", async () => {
      const empresa = await createEmpresa();
      const dadosAtualizacao = {
        auth: {
          nomeEmpresa: "Empresa Atualizada",
          email: "atualizado@test.com",
          password: "novasenha123",
        },
      };

      const response = await request(app)
        .put(`${BASE_URL}/admin/${empresa._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(dadosAtualizacao);

      expect(response.status).toBe(200);
      expect(response.body.empresa.auth.nomeEmpresa).toBe("Empresa Atualizada");
      expect(response.body.empresa.auth.email).toBe("atualizado@test.com");
    });

    it("deve impedir atualização com email duplicado", async () => {

      const empresa1 = await createEmpresa();
      const empresa2 = await createEmpresa({
        auth: {
          nomeEmpresa: "Empresa 2",
          email: "empresa2@test.com",
          password: await bcrypt.hash("senha123", 10),
        },
      });

      const response = await request(app)
        .put(`${BASE_URL}/admin/${empresa1._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          auth: {
            email: empresa2.auth.email,
          },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Este email já está em uso");
    });

    it("deve validar campos obrigatórios na atualização", async () => {
      const empresa = await createEmpresa();
      const dadosAtualizacao = {
        auth: {
          nomeEmpresa: "",
          email: "atualizado@test.com",
          password: "novasenha123",
        },
      };

      const response = await request(app)
        .put(`${BASE_URL}/admin/${empresa._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send(dadosAtualizacao);

      expect(response.status).toBe(400);
    });

    it("deve retornar erro 500 quando ocorrer erro no servidor", async () => {
      const empresa = await createEmpresa();

      jest.spyOn(Empresa, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Erro ao atualizar");
      });

      const response = await request(app)
        .put(`${BASE_URL}/admin/${empresa._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          auth: {
            nomeEmpresa: "Empresa Atualizada",
            email: "atualizado@test.com",
          },
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao atualizar");
    });
  });

  // Testes para deletarEmpresa
  describe(`DELETE ${BASE_URL}/admin/:id`, () => {
    it("deve deletar empresa com sucesso", async () => {
      const empresa = await createEmpresa();

      const response = await request(app)
        .delete(`${BASE_URL}/admin/${empresa._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Empresa deletada com sucesso");
      expect(response.body.deletedCompany).toBe("Empresa Teste");

      // Verificar se a empresa foi realmente deletada
      const empresaDeletada = await Empresa.findById(empresa._id);
      expect(empresaDeletada).toBeNull();
    });

    it("deve retornar 404 ao tentar deletar empresa inexistente", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`${BASE_URL}/admin/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Empresa não encontrada");
    });

    it("deve retornar erro 500 quando ocorrer erro no servidor", async () => {
      const empresa = await createEmpresa();

      jest.spyOn(Empresa, "findByIdAndDelete").mockImplementationOnce(() => {
        throw new Error("Erro ao deletar");
      });

      const response = await request(app)
        .delete(`${BASE_URL}/admin/${empresa._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao deletar");
    });
  });
});
