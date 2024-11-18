import { Request, Response, NextFunction } from "express";
import { Empresa } from "../models/enterpriseModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * @swagger
 * /api/v1/empresa/register:
 *   post:
 *     summary: Registra uma nova empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeEmpresa:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Empresa criada com sucesso
 *       '400':
 *         description: Empresa já registrada
 *       '500':
 *         description: Erro interno do servidor
 */
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


/**
 * @swagger
 * /api/v1/empresa/login:
 *   post:
 *     summary: Realiza login para a empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login realizado com sucesso
 *       '401':
 *         description: Credenciais inválidas
 *       '500':
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /api/v1/empresa/auth:
 *   get:
 *     summary: Verifica a autenticação do token JWT
 *     responses:
 *       '200':
 *         description: Token válido
 *       '401':
 *         description: Token inválido ou não fornecido
 */
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

/**
 * @swagger
 * /api/v1/empresa/{id}:
 *   get:
 *     summary: Busca uma empresa pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Empresa encontrada
 *       '404':
 *         description: Empresa não encontrada
 *       '500':
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /api/v1/empresa/{id}:
 *   put:
 *     summary: Atualiza os dados de uma empresa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeEmpresa:
 *                 type: string
 *               senha:
 *                 type: string
 *               telefoneEmpresa:
 *                 type: string
 *               emailEmpresa:
 *                 type: string
 *               siteEmpresa:
 *                 type: string
 *               tipoEmpresa:
 *                 type: string
 *               CNPJ:
 *                 type: string
 *               endereco:
 *                 type: object
 *               redesSociais:
 *                 type: object
 *               mensagens:
 *                 type: object
 *               servicos:
 *                 type: object
 *               userImg:
 *                 type: string
 *               local:
 *                 type: object
 *     responses:
 *       '200':
 *         description: Empresa atualizada com sucesso
 *       '404':
 *         description: Empresa não encontrada
 *       '500':
 *         description: Erro interno do servidor
 */
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

/**
 * @swagger
 * /api/v1/empresa/{id}:
 *   delete:
 *     summary: Remove uma empresa pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Empresa deletada com sucesso
 *       '404':
 *         description: Empresa não encontrada
 *       '500':
 *         description: Erro interno do servidor
 */
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

