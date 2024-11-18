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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buscarEmpresa = exports.listarEmpresas = exports.editarEmpresa = exports.deletarEmpresa = exports.verificarAutenticacaoAdmin = exports.validarAdmin = exports.adicionarAdmin = exports.adicionarPrimeiroAdmin = void 0;
const admModel_1 = require("../models/admModel");
const enterpriseModel_1 = require("../models/enterpriseModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Função para adicionar o primeiro administrador
const adicionarPrimeiroAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Verificar se já existe algum administrador
        const adminExistente = yield admModel_1.Administrador.findOne();
        if (adminExistente) {
            res.status(400).json({ error: "Já existe um administrador cadastrado" });
            return;
        }
        // Criar um novo administrador
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const novoAdmin = new admModel_1.Administrador({
            email,
            password: hashedPassword,
        });
        // Salvando o administrador no banco de dados
        yield novoAdmin.save();
        // Gerar token JWT para o primeiro admin
        const token = jsonwebtoken_1.default.sign({ adminId: novoAdmin._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            message: "Primeiro administrador criado com sucesso",
            token,
            adminId: novoAdmin._id
        });
    }
    catch (error) {
        console.error("Erro ao adicionar o primeiro administrador:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.adicionarPrimeiroAdmin = adicionarPrimeiroAdmin;
// Função para adicionar novos administradores
const adicionarAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = req.body;
    try {
        // Verificar se o email já está em uso
        const emailExistente = yield admModel_1.Administrador.findOne({ email });
        if (emailExistente) {
            res.status(400).json({ error: "Este email já está em uso" });
            return;
        }
        // Criptografando a senha do novo administrador
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const novoAdmin = new admModel_1.Administrador({
            email,
            password: hashedPassword,
        });
        // Salvando o novo administrador
        yield novoAdmin.save();
        res.status(201).json({
            message: "Novo administrador criado com sucesso",
            createdBy: (_a = req.admin) === null || _a === void 0 ? void 0 : _a.email,
            newAdminEmail: email
        });
    }
    catch (error) {
        console.error("Erro ao adicionar novo administrador:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.adicionarAdmin = adicionarAdmin;
// Função para validar admin (login) - atualizada para usar JWT
const validarAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Verificando se existe um administrador com o email fornecido
        const administrador = yield admModel_1.Administrador.findOne({ email });
        if (!administrador) {
            res.status(401).json({ error: "Administrador não encontrado" });
            return;
        }
        // Comparando a senha fornecida com a senha do administrador
        const isPasswordValid = yield bcryptjs_1.default.compare(password, administrador.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Senha inválida" });
            return;
        }
        // Gerando token JWT para o admin
        const token = jsonwebtoken_1.default.sign({ adminId: administrador._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({
            message: "Login de administrador bem-sucedido",
            token,
            adminId: administrador._id
        });
    }
    catch (error) {
        console.error("Erro ao validar administrador:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.validarAdmin = validarAdmin;
// Middleware melhorado de verificação de admin
const verificarAutenticacaoAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Token não fornecido" });
            return;
        }
        // Verificar e decodificar o token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Buscar o admin no banco
        const admin = yield admModel_1.Administrador.findById(decoded.adminId);
        if (!admin) {
            res.status(403).json({ error: "Administrador não encontrado" });
            return;
        }
        // Adicionar o admin ao objeto da requisição
        req.admin = admin;
        next();
    }
    catch (error) {
        console.error("Erro na autenticação:", error);
        res.status(401).json({ error: "Token inválido ou expirado" });
    }
});
exports.verificarAutenticacaoAdmin = verificarAutenticacaoAdmin;
// Método para deletar empresa (protegido)
const deletarEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findById(id);
        if (!empresa) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        yield enterpriseModel_1.Empresa.findByIdAndDelete(id);
        res.status(200).json({
            message: "Empresa deletada com sucesso",
            deletedCompany: empresa.auth.nomeEmpresa,
            deletedBy: (_a = req.admin) === null || _a === void 0 ? void 0 : _a.email
        });
    }
    catch (error) {
        console.error("Erro ao deletar empresa:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.deletarEmpresa = deletarEmpresa;
// Método para editar empresa (protegido)
const editarEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const { id } = req.params;
    const dadosAtualizacao = req.body;
    try {
        const empresaExistente = yield enterpriseModel_1.Empresa.findById(id);
        if (!empresaExistente) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        if (((_a = dadosAtualizacao.auth) === null || _a === void 0 ? void 0 : _a.email) &&
            dadosAtualizacao.auth.email !== empresaExistente.auth.email) {
            const emailExiste = yield enterpriseModel_1.Empresa.findOne({
                "auth.email": dadosAtualizacao.auth.email,
            });
            if (emailExiste) {
                res.status(400).json({ error: "Este email já está em uso" });
                return;
            }
        }
        if ((_b = dadosAtualizacao.auth) === null || _b === void 0 ? void 0 : _b.password) {
            dadosAtualizacao.auth.password = yield bcryptjs_1.default.hash(dadosAtualizacao.auth.password, 10);
        }
        const empresaAtualizada = yield enterpriseModel_1.Empresa.findByIdAndUpdate(id, { $set: dadosAtualizacao }, { new: true, runValidators: true });
        res.status(200).json({
            message: "Empresa atualizada com sucesso",
            empresa: empresaAtualizada,
            updatedBy: (_c = req.admin) === null || _c === void 0 ? void 0 : _c.email
        });
    }
    catch (error) {
        console.error("Erro ao atualizar empresa:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.editarEmpresa = editarEmpresa;
// Método para listar empresas (protegido)
const listarEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const empresas = yield enterpriseModel_1.Empresa.find({}, { "auth.password": 0 });
        res.status(200).json({
            quantidade: empresas.length,
            empresas,
            requestedBy: (_a = req.admin) === null || _a === void 0 ? void 0 : _a.email
        });
    }
    catch (error) {
        console.error("Erro ao listar empresas:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.listarEmpresas = listarEmpresas;
// Método para buscar empresa específica (protegido)
const buscarEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findById(id, { "auth.password": 0 });
        if (!empresa) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        res.status(200).json({
            empresa,
            requestedBy: (_a = req.admin) === null || _a === void 0 ? void 0 : _a.email
        });
    }
    catch (error) {
        console.error("Erro ao buscar empresa:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.buscarEmpresa = buscarEmpresa;
