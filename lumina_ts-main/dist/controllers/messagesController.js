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
/**
 * @swagger
 * /api/v1/mensagens:
 *   post:
 *     summary: Envia uma nova mensagem entre empresas
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idEmpresaEnvia:
 *                 type: string
 *               idEmpresaRecebe:
 *                 type: string
 *               mensagem:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Mensagem enviada com sucesso
 *       '500':
 *         description: Erro interno do servidor
 */
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
/**
 * @swagger
 * /api/v1/mensagens/{idEmpresa1}/{idEmpresa2}:
 *   get:
 *     summary: Busca todas as mensagens entre duas empresas
 *     parameters:
 *       - in: path
 *         name: idEmpresa1
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idEmpresa2
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Lista de mensagens entre as empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idEmpresaEnvia:
 *                     type: string
 *                   idEmpresaRecebe:
 *                     type: string
 *                   mensagem:
 *                     type: string
 *                   data:
 *                     type: string
 *                     format: date-time
 *       '500':
 *         description: Erro interno do servidor
 */
const buscarMensagensEntreEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresa1, idEmpresa2 } = req.params;
    try {
        const mensagens = yield messagesModel_1.Mensagem.find({
            $or: [
                { idEmpresaEnvia: idEmpresa1, idEmpresaRecebe: idEmpresa2 },
                { idEmpresaEnvia: idEmpresa2, idEmpresaRecebe: idEmpresa1 },
            ],
        }).sort({ data: 1 });
        res.status(200).json(mensagens);
    }
    catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarMensagensEntreEmpresas = buscarMensagensEntreEmpresas;
/**
 * @swagger
 * /api/v1/mensagens/ultima/{idEmpresa1}/{idEmpresa2}:
 *   get:
 *     summary: Busca a última mensagem entre duas empresas
 *     parameters:
 *       - in: path
 *         name: idEmpresa1
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: idEmpresa2
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Última mensagem entre as empresas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idEmpresaEnvia:
 *                   type: string
 *                 idEmpresaRecebe:
 *                   type: string
 *                 mensagem:
 *                   type: string
 *                 data:
 *                   type: string
 *                   format: date-time
 *       '500':
 *         description: Erro interno do servidor
 */
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
