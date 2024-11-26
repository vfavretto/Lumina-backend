import request from "supertest";
import mongoose from "mongoose";
import app from "../src/index";
import { Empresa } from "../src/models/enterpriseModel";
import { Mensagem } from "../src/models/messagesModel";
import bcrypt from "bcryptjs";

describe("Messages Routes", () => {
  const BASE_URL = "/api/v1/messages";
  let empresa1Token: string;
  let empresa2Token: string;
  let empresa1Id: string;
  let empresa2Id: string;

  // Helper function para criar empresa
  const createEmpresa = async (
    userName: string,
    email: string,
    password: string = "senha123"
  ) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const empresa = new Empresa({
      auth: {
        userName,
        email,
        password: hashedPassword,
      },
    });
    await empresa.save();

    const response = await request(app).post("/api/v1/auth/login").send({
      email,
      password,
    });

    return { empresa, token: response.body.token };
  };

  beforeAll(async () => {
    await Empresa.deleteMany({});
    await Mensagem.deleteMany({});

    const { empresa: emp1, token: token1 } = await createEmpresa(
      "Empresa 1",
      "empresa1@test.com"
    );
    const { empresa: emp2, token: token2 } = await createEmpresa(
      "Empresa 2",
      "empresa2@test.com"
    );

    empresa1Token = token1;
    empresa2Token = token2;
    empresa1Id = (emp1._id as string).toString();
    empresa2Id = (emp2._id as string).toString();
  });

  beforeEach(async () => {
    await Mensagem.deleteMany({});
  });

  // Testes para enviar mensagem
  describe(`POST ${BASE_URL}/`, () => {
    it("deve enviar uma mensagem com sucesso", async () => {
      const mensagemData = {
        idEmpresaEnvia: empresa1Id,
        idEmpresaRecebe: empresa2Id,
        mensagem: "Olá, empresa 2!",
      };

      const response = await request(app)
        .post(`${BASE_URL}/`)
        .set("Authorization", `Bearer ${empresa1Token}`)
        .send(mensagemData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("_id");
      expect(response.body.mensagem).toBe("Olá, empresa 2!");
      expect(response.body.idEmpresaEnvia).toBe(empresa1Id);
      expect(response.body.idEmpresaRecebe).toBe(empresa2Id);
    });

    it("deve retornar erro 500 ao falhar ao enviar mensagem", async () => {
      jest.spyOn(Mensagem.prototype, "save").mockImplementationOnce(() => {
        throw new Error("Erro ao salvar mensagem");
      });

      const mensagemData = {
        idEmpresaEnvia: empresa1Id,
        idEmpresaRecebe: empresa2Id,
        mensagem: "Teste erro",
      };

      const response = await request(app)
        .post(`${BASE_URL}/`)
        .set("Authorization", `Bearer ${empresa1Token}`)
        .send(mensagemData);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao salvar mensagem");
    });
  });

  // Testes para buscar mensagens entre empresas
  describe(`GET ${BASE_URL}/:idEmpresa1/:idEmpresa2`, () => {
    beforeEach(async () => {
      await Mensagem.create([
        {
          idEmpresaEnvia: empresa1Id,
          idEmpresaRecebe: empresa2Id,
          mensagem: "Mensagem 1",
          data: new Date("2024-01-01"),
        },
        {
          idEmpresaEnvia: empresa2Id,
          idEmpresaRecebe: empresa1Id,
          mensagem: "Mensagem 2",
          data: new Date("2024-01-02"),
        },
        {
          idEmpresaEnvia: empresa1Id,
          idEmpresaRecebe: empresa2Id,
          mensagem: "Mensagem 3",
          data: new Date("2024-01-03"),
        },
        {
          idEmpresaEnvia: empresa2Id,
          idEmpresaRecebe: empresa1Id,
          mensagem: "Mensagem 4",
          data: new Date("2024-01-04"),
        },
      ]);
    });

    it("deve buscar as mensagens paginadas com sucesso (primeiro lote)", async () => {
      const limit = 2;
      const offset = 0;

      const response = await request(app)
        .get(
          `${BASE_URL}/${empresa1Id}/${empresa2Id}?limit=${limit}&offset=${offset}`
        )
        .set("Authorization", `Bearer ${empresa1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(limit);

      // As mensagens mais recentes devem vir primeiro
      expect(response.body[0].mensagem).toBe("Mensagem 4");
      expect(response.body[1].mensagem).toBe("Mensagem 3");
    });

    it("deve buscar as mensagens paginadas com sucesso (segundo lote)", async () => {
      const limit = 2;
      const offset = 2;

      const response = await request(app)
        .get(
          `${BASE_URL}/${empresa1Id}/${empresa2Id}?limit=${limit}&offset=${offset}`
        )
        .set("Authorization", `Bearer ${empresa1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(limit);

      // Próximo lote de mensagens
      expect(response.body[0].mensagem).toBe("Mensagem 2");
      expect(response.body[1].mensagem).toBe("Mensagem 1");
    });

    it("deve retornar array vazio quando o offset ultrapassar o número de mensagens", async () => {
      const limit = 2;
      const offset = 10;

      const response = await request(app)
        .get(
          `${BASE_URL}/${empresa1Id}/${empresa2Id}?limit=${limit}&offset=${offset}`
        )
        .set("Authorization", `Bearer ${empresa1Token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body).toHaveLength(0);
    });

    it("deve retornar erro 500 ao falhar ao buscar mensagens paginadas", async () => {
      jest.spyOn(Mensagem, "find").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar mensagens");
      });

      const response = await request(app)
        .get(`${BASE_URL}/${empresa1Id}/${empresa2Id}?limit=2&offset=0`)
        .set("Authorization", `Bearer ${empresa1Token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao buscar mensagens");
    });
  });

  // Testes para buscar última mensagem
  describe(`GET ${BASE_URL}/ultima-mensagem/:idEmpresa1/:idEmpresa2`, () => {
    beforeEach(async () => {
      await Mensagem.create([
        {
          idEmpresaEnvia: empresa1Id,
          idEmpresaRecebe: empresa2Id,
          mensagem: "Mensagem antiga",
          data: new Date("2024-01-01"),
        },
        {
          idEmpresaEnvia: empresa2Id,
          idEmpresaRecebe: empresa1Id,
          mensagem: "Mensagem mais recente",
          data: new Date("2024-01-02"),
        },
      ]);
    });

    it("deve buscar última mensagem com sucesso", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/ultima-mensagem/${empresa1Id}/${empresa2Id}`)
        .set("Authorization", `Bearer ${empresa1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.mensagem).toBe("Mensagem mais recente");
    });

    it("deve retornar null quando não há mensagens", async () => {
      await Mensagem.deleteMany({});

      const response = await request(app)
        .get(`${BASE_URL}/ultima-mensagem/${empresa1Id}/${empresa2Id}`)
        .set("Authorization", `Bearer ${empresa1Token}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    it("deve retornar erro 500 ao falhar ao buscar última mensagem", async () => {
      jest.spyOn(Mensagem, "findOne").mockImplementationOnce(() => {
        throw new Error("Erro ao buscar última mensagem");
      });

      const response = await request(app)
        .get(`${BASE_URL}/ultima-mensagem/${empresa1Id}/${empresa2Id}`)
        .set("Authorization", `Bearer ${empresa1Token}`);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Erro ao buscar última mensagem");
    });

    it("deve utilizar o limite padrão quando nenhum limite for fornecido", async () => {
      const response = await request(app)
        .get(`${BASE_URL}/${empresa1Id}/${empresa2Id}`)
        .set("Authorization", `Bearer ${empresa1Token}`); // Sem ?limit na query

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();

      // Backend aplica limite padrão de 20; base de teste só tem 4 mensagens.
      expect(response.body).toHaveLength(2);

      // Verifica se as mensagens estão ordenadas corretamente.
      expect(response.body[0].mensagem).toBe("Mensagem mais recente");
      expect(response.body[1].mensagem).toBe("Mensagem antiga");
    });
  });

  afterAll(async () => {
    await Empresa.deleteMany({});
    await Mensagem.deleteMany({});
  });
});
