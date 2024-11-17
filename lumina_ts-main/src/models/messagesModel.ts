import mongoose, { Schema, Document } from "mongoose";

// Interface para o modelo de Mensagem
interface IMensagem extends Document {
  idEmpresaEnvia: mongoose.Types.ObjectId;
  idEmpresaRecebe: mongoose.Types.ObjectId;
  mensagem: string;
  data: Date;
}

// Definindo o esquema do modelo de Mensagem
const mensagemSchema = new Schema<IMensagem>({
  idEmpresaEnvia: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa", required: true },
  idEmpresaRecebe: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa", required: true },
  mensagem: { type: String, required: true },
  data: { type: Date, default: Date.now }, // Data padrão é a data atual
});

// Criando o modelo de Mensagem
export const Mensagem = mongoose.model<IMensagem>("Mensagem", mensagemSchema);
