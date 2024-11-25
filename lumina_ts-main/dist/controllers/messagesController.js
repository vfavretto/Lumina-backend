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
const enviarMensagem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresaEnvia, idEmpresaRecebe, mensagem } = req.body;
    try {
        const novaMensagem = new messagesModel_1.Mensagem({
            idEmpresaEnvia,
            idEmpresaRecebe,
            mensagem,
        });
        yield novaMensagem.save();
        res.status(201).json(novaMensagem);
    }
    catch (error) {
        console.error("Erro ao enviar mensagem:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.enviarMensagem = enviarMensagem;
const buscarMensagensEntreEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresa1, idEmpresa2 } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    try {
        const mensagens = yield messagesModel_1.Mensagem.find({
            $or: [
                { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
                { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
            ],
        })
            .sort({ data: -1 })
            .skip(offset)
            .limit(limit)
            .exec();
        res.status(200).json(mensagens);
    }
    catch (error) {
        console.error("Erro ao buscar mensagens paginadas:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarMensagensEntreEmpresas = buscarMensagensEntreEmpresas;
const buscarUltimaMensagem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresa1, idEmpresa2 } = req.params;
    try {
        const ultimaMensagem = yield messagesModel_1.Mensagem.findOne({
            $or: [
                { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
                { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
            ],
        }).sort({ data: -1 });
        res.status(200).json(ultimaMensagem);
    }
    catch (error) {
        console.error("Erro ao buscar última mensagem:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarUltimaMensagem = buscarUltimaMensagem;
