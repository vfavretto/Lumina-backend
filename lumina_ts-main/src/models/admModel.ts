import mongoose, { Schema, Document } from "mongoose";


export interface IAdministrador extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  email: string;
  password: string;
}

const administradorSchema = new Schema<IAdministrador>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const Administrador = mongoose.model<IAdministrador>(
  "Administrador",
  administradorSchema
);
