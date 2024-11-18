import { Request, Response, NextFunction } from "express";
import { Empresa } from "../models/enterpriseModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nomeEmpresa, email, password } = req.body;

  try {
    const existingEmpresa = await Empresa.findOne({ "auth.email": email });
    if (existingEmpresa) {
      res.status(400).json({ error: "User already exists" });
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
      res.status(401).json({ error: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      empresa.auth.password
    );
    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid password" });
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
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { empresaId: string };

    const empresa = await Empresa.findById(decoded.empresaId);

    if (!empresa) {
      res.status(404).json({ error: "Empresa not found" });
      return;
    }

    req.body.authenticatedEmpresa = empresa;

    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

export const getEmpresa = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const empresa = await Empresa.findById(id);
    console.log(empresa);

    if (!empresa) {
      res.status(404).json({ error: "Empresa not found" });
      return;
    }

    res.status(200).json(empresa);
  } catch (error) {
    console.error("Error fetching empresa:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEmpresa = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params; 
  const {
    nomeEmpresa, senha, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ,
    endereco, redesSociais, mensagens, servicos, userImg, local
  } = req.body;

  try {
    const updatedEmpresa = await Empresa.findByIdAndUpdate(
      id,
      {
        'auth.nomeEmpresa': nomeEmpresa,  
        'auth.senha': senha,
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

