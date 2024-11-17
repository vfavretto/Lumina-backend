"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Empresa = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const EmpresaSchema = new mongoose_1.default.Schema({
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
    // mensagens: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mensagem" }],
    servicos: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: "Servico" }],
    userImg: { type: String },
    local: {
        type: { type: String, default: "Point" },
        coordinates: [{ type: Number }],
    },
});
exports.Empresa = mongoose_1.default.model("Empresa", EmpresaSchema);
