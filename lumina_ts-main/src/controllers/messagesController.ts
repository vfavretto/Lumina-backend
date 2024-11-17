import { Request, Response } from "express";
import { Mensagem } from "../models/messagesModel";

// Função para enviar uma mensagem
export const enviarMensagem = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresaEnvia, idEmpresaRecebe, mensagem } = req.body;

  try {
    // Criação da nova mensagem
    const novaMensagem = new Mensagem({
      idEmpresaEnvia,
      idEmpresaRecebe,
      mensagem,
    });

    // Salvando a nova mensagem no banco de dados
    await novaMensagem.save();

    res.status(201).json(novaMensagem);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Função para buscar todas as mensagens entre duas empresas
export const buscarMensagensEntreEmpresas = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresa1, idEmpresa2 } = req.params;

  try {
    // Buscando as mensagens entre duas empresas
    const mensagens = await Mensagem.find({
      $or: [
        { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
        { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
      ],
    }).sort({ data: 1 }); // Ordenando por data crescente (mensagens mais antigas primeiro)

    res.status(200).json(mensagens);
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// Função para buscar a última mensagem entre duas empresas
export const buscarUltimaMensagem = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresa1, idEmpresa2 } = req.params;

  try {
    // Buscando a última mensagem entre as duas empresas
    const ultimaMensagem = await Mensagem.findOne({
      $or: [
        { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
        { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
      ],
    }).sort({ data: -1 }); // Ordenando por data decrescente (última mensagem primeiro)

    res.status(200).json(ultimaMensagem);
  } catch (error) {
    console.error("Erro ao buscar última mensagem:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
