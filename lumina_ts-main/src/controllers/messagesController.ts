import { Request, Response } from "express";
import { Mensagem } from "../models/messagesModel";
import { Empresa } from "../models/enterpriseModel";
import mongoose from "mongoose";

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

export const buscarMensagensEntreEmpresas = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresa1, idEmpresa2 } = req.params;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = parseInt(req.query.offset as string) || 0;
  try {
    const mensagens = await Mensagem.find({
      $or: [
        { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
        { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
      ],
    })
      .sort({ data: -1 })
      .skip(offset)
      .limit(limit)
      .exec();

    res.status(200).json(mensagens);
  } catch (error) {
    console.error("Erro ao buscar mensagens paginadas:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

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

export const buscarEmpresasComConversa = async (req: Request, res: Response): Promise<void> => {
  const { idEmpresa } = req.params;

  try {
    // Agregação para encontrar empresas com mensagens
    const conversas = await Mensagem.aggregate([
      {
        $match: {
          $or: [
            { idEmpresaEnvia: new mongoose.Types.ObjectId(idEmpresa) },
            { idEmpresaRecebe: new mongoose.Types.ObjectId(idEmpresa) }
          ]
        }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$idEmpresaEnvia', new mongoose.Types.ObjectId(idEmpresa)] },
              '$idEmpresaRecebe',
              '$idEmpresaEnvia'
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'empresas',
          localField: '_id',
          foreignField: '_id',
          as: 'empresaInfo'
        }
      },
      {
        $unwind: '$empresaInfo'
      },
      {
        $project: {
          _id: '$empresaInfo._id',
          nomeEmpresa: '$empresaInfo.nomeEmpresa',
          userImg: '$empresaInfo.userImg',
          emailEmpresa: '$empresaInfo.emailEmpresa'
        }
      }
    ]);

    res.status(200).json(conversas);
  } catch (error) {
    console.error("Erro ao buscar empresas com conversa:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};
