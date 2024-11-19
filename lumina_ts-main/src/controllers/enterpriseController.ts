import { Request, Response, NextFunction } from "express";
import { Empresa } from "../models/enterpriseModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nomeEmpresa, email, password } = req.body;

  try {
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

export const checkAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1]; // Extraímos o token do cabeçalho

  if (!token) {
    res.status(401).json({ error: "Nenhum token fornecido" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { empresaId: string };

    const empresa = await Empresa.findById(decoded.empresaId);

    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    req.body.authenticatedEmpresa = empresa;

    next();
  } catch (error) {
    console.error("Erro ao verificar token:", error);
    res.status(401).json({ error: "Token invalido" });
  }
};

export const getEmpresa = async (req: Request, res: Response): Promise<void> => {
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

export const updateEmpresa = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; 
  const {
    nomeEmpresa, password, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ,
    endereco, redesSociais, mensagens, servicos, userImg, local
  } = req.body;

  try {
    const updatedEmpresa = await Empresa.findByIdAndUpdate(
      id,
      {
        'auth.nomeEmpresa': nomeEmpresa,  
        'auth.password': password,
        'auth.email': emailEmpresa,
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
        local
      },
      { new: true } 
    );

    if (!updatedEmpresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    res.status(200).json({ message: "Dados da empresa atualizados com sucesso!", empresa: updatedEmpresa });
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteEmpresa = async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ error: "Internal server error" });
  }
};

