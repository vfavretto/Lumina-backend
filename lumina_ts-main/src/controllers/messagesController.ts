import { Request, Response } from "express";
import { Mensagem } from "../models/messagesModel";

/**
 * @swagger
 * /api/v1/mensagens:
 *   post:
 *     summary: Envia uma nova mensagem entre empresas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idEmpresaEnvia:
 *                 type: string
 *               idEmpresaRecebe:
 *                 type: string
 *               mensagem:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Mensagem enviada com sucesso
 *       '500':
 *         description: Erro interno do servidor
 */
export const enviarMensagem = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresaEnvia, idEmpresaRecebe, mensagem } = req.body;

  try {
    const novaMensagem = new Mensagem({
      idEmpresaEnvia,
      idEmpresaRecebe,
      mensagem,
    });

    await novaMensagem.save();

    res.status(201).json(novaMensagem);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /api/v1/mensagens/{idEmpresa1}/{idEmpresa2}:
 *   get:
 *     summary: Busca todas as mensagens entre duas empresas
 *     parameters:
 *       - in: path
 *         name: idEmpresa1
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idEmpresa2
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de mensagens entre as empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idEmpresaEnvia:
 *                     type: string
 *                   idEmpresaRecebe:
 *                     type: string
 *                   mensagem:
 *                     type: string
 *                   data:
 *                     type: string
 *                     format: date-time
 *       '500':
 *         description: Erro interno do servidor
 */
export const buscarMensagensEntreEmpresas = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresa1, idEmpresa2 } = req.params;

  try {
    const mensagens = await Mensagem.find({
      $or: [
        { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
        { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
      ],
    }).sort({ data: 1 });

    res.status(200).json(mensagens);
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /api/v1/mensagens/ultima/{idEmpresa1}/{idEmpresa2}:
 *   get:
 *     summary: Busca a última mensagem entre duas empresas
 *     parameters:
 *       - in: path
 *         name: idEmpresa1
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idEmpresa2
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Última mensagem entre as empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idEmpresaEnvia:
 *                   type: string
 *                 idEmpresaRecebe:
 *                   type: string
 *                 mensagem:
 *                   type: string
 *                 data:
 *                   type: string
 *                   format: date-time
 *       '500':
 *         description: Erro interno do servidor
 */
export const buscarUltimaMensagem = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresa1, idEmpresa2 } = req.params;

  try {
    const ultimaMensagem = await Mensagem.findOne({
      $or: [
        { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
        { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
      ],
    }).sort({ data: -1 }); 

    res.status(200).json(ultimaMensagem);
  } catch (error) {
    console.error("Erro ao buscar última mensagem:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
