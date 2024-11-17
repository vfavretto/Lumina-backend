import mongoose, { Schema, Document } from "mongoose";

// Interface para o endereço da empresa
interface IEndereco {
  cidade: string;
  UF: string;
  CEP: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento: string;
}

// Interface para as redes sociais
interface IRedesSociais {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
}

// Interface para autenticação
interface IAuth {
  nomeEmpresa: string;
  email: string;
  password: string;
}

// Interface principal para o modelo de Empresa
interface IEmpresa extends Document {
  auth: IAuth;
  telefoneEmpresa?: string;
  emailEmpresa?: string;
  siteEmpresa?: string;
  tipoEmpresa: string[];
  CNPJ?: string;
  endereco?: IEndereco;
  redesSociais?: IRedesSociais;
  servicos: mongoose.Types.ObjectId[];
  userImg?: string;
  local?: {
    type: string;
    coordinates: number[];
  };
}

// Definindo o esquema do modelo de Empresa
const EmpresaSchema = new Schema<IEmpresa>({
  auth: {
    nomeEmpresa: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  telefoneEmpresa: { type: String },
  emailEmpresa: { type: String },
  siteEmpresa: { type: String },
  tipoEmpresa: [{ type: String }],
  CNPJ: { type: String },
  endereco: {
    cidade: { type: String },
    UF: { type: String },
    CEP: { type: String },
    logradouro: { type: String },
    numero: { type: String },
    bairro: { type: String },
    complemento: { type: String },
  },
  redesSociais: {
    facebook: { type: String },
    instagram: { type: String },
    linkedin: { type: String },
  },
  servicos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Servico" }],
  userImg: { type: String },
  local: {
    type: { type: String, default: "Point" },
    coordinates: [{ type: Number }],
  },
});

// Criando o modelo de Empresa
export const Empresa = mongoose.model<IEmpresa>("Empresa", EmpresaSchema);