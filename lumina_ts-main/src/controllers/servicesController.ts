import { Request, Response } from "express";
import { Servico } from "../models/servicesModel";
import { Empresa } from "../models/enterpriseModel";

/**
 * @swagger
 * /api/v1/servicos/{id}:
 *   get:
 *     summary: Busca um serviço pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Serviço encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 nome:
 *                   type: string
 *                 descricao:
 *                   type: string
 *                 preco:
 *                   type: number
 *       '404':
 *         description: Serviço não encontrado
 *       '500':
 *         description: Erro interno do servidor
 */
export const buscarServicoPorId = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const servico = await Servico.findById(id);
    if (!servico) {
      res.status(404).json({ error: "Serviço não encontrado" });
      return;
    }

    res.status(200).json(servico);
  } catch (error) {
    console.error("Erro ao buscar serviço:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

/**
 * @swagger
 * /api/v1/servicos/empresa/{idEmpresa}:
 *   get:
 *     summary: Lista todos os serviços de uma empresa
 *     parameters:
 *       - in: path
 *         name: idEmpresa
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de serviços da empresa retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   nome:
 *                     type: string
 *                   descricao:
 *                     type: string
 *                   preco:
 *                     type: number
 *       '404':
 *         description: Empresa não encontrada
 *       '500':
 *         description: Erro interno do servidor
 */
export const listarServicosDaEmpresa = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresa } = req.params;

  try {
    const empresa = await Empresa.findById(idEmpresa);
    if (!empresa) {
      res.status(404).json({ error: "Empresa não encontrada" });
      return;
    }

    const servicos = await Servico.find({
      _id: { $in: empresa.servicos }, 
    });

    res.status(200).json(servicos);
  } catch (error) {
    console.error("Erro ao listar serviços da empresa:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
