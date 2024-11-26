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
  userName: string;
  email: string;
  password: string;
}

// Interface principal para o modelo de Empresa
interface IEmpresa extends Document {
  auth: IAuth;
  telefoneEmpresa?: string;
  nomeResponsavel?: string;
  cargoResponsavel?: string;
  nomeEmpresa?: string;
  emailEmpresa?: string;
  siteEmpresa?: string;
  tipoEmpresa: "contratante" | "fornecedor" | "ambos";
  CNPJ?: string;
  endereco?: IEndereco;
  redesSociais?: IRedesSociais;
  servicos: mongoose.Types.ObjectId[];
  userImg?: string;
  descricao?: string;
  local?: {
    type: string;
    coordinates: number[];
  };
}

const EmpresaSchema = new Schema<IEmpresa>({
  auth: {
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  telefoneEmpresa: { type: String },
  nomeResponsavel: { type: String },
  cargoResponsavel: { type: String },
  nomeEmpresa: { type: String},
  emailEmpresa: { type: String },
  siteEmpresa: { type: String },
  tipoEmpresa: {
    type: String,
    enum: ["contratante", "fornecedor", "ambos"],
  },
  CNPJ: { type: String, unique: true, sparse: true },
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
  descricao: { type: String},
  local: {
    type: { type: String, default: "Point" },
    coordinates: [{ type: Number }],
  },
});

export const Empresa = mongoose.model<IEmpresa>("Empresa", EmpresaSchema);
