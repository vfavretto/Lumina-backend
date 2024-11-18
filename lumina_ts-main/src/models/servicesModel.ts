import mongoose, { Schema, Document } from "mongoose";

// Interface para o modelo de Serviço
interface IServico extends Document {
  nomeServ: string;
  descServ: string; 
}

const servicoSchema = new Schema<IServico>({
  nomeServ: { type: String, required: true },
  descServ: { type: String, required: true },
});

export const Servico = mongoose.model<IServico>("Servico", servicoSchema);
