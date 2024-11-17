import mongoose, { Schema, Document } from "mongoose";

// Interface para o modelo de Serviço
interface IServico extends Document {
  nomeServ: string; // Nome do serviço
  descServ: string; // Descrição do serviço
}

// Definindo o esquema do modelo de Serviço
const servicoSchema = new Schema<IServico>({
  nomeServ: { type: String, required: true },
  descServ: { type: String, required: true },
});

// Criando o modelo de Serviço
export const Servico = mongoose.model<IServico>("Servico", servicoSchema);
