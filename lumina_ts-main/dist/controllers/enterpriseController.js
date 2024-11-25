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
exports.listEmpresas = exports.deleteEmpresa = exports.updateEmpresa = exports.getEmpresa = exports.checkAuth = exports.login = exports.register = void 0;
const enterpriseModel_1 = require("../models/enterpriseModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push("Senha deve ter no mínimo 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Senha deve conter pelo menos uma letra maiúscula");
    }
    if (!/[a-z]/.test(password)) {
        errors.push("Senha deve conter pelo menos uma letra minúscula");
    }
    if (!/\d/.test(password)) {
        errors.push("Senha deve conter pelo menos um número");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Senha deve conter pelo menos um caractere especial");
    }
    return {
        valid: errors.length === 0,
        errors
    };
};
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nomeEmpresa, email, password } = req.body;
    try {
        if (!validateEmail(email)) {
            res.status(400).json({ error: "Formato de email inválido" });
            return;
        }
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            res.status(400).json({
                error: "Requisitos de senha não atendidos",
                details: passwordValidation.errors
            });
            return;
        }
        const existingEmpresa = yield enterpriseModel_1.Empresa.findOne({ "auth.email": email });
        if (existingEmpresa) {
            res.status(400).json({ error: "Usuario já existe" });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const empresa = new enterpriseModel_1.Empresa({
            auth: {
                nomeEmpresa,
                email,
                password: hashedPassword,
            },
        });
        yield empresa.save();
        const token = jsonwebtoken_1.default.sign({ empresaId: empresa._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(201).json({ empresa, token });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        if (!validateEmail(email)) {
            res.status(400).json({ error: "Formato de email inválido" });
            return;
        }
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            res.status(400).json({
                error: "Requisitos de senha não atendidos",
                details: passwordValidation.errors
            });
            return;
        }
        const empresa = yield enterpriseModel_1.Empresa.findOne({ "auth.email": email });
        if (!empresa || !empresa.auth) {
            res.status(401).json({ error: "Usuario não encontrado" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, empresa.auth.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Senha invalida" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ empresaId: empresa._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ empresa, token });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.login = login;
const checkAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Nenhum token fornecido" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const empresa = yield enterpriseModel_1.Empresa.findById(decoded.empresaId);
        if (!empresa) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        req.body.authenticatedEmpresa = empresa;
        next();
    }
    catch (error) {
        res.status(500).json({ error: "Erro ao buscar empresa no banco" });
        return;
    }
});
exports.checkAuth = checkAuth;
const getEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findById(id);
        console.log(empresa);
        if (!empresa) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        res.status(200).json(empresa);
    }
    catch (error) {
        console.error("Erro ao buscar empresa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getEmpresa = getEmpresa;
const updateEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nomeEmpresa, password, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ, endereco, redesSociais, mensagens, servicos, userImg, local, } = req.body;
    try {
        const updatedEmpresa = yield enterpriseModel_1.Empresa.findByIdAndUpdate(id, {
            "auth.nomeEmpresa": nomeEmpresa,
            "auth.password": password,
            "auth.email": emailEmpresa,
            telefoneEmpresa,
            emailEmpresa,
            siteEmpresa,
            tipoEmpresa,
            CNPJ,
            endereco,
            redesSociais,
            mensagens,
            servicos,
            userImg,
            local,
        }, { new: true });
        if (!updatedEmpresa) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        res
            .status(200)
            .json({
            message: "Dados da empresa atualizados com sucesso!",
            empresa: updatedEmpresa,
        });
    }
    catch (error) {
        console.error("Erro ao atualizar empresa:", error);
        res.status(500).json({ error: "Erro ao atualizar empresa" });
    }
});
exports.updateEmpresa = updateEmpresa;
const deleteEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findByIdAndDelete(id);
        if (!empresa) {
            res.status(404).json({ error: "Empresa não encontrada" });
            return;
        }
        res.status(204).json();
    }
    catch (error) {
        console.error("Erro ao deletar empresa:", error);
        res.status(500).json({ error: "Erro ao deletar empresa" });
    }
});
exports.deleteEmpresa = deleteEmpresa;
const listEmpresas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tipo = req.query.tipo;
    const skip = (page - 1) * limit;
    try {
        let filter = {};
        if (tipo === "contratante" || tipo === "fornecedor") {
            filter = { tipoEmpresa: { $in: [tipo, "ambos"] } };
        }
        const empresas = yield enterpriseModel_1.Empresa.find(filter)
            .skip(skip)
            .limit(limit)
            .exec();
        const totalEmpresas = yield enterpriseModel_1.Empresa.countDocuments(filter);
        const totalPages = Math.ceil(totalEmpresas / limit);
        res.status(200).json({
            page,
            totalPages,
            totalEmpresas,
            empresas,
        });
    }
    catch (error) {
        console.error("Erro ao listar empresas:", error);
        res.status(500).json({ error: "Erro ao listar empresas" });
    }
});
exports.listEmpresas = listEmpresas;
