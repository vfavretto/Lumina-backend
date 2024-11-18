import { Request, Response } from "express";
import { Servico } from "../models/servicesModel";
import { Empresa } from "../models/enterpriseModel";

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
