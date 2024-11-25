import { Request, Response, NextFunction } from "express";
import { Empresa } from "../models/enterpriseModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Senha deve ter no mínimo 8 caracteres");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra maiúscula");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Senha deve conter pelo menos uma letra minúscula");
  }

  if (!/\d/.test(password)) {
    errors.push("Senha deve conter pelo menos um número");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Senha deve conter pelo menos um caractere especial");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nomeEmpresa, email, password } = req.body;

  try {
    
    if (!validateEmail(email)) {
      res.status(400).json({ error: "Formato de email inválido" });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ 
        error: "Requisitos de senha não atendidos", 
        details: passwordValidation.errors 
      });
      return;
    }

    const existingEmpresa = await Empresa.findOne({ "auth.email": email });
    if (existingEmpresa) {
      res.status(400).json({ error: "Usuario já existe" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const empresa = new Empresa({
      auth: {
        nomeEmpresa,
        email,
        password: hashedPassword,
      },
    });

    await empresa.save();

    const token = jwt.sign(
      { empresaId: empresa._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(201).json({ empresa, token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!validateEmail(email)) {
      res.status(400).json({ error: "Formato de email inválido" });
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400).json({ 
        error: "Requisitos de senha não atendidos", 
        details: passwordValidation.errors 
      });
      return;
    }

    const empresa = await Empresa.findOne({ "auth.email": email });
    if (!empresa || !empresa.auth) {
      res.status(401).json({ error: "Usuario não encontrado" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      empresa.auth.password
    );
    if (!isPasswordValid) {
      res.status(401).json({ error: "Senha invalida" });
      return;
    }

    const token = jwt.sign(
      { empresaId: empresa._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.status(200).json({ empresa, token });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const checkAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Nenhum token fornecido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      empresaId: string;
    };
    const empresa = await Empresa.findById(decoded.empresaId);

    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    req.body.authenticatedEmpresa = empresa;
    next();
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar empresa no banco" });
    return;
  }
};

export const getEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const empresa = await Empresa.findById(id);
    console.log(empresa);

    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    res.status(200).json(empresa);
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const {
    nomeEmpresa,
    password,
    telefoneEmpresa,
    emailEmpresa,
    siteEmpresa,
    tipoEmpresa,
    CNPJ,
    endereco,
    redesSociais,
    mensagens,
    servicos,
    userImg,
    local,
  } = req.body;

  try {
    const updatedEmpresa = await Empresa.findByIdAndUpdate(
      id,
      {
        "auth.nomeEmpresa": nomeEmpresa,
        "auth.password": password,
        "auth.email": emailEmpresa,
        telefoneEmpresa,
        emailEmpresa,
        siteEmpresa,
        tipoEmpresa,
        CNPJ,
        endereco,
        redesSociais,
        mensagens,
        servicos,
        userImg,
        local,
      },
      { new: true }
    );

    if (!updatedEmpresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    res
      .status(200)
      .json({
        message: "Dados da empresa atualizados com sucesso!",
        empresa: updatedEmpresa,
      });
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    res.status(500).json({ error: "Erro ao atualizar empresa" });
  }
};

export const deleteEmpresa = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const empresa = await Empresa.findByIdAndDelete(id);

    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    res.status(204).json();
  } catch (error) {
    console.error("Erro ao deletar empresa:", error);
    res.status(500).json({ error: "Erro ao deletar empresa" });
  }
};

export const listEmpresas = async (req: Request, res: Response): Promise<void> => {
  const page: number = parseInt(req.query.page as string) || 1;
  const limit: number = parseInt(req.query.limit as string) || 10;
  const tipo: string = req.query.tipo as string;

  const skip = (page - 1) * limit;

  try {
    let filter = {};
    if (tipo === "contratante" || tipo === "fornecedor") {
      filter = { tipoEmpresa: { $in: [tipo, "ambos"] } };
    }

    const empresas = await Empresa.find(filter)
      .skip(skip)
      .limit(limit)
      .exec();

    const totalEmpresas = await Empresa.countDocuments(filter);

    const totalPages = Math.ceil(totalEmpresas / limit);

    res.status(200).json({
      page,
      totalPages,
      totalEmpresas,
      empresas,
    });
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    res.status(500).json({ error: "Erro ao listar empresas" });
  }
};