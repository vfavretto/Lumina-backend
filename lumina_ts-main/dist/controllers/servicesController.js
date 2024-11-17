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
exports.listarServicosDaEmpresa = exports.buscarServicoPorId = void 0;
const servicesModel_1 = require("../models/servicesModel");
const enterpriseModel_1 = require("../models/enterpriseModel");
// Função para buscar um serviço pelo ID
const buscarServicoPorId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const servico = yield servicesModel_1.Servico.findById(id);
        if (!servico) {
            res.status(404).json({ error: "Serviço não encontrado" });
            return;
        }
        res.status(200).json(servico);
    }
    catch (error) {
        console.error("Erro ao buscar serviço:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarServicoPorId = buscarServicoPorId;
// Função para listar os serviços de uma empresa
const listarServicosDaEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { idEmpresa } = req.params;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findById(idEmpresa);
        if (!empresa) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        // Consultando os serviços associados à empresa
        const servicos = yield servicesModel_1.Servico.find({
            _id: { $in: empresa.servicos }, // Filtrando pelos IDs de serviços da empresa
        });
        res.status(200).json(servicos);
    }
    catch (error) {
        console.error("Erro ao listar serviços da empresa:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.listarServicosDaEmpresa = listarServicosDaEmpresa;
