"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empresa = void 0;
const mongoose_1 = __importStar(require("mongoose"));
<<<<<<< HEAD
=======
// Definindo o esquema do modelo de Empresa
>>>>>>> 13009c0098f9d41bbc88928512de1ab5a526b7e1
const EmpresaSchema = new mongoose_1.Schema({
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
    servicos: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Servico" }],
    userImg: { type: String },
    local: {
        type: { type: String, default: "Point" },
        coordinates: [{ type: Number }],
    },
});
// Criando o modelo de Empresa
exports.Empresa = mongoose_1.default.model("Empresa", EmpresaSchema);
