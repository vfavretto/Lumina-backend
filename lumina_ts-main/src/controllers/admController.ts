import { Request, Response, NextFunction } from "express";
import { Administrador, IAdministrador } from "../models/admModel";
import { Empresa } from "../models/enterpriseModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Interface para estender o Request do Express e incluir o admin
interface AuthRequest extends Request {
  admin?: IAdministrador;
}

// Função para adicionar o primeiro administrador
export const adicionarPrimeiroAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Verificar se já existe algum administrador
    const adminExistente = await Administrador.findOne();
    if (adminExistente) {
      res.status(400).json({ error: "Já existe um administrador cadastrado" });
      return;
    }

    // Criar um novo administrador
    const hashedPassword = await bcrypt.hash(password, 10);
    const novoAdmin = new Administrador({
      email,
      password: hashedPassword,
    });

    // Salvando o administrador no banco de dados
    await novoAdmin.save();

    // Gerar token JWT para o primeiro admin
    const token = jwt.sign(
      { adminId: novoAdmin._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: "Primeiro administrador criado com sucesso",
      token,
      adminId: novoAdmin._id
    });
  } catch (error) {
    console.error("Erro ao adicionar o primeiro administrador:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Função para adicionar novos administradores
export const adicionarAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Verificar se o email já está em uso
    const emailExistente = await Administrador.findOne({ email });
    if (emailExistente) {
      res.status(400).json({ error: "Este email já está em uso" });
      return;
    }

    // Criptografando a senha do novo administrador
    const hashedPassword = await bcrypt.hash(password, 10);
    const novoAdmin = new Administrador({
      email,
      password: hashedPassword,
    });

    // Salvando o novo administrador
    await novoAdmin.save();

    res.status(201).json({ 
      message: "Novo administrador criado com sucesso",
      createdBy: req.admin?.email,
      newAdminEmail: email 
    });
  } catch (error) {
    console.error("Erro ao adicionar novo administrador:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Função para validar admin (login) - atualizada para usar JWT
export const validarAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Verificando se existe um administrador com o email fornecido
    const administrador = await Administrador.findOne({ email });
    if (!administrador) {
      res.status(401).json({ error: "Administrador não encontrado" });
      return;
    }

    // Comparando a senha fornecida com a senha do administrador
    const isPasswordValid = await bcrypt.compare(password, administrador.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Senha inválida" });
      return;
    }

    // Gerando token JWT para o admin
    const token = jwt.sign(
      { adminId: administrador._id },
      process.env.JWT_SECRET as string,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: "Login de administrador bem-sucedido",
      token,
      adminId: administrador._id
    });
  } catch (error) {
    console.error("Erro ao validar administrador:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Middleware melhorado de verificação de admin
export const verificarAutenticacaoAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { adminId: string };

    // Buscar o admin no banco
    const admin = await Administrador.findById(decoded.adminId);

    if (!admin) {
      res.status(403).json({ error: "Administrador não encontrado" });
      return;
    }

    // Adicionar o admin ao objeto da requisição
    req.admin = admin;
    next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

// Método para deletar empresa (protegido)
export const deletarEmpresa = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const empresa = await Empresa.findById(id);
    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    await Empresa.findByIdAndDelete(id);

    res.status(200).json({
      message: "Empresa deletada com sucesso",
      deletedCompany: empresa.auth.nomeEmpresa,
      deletedBy: req.admin?.email
    });
  } catch (error) {
    console.error("Erro ao deletar empresa:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Método para editar empresa (protegido)
export const editarEmpresa = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const dadosAtualizacao = req.body;

  try {
    const empresaExistente = await Empresa.findById(id);
    if (!empresaExistente) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    if (
      dadosAtualizacao.auth?.email &&
      dadosAtualizacao.auth.email !== empresaExistente.auth.email
    ) {
      const emailExiste = await Empresa.findOne({
        "auth.email": dadosAtualizacao.auth.email,
      });
      if (emailExiste) {
        res.status(400).json({ error: "Este email já está em uso" });
        return;
      }
    }

    if (dadosAtualizacao.auth?.password) {
      dadosAtualizacao.auth.password = await bcrypt.hash(
        dadosAtualizacao.auth.password,
        10
      );
    }

    const empresaAtualizada = await Empresa.findByIdAndUpdate(
      id,
      { $set: dadosAtualizacao },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Empresa atualizada com sucesso",
      empresa: empresaAtualizada,
      updatedBy: req.admin?.email
    });
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Método para listar empresas (protegido)
export const listarEmpresas = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const empresas = await Empresa.find({}, { "auth.password": 0 });

    res.status(200).json({
      quantidade: empresas.length,
      empresas,
      requestedBy: req.admin?.email
    });
  } catch (error) {
    console.error("Erro ao listar empresas:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Método para buscar empresa específica (protegido)
export const buscarEmpresa = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const empresa = await Empresa.findById(id, { "auth.password": 0 });

    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    res.status(200).json({
      empresa,
      requestedBy: req.admin?.email
    });
  } catch (error) {
    console.error("Erro ao buscar empresa:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};