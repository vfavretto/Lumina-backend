import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import app from "../src/index";
import { Empresa } from "../src/models/enterpriseModel";

describe("Enterprise Routes", () => {
  const BASE_URL = "/api/v1/auth";
  let empresaToken: string;
  let empresaId: string;

  // Helper function para criar empresa
  const createEmpresa = async (
    nomeEmpresa: string = "Empresa Teste",
    email: string = "empresa@test.com",
    password: string = "Senh@123"
  ) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const empresa = new Empresa({
      auth: {
        nomeEmpresa,
        email,
        password: hashedPassword,
      },
    });
    await empresa.save();

    const response = await request(app).post(`${BASE_URL}/login`).send({
      email: "empresa@test.com",
      password: "Senh@123",
    });
    let token = response.body.token;

    return { empresa, token };
  };

  beforeEach(async () => {
    await Empresa.deleteMany({});
  });

  // Testes para registro
  describe(`POST ${BASE_URL}/register`, () => {
    it("deve registrar uma nova empresa com sucesso", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Nova Empresa",
        email: "nova@empresa.com",
        password: "Senh@123",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.empresa.auth.nomeEmpresa).toBe("Nova Empresa");
      expect(response.body.empresa.auth.email).toBe("nova@empresa.com");
    });

    it("deve impedir registro com email duplicado", async () => {
      const { empresa } = await createEmpresa();

      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Outra Empresa",
        email: "empresa@test.com",
        password: "Senh@123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Usuario já existe");
    });

    it("deve retornar erro 500 ao falhar ao registrar empresa", async () => {
      jest.spyOn(Empresa.prototype, "save").mockImplementationOnce(() => {
        throw new Error("Erro ao salvar no banco");
      });

      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Erro",
        email: "erro@empresa.com",
        password: "Senh@123",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao salvar no banco");
    });
  });

  // Testes para login
  describe(`POST ${BASE_URL}/login`, () => {
    beforeEach(async () => {
      await createEmpresa();
    });

    it("deve fazer login com sucesso", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        email: "empresa@test.com",
        password: "Senh@123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body.empresa.auth.email).toBe("empresa@test.com");
    });

    it("deve rejeitar login com senha incorreta", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        email: "empresa@test.com",
        password: "Senh@incorreta123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Senha invalida");
    });

    it("deve rejeitar login com email não cadastrado", async () => {
      const response = await request(app).post(`${BASE_URL}/login`).send({
        email: "naocadastrado@test.com",
        password: "Senh@123",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Usuario não encontrado");
    });

    it("deve retornar erro 500 ao falhar ao buscar empresa no login", async () => {
      jest.spyOn(Empresa, "findOne").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar empresa");
      });

      const response = await request(app).post(`${BASE_URL}/login`).send({
        email: "empresa@test.com",
        password: "Senh@123",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao buscar empresa");
    });
  });

  // Testes para getEmpresa
  describe(`GET ${BASE_URL}/profile/:id`, () => {
    beforeEach(async () => {
      const { empresa, token } = await createEmpresa();
      empresaId = (empresa._id as string).toString();
      empresaToken = token;
    });

    it("deve buscar empresa por ID com sucesso", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/profile/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(200);
      expect(response.body.auth.nomeEmpresa).toBe("Empresa Teste");
      expect(response.body.auth.email).toBe("empresa@test.com");
    });

    it("deve retornar 404 para empresa não encontrada", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`${BASE_URL}/profile/${fakeId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Empresa não encontrada");
    });

    it("deve retornar erro 500 ao falhar ao buscar empresa", async () => {
      jest.spyOn(Empresa, "findById").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar empresa no banco");
      });

      const response = await request(app)
        .get(`${BASE_URL}/profile/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao buscar empresa no banco");
    });
  });

  // Testes para updateEmpresa
  describe(`PUT ${BASE_URL}/profile/:id`, () => {
    beforeEach(async () => {
      const { empresa, token } = await createEmpresa();
      empresaId = (empresa._id as string).toString();
      empresaToken = token;
    });

    it("deve atualizar empresa com sucesso", async () => {
      const dadosAtualizacao = {
        nomeEmpresa: "Empresa Atualizada",
        emailEmpresa: "atualizado@empresa.com",
        telefoneEmpresa: "11999999999",
        siteEmpresa: "www.empresa.com",
        tipoEmpresa: "contratante",
        CNPJ: "12345678901234",
      };

      const response = await request(app)
        .put(`${BASE_URL}/profile/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`)
        .send(dadosAtualizacao);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "Dados da empresa atualizados com sucesso!"
      );
      expect(response.body.empresa.auth.nomeEmpresa).toBe("Empresa Atualizada");
      expect(response.body.empresa.emailEmpresa).toBe("atualizado@empresa.com");
    });

    it("deve retornar 404 para empresa não encontrada", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`${BASE_URL}/profile/${fakeId}`)
        .set("Authorization", `Bearer ${empresaToken}`)
        .send({ nomeEmpresa: "Test" });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Empresa não encontrada");
    });

    it("deve retornar erro 500 ao falhar ao atualizar empresa", async () => {
      jest.spyOn(Empresa, "findByIdAndUpdate").mockImplementationOnce(() => {
        throw new Error("Erro ao atualizar empresa");
      });

      const response = await request(app)
        .put(`${BASE_URL}/profile/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`)
        .send({
          nomeEmpresa: "Erro Empresa",
          emailEmpresa: "erro@empresa.com",
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao atualizar empresa");
    });
  });

  // Testes para deleteEmpresa
  describe(`DELETE ${BASE_URL}/profile/:id`, () => {
    beforeEach(async () => {
      const { empresa, token } = await createEmpresa();
      empresaId = (empresa._id as string).toString();
      empresaToken = token;
    });

    it("deve retornar erro 500 ao falhar ao deletar empresa", async () => {
      jest
        .spyOn(Empresa, "findByIdAndDelete")
        .mockRejectedValueOnce(new Error("Erro ao deletar empresa"));

      const response = await request(app)
        .delete(`${BASE_URL}/profile/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao deletar empresa");
    });

    it("deve deletar empresa com sucesso", async () => {
      const response = await request(app)
        .delete(`${BASE_URL}/profile/${empresaId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(204);

      const empresaDeletada = await Empresa.findById(empresaId);
      expect(empresaDeletada).toBeNull();
    });

    it("deve retornar 404 ao tentar deletar empresa inexistente", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`${BASE_URL}/profile/${fakeId}`)
        .set("Authorization", `Bearer ${empresaToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Empresa não encontrada");
    });
  });

  describe("checkAuth Middleware", () => {
    const fakeId = new mongoose.Types.ObjectId();

    it("deve retornar 401 se nenhum token for fornecido", async () => {
      const response = await request(app).get(`${BASE_URL}/profile/${fakeId}`);
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Nenhum token fornecido");
    });

    it("deve retornar 404 se a empresa não for encontrada com o token", async () => {
      const { token } = await createEmpresa();
      const invalidToken = token;

      const response = await request(app)
        .get(`${BASE_URL}/profile/${fakeId}`)
        .set("Authorization", `Bearer ${invalidToken}`);
      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Empresa não encontrada");
    });

    it("deve permitir o acesso com um token válido", async () => {
      const { empresa, token } = await createEmpresa();
      empresaId = (empresa._id as string).toString();
      const validToken = token;

      const response = await request(app)
        .get(`${BASE_URL}/profile/${empresaId}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe(`GET /api/v1/auth/enterprises`, () => {
    beforeEach(async () => {
      // Adicionando empresas ao banco para testes
      await Empresa.insertMany([
        {
          auth: {
            nomeEmpresa: "Empresa 1",
            email: "empresa1@test.com",
            password: "Senh@123",
          },
          tipoEmpresa: "contratante",
        },
        {
          auth: {
            nomeEmpresa: "Empresa 2",
            email: "empresa2@test.com",
            password: "Senh@123",
          },
          tipoEmpresa: "fornecedor",
        },
        {
          auth: {
            nomeEmpresa: "Empresa 3",
            email: "empresa3@test.com",
            password: "Senh@123",
          },
          tipoEmpresa: "ambos",
        },
        {
          auth: {
            nomeEmpresa: "Empresa 4",
            email: "empresa4@test.com",
            password: "Senh@123",
          },
          tipoEmpresa: "contratante",
        },
        {
          auth: {
            nomeEmpresa: "Empresa 5",
            email: "empresa5@test.com",
            password: "Senh@123",
          },
          tipoEmpresa: "fornecedor",
        },
      ]);
    });

    it("deve listar empresas com paginação padrão (page=1, limit=10)", async () => {
      const response = await request(app).get(`/api/v1/auth/enterprises`);

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.totalEmpresas).toBe(5); // Total de empresas inseridas
      expect(response.body.totalPages).toBe(1); // Com limite padrão de 10, há apenas 1 página
      expect(response.body.empresas.length).toBe(5); // Todas as empresas estão na página 1
    });

    it("deve listar empresas com página e limite especificados", async () => {
      const response = await request(app).get(
        `/api/v1/auth/enterprises?page=1&limit=2`
      );

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.totalEmpresas).toBe(5);
      expect(response.body.totalPages).toBe(3); // Total de páginas (5 empresas / 2 por página)
      expect(response.body.empresas.length).toBe(2); // Apenas 2 empresas na página 1
    });

    it("deve listar empresas da página 2 com limite especificado", async () => {
      const response = await request(app).get(
        `/api/v1/auth/enterprises?page=2&limit=2`
      );

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.totalEmpresas).toBe(5);
      expect(response.body.totalPages).toBe(3); // Total de páginas
      expect(response.body.empresas.length).toBe(2); // Página 2 também tem 2 empresas
    });

    it("deve retornar empresas filtradas por tipo contratante", async () => {
      const response = await request(app).get(
        `/api/v1/auth/enterprises?tipo=contratante`
      );

      expect(response.status).toBe(200);
      expect(response.body.totalEmpresas).toBe(3); // Apenas empresas do tipo contratante
      expect(
        response.body.empresas.every(
          (e: any) =>
            e.tipoEmpresa === "contratante" || e.tipoEmpresa === "ambos"
        )
      ).toBe(true);
    });

    it("deve retornar empresas filtradas por tipo fornecedor", async () => {
      const response = await request(app).get(
        `/api/v1/auth/enterprises?tipo=fornecedor`
      );

      expect(response.status).toBe(200);
      expect(response.body.totalEmpresas).toBe(3); // Apenas empresas do tipo fornecedor
      expect(
        response.body.empresas.every(
          (e: any) =>
            e.tipoEmpresa === "fornecedor" || e.tipoEmpresa === "ambos"
        )
      ).toBe(true);
    });

    it("deve retornar erro 500 ao falhar ao buscar empresas", async () => {
      jest.spyOn(Empresa, "find").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar empresas");
      });

      const response = await request(app).get(`/api/v1/auth/enterprises`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao listar empresas");
    });
  });
});

