"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarUltimaMensagem = exports.buscarMensagensEntreEmpresas = exports.enviarMensagem = void 0;
const messagesModel_1 = require("../models/messagesModel");
// Função para enviar uma mensagem
const enviarMensagem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresaEnvia, idEmpresaRecebe, mensagem } = req.body;
    try {
        // Criação da nova mensagem
        const novaMensagem = new messagesModel_1.Mensagem({
            idEmpresaEnvia,
            idEmpresaRecebe,
            mensagem,
        });
        // Salvando a nova mensagem no banco de dados
        yield novaMensagem.save();
        res.status(201).json(novaMensagem);
    }
    catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.enviarMensagem = enviarMensagem;
// Função para buscar todas as mensagens entre duas empresas
const buscarMensagensEntreEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresa1, idEmpresa2 } = req.params;
    try {
        // Buscando as mensagens entre duas empresas
        const mensagens = yield messagesModel_1.Mensagem.find({
            $or: [
                { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
                { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
            ],
        }).sort({ data: 1 }); // Ordenando por data crescente (mensagens mais antigas primeiro)
        res.status(200).json(mensagens);
    }
    catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarMensagensEntreEmpresas = buscarMensagensEntreEmpresas;
// Função para buscar a última mensagem entre duas empresas
const buscarUltimaMensagem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresa1, idEmpresa2 } = req.params;
    try {
        // Buscando a última mensagem entre as duas empresas
        const ultimaMensagem = yield messagesModel_1.Mensagem.findOne({
            $or: [
                { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
                { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
            ],
        }).sort({ data: -1 }); // Ordenando por data decrescente (última mensagem primeiro)
        res.status(200).json(ultimaMensagem);
    }
    catch (error) {
        console.error("Erro ao buscar última mensagem:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarUltimaMensagem = buscarUltimaMensagem;
