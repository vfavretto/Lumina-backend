import { Request, Response, NextFunction } from "express";
import { Empresa } from "../models/enterpriseModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nomeEmpresa, email, password } = req.body;

  try {
    // Verifica se o usuário já existe
    const existingEmpresa = await Empresa.findOne({ "auth.email": email });
    if (existingEmpresa) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria uma nova empresa com apenas os dados de autenticação
    const empresa = new Empresa({
      auth: {
        nomeEmpresa,
        email,
        password: hashedPassword,
      },
    });

    // Salva a empresa no banco de dados
    await empresa.save();

    // Gera um token JWT para o usuário
    const token = jwt.sign(
      { empresaId: empresa._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Retorna os dados da empresa e o token
    res.status(201).json({ empresa, token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Busca a empresa pelo email da empresa
    const empresa = await Empresa.findOne({ "auth.email": email });
    if (!empresa || !empresa.auth) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(
      password,
      empresa.auth.password
    );
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
      return;
    }

    // Gera o token JWT
    const token = jwt.sign(
      { empresaId: empresa._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    // Retorna os dados da empresa e o token
    res.status(200).json({ empresa, token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]; // Extraímos o token do cabeçalho

  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { empresaId: string };

    // Busca a empresa pelo ID do token
    const empresa = await Empresa.findById(decoded.empresaId);

    if (!empresa) {
      res.status(404).json({ error: "Empresa not found" });
      return;
    }

    // Adiciona os dados da empresa ao objeto `req` para uso nas rotas subsequentes
    req.body.authenticatedEmpresa = empresa;

    // Passa o controle para a próxima função de middleware ou rota
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const getEmpresa = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    // Busca a empresa pelo ID
    const empresa = await Empresa.findById(id);
    console.log(empresa);

    if (!empresa) {
      res.status(404).json({ error: "Empresa not found" });
      return;
    }

    // Retorna os dados da empresa
    res.status(200).json(empresa);
  } catch (error) {
    console.error("Error fetching empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEmpresa = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; // O ID da empresa será passado na URL
  const {
    nomeEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ,
    endereco, redesSociais, mensagens, servicos, userImg, local
  } = req.body;

  try {
    // Atualiza os dados da empresa com os campos fornecidos
    const updatedEmpresa = await Empresa.findByIdAndUpdate(
      id,
      {
        nomeEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ,
        endereco, redesSociais, mensagens, servicos, userImg, local
      },
      { new: true } // Retorna o documento atualizado
    );

    // Verifica se a empresa foi encontrada
    if (!updatedEmpresa) {
      res.status(404).json({ error: "Empresa not found" });
      return;
    }

    res.status(200).json({ message: "Dados da empresa atualizados com sucesso!", empresa: updatedEmpresa });
  } catch (error) {
    console.error("Error updating empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const deleteEmpresa = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const empresa = await Empresa.findByIdAndDelete(id);

    if (!empresa) {
      res.status(404).json({ error: "Empresa not found" });
      return;
    }

    res.status(204).json();
  } catch (error) {
    console.error("Error deleting empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

