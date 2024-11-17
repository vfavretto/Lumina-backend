import mongoose, { Schema, Document } from "mongoose";

// Interface para o modelo de Administrador
export interface IAdministrador extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  email: string; // Email do administrador
  password: string; // Senha do administrador
}

// Definindo o esquema do modelo de Administrador
const administradorSchema = new Schema<IAdministrador>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Criando o modelo de Administrador
export const Administrador = mongoose.model<IAdministrador>(
  "Administrador",
  administradorSchema
);