describe("Enterprise Routes Validation", () => {
  const BASE_URL = "/api/v1/auth";

  // Email validation tests
  describe(`POST ${BASE_URL}/register - Email Validation`, () => {
    it("deve rejeitar email sem domínio", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Inválida",
        email: "empresa@",
        password: "SenhaValida123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Formato de email inválido");
    });

    it("deve rejeitar email sem nome local", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Inválida",
        email: "@empresa.com",
        password: "SenhaValida123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Formato de email inválido");
    });
  });

  // Password validation tests
  describe(`POST ${BASE_URL}/register - Password Validation`, () => {
    it("deve rejeitar senha sem letra maiúscula", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Teste",
        email: "empresa@teste.com",
        password: "senhavalida123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Requisitos de senha não atendidos");
      expect(response.body.details).toContain(
        "Senha deve conter pelo menos uma letra maiúscula"
      );
    });

    it("deve rejeitar senha sem letra minúscula", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Teste",
        email: "empresa@teste.com",
        password: "SENHAVALIDA123!",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Requisitos de senha não atendidos");
      expect(response.body.details).toContain(
        "Senha deve conter pelo menos uma letra minúscula"
      );
    });

    it("deve rejeitar senha sem número", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Teste",
        email: "empresa@teste.com",
        password: "SenhaValidaaa!",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Requisitos de senha não atendidos");
      expect(response.body.details).toContain(
        "Senha deve conter pelo menos um número"
      );
    });

    it("deve rejeitar senha sem caractere especial", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Teste",
        email: "empresa@teste.com",
        password: "SenhaValida123",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Requisitos de senha não atendidos");
      expect(response.body.details).toContain(
        "Senha deve conter pelo menos um caractere especial"
      );
    });

    it("deve rejeitar senha menor que 8 caracteres", async () => {
      const response = await request(app).post(`${BASE_URL}/register`).send({
        nomeEmpresa: "Empresa Teste",
        email: "empresa@teste.com",
        password: "Curta1!",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Requisitos de senha não atendidos");
      expect(response.body.details).toContain(
        "Senha deve ter no mínimo 8 caracteres"
      );
    });
  });

  // Repeat similar tests for login endpoint
  describe(`POST ${BASE_URL}/login - Validation`, () => {
    describe(`POST ${BASE_URL}/login - Email Validation`, () => {
      it("deve rejeitar email sem domínio", async () => {
        const response = await request(app).post(`${BASE_URL}/login`).send({
          email: "empresa@",
          password: "SenhaValida123!",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Formato de email inválido");
      });

      it("deve rejeitar email sem nome local", async () => {
        const response = await request(app).post(`${BASE_URL}/login`).send({
          email: "@empresa.com",
          password: "SenhaValida123!",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Formato de email inválido");
      });
    });

    describe(`POST ${BASE_URL}/login - Password Validation`, () => {
      it("deve rejeitar senha sem letra maiúscula", async () => {
        const response = await request(app).post(`${BASE_URL}/login`).send({
          email: "empresa@teste.com",
          password: "senhavalida123!",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Requisitos de senha não atendidos");
        expect(response.body.details).toContain(
          "Senha deve conter pelo menos uma letra maiúscula"
        );
      });

      it("deve rejeitar senha sem letra minúscula", async () => {
        const response = await request(app).post(`${BASE_URL}/login`).send({
          email: "empresa@teste.com",
          password: "SENHAVALIDA123!",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Requisitos de senha não atendidos");
        expect(response.body.details).toContain(
          "Senha deve conter pelo menos uma letra minúscula"
        );
      });

      it("deve rejeitar senha sem número", async () => {
        const response = await request(app).post(`${BASE_URL}/login`).send({
          email: "empresa@teste.com",
          password: "SenhaValidaaa!",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Requisitos de senha não atendidos");
        expect(response.body.details).toContain(
          "Senha deve conter pelo menos um número"
        );
      });

      it("deve rejeitar senha sem caractere especial", async () => {
        const response = await request(app).post(`${BASE_URL}/login`).send({
          email: "empresa@teste.com",
          password: "SenhaValida123",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Requisitos de senha não atendidos");
        expect(response.body.details).toContain(
          "Senha deve conter pelo menos um caractere especial"
        );
      });

      it("deve rejeitar senha menor que 8 caracteres", async () => {
        const response = await request(app).post(`${BASE_URL}/login`).send({
          email: "empresa@teste.com",
          password: "Curta1!",
        });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe("Requisitos de senha não atendidos");
        expect(response.body.details).toContain(
          "Senha deve ter no mínimo 8 caracteres"
        );
      });
    });
  });
});
