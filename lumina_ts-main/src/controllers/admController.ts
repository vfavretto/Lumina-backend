import { Request, Response, NextFunction } from "express";
import { Administrador, IAdministrador } from "../models/admModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Função para validar se a empresa é um administrador
export const validarAdmin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Verificando se existe um administrador com o email fornecido
    const administrador = await Administrador.findOne({ email });
    if (!administrador) {
      res.status(401).json({ error: "Administrador não encontrado" });
      return;
    }

    // Comparando a senha fornecida com a senha do administrador (criptografada)
    const isPasswordValid = await bcrypt.compare(password, administrador.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: "Senha inválida" });
      return;
    }

    // Se a autenticação for bem-sucedida, conceder privilégio de administrador
    res.status(200).json({ message: "Login de administrador bem-sucedido" });
  } catch (error) {
    console.error("Erro ao validar administrador:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

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
      const hashedPassword = await bcrypt.hash(password, 10); // Criptografando a senha
      const novoAdmin = new Administrador({
        email,
        password: hashedPassword, // Salvando a senha criptografada
      });
  
      // Salvando o administrador no banco de dados
      await novoAdmin.save();
  
      res.status(201).json({ message: "Primeiro administrador criado com sucesso" });
    } catch (error) {
      console.error("Erro ao adicionar o primeiro administrador:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // Função para adicionar novos administradores, apenas se já existir um primeiro administrador
export const adicionarAdmin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    try {
      // Verificar se já existe algum administrador
      const adminExistente = await Administrador.findOne();
      if (!adminExistente) {
        res.status(403).json({ error: "Nenhum administrador registrado ainda. O primeiro administrador deve ser criado primeiro." });
        return;
      }
  
      // Verificar se o usuário que está fazendo a requisição é o primeiro administrador
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res.status(401).json({ error: "Token de autenticação não fornecido" });
        return;
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
      const admin = await Administrador.findById(decoded.userId);
  
      if (!admin || admin.email !== adminExistente.email) {
        res.status(403).json({ error: "Você não tem permissão para adicionar administradores" });
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
  
      res.status(201).json({ message: "Novo administrador criado com sucesso" });
    } catch (error) {
      console.error("Erro ao adicionar novo administrador:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  };

  // Middleware para verificar se o usuário está autenticado e é o primeiro administrador
  export const verificarAutenticacao = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];
  
    if (!token) {
      res.status(401).json({ error: "Token não fornecido" });
      return;
    }
  
    try {
      // Decodificando o token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
  
      // Verificando se o primeiro administrador existe e pegando o tipo correto
      const adminExistente = await Administrador.findOne();
  
      if (!adminExistente) {
        res.status(403).json({ error: "Nenhum administrador registrado. Não é possível adicionar administradores." });
        return;
      }
  
      // Garantindo que adminExistente é do tipo Administrador
      const admin = adminExistente as IAdministrador;
  
      // Verificando se o usuário do token é o primeiro administrador
      if (decoded.userId !== admin._id.toString()) {
        res.status(403).json({ error: "Você não tem permissão para adicionar administradores" });
        return;
      }
  
      // Se tudo estiver certo, prossiga com a requisição
      next();
    } catch (error) {
      console.error("Erro ao verificar autenticidade:", error);
      res.status(401).json({ error: "Token inválido ou expirado" });
      return;
    }
  };