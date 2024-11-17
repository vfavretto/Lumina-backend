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
exports.verificarAutenticacao = exports.adicionarAdmin = exports.adicionarPrimeiroAdmin = exports.validarAdmin = void 0;
const admModel_1 = require("../models/admModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Função para validar se a empresa é um administrador
const validarAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Verificando se existe um administrador com o email fornecido
        const administrador = yield admModel_1.Administrador.findOne({ email });
        if (!administrador) {
            res.status(401).json({ error: "Administrador não encontrado" });
            return;
        }
        // Comparando a senha fornecida com a senha do administrador (criptografada)
        const isPasswordValid = yield bcryptjs_1.default.compare(password, administrador.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Senha inválida" });
            return;
        }
        // Se a autenticação for bem-sucedida, conceder privilégio de administrador
        res.status(200).json({ message: "Login de administrador bem-sucedido" });
    }
    catch (error) {
        console.error("Erro ao validar administrador:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.validarAdmin = validarAdmin;
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
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10); // Criptografando a senha
        const novoAdmin = new admModel_1.Administrador({
            email,
            password: hashedPassword, // Salvando a senha criptografada
        });
        // Salvando o administrador no banco de dados
        yield novoAdmin.save();
        res.status(201).json({ message: "Primeiro administrador criado com sucesso" });
    }
    catch (error) {
        console.error("Erro ao adicionar o primeiro administrador:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.adicionarPrimeiroAdmin = adicionarPrimeiroAdmin;
// Função para adicionar novos administradores, apenas se já existir um primeiro administrador
const adicionarAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { email, password } = req.body;
    try {
        // Verificar se já existe algum administrador
        const adminExistente = yield admModel_1.Administrador.findOne();
        if (!adminExistente) {
            res.status(403).json({ error: "Nenhum administrador registrado ainda. O primeiro administrador deve ser criado primeiro." });
            return;
        }
        // Verificar se o usuário que está fazendo a requisição é o primeiro administrador
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Token de autenticação não fornecido" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = yield admModel_1.Administrador.findById(decoded.userId);
        if (!admin || admin.email !== adminExistente.email) {
            res.status(403).json({ error: "Você não tem permissão para adicionar administradores" });
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
        res.status(201).json({ message: "Novo administrador criado com sucesso" });
    }
    catch (error) {
        console.error("Erro ao adicionar novo administrador:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.adicionarAdmin = adicionarAdmin;
// Middleware para verificar se o usuário está autenticado e é o primeiro administrador
const verificarAutenticacao = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ error: "Token não fornecido" });
        return;
    }
    try {
        // Decodificando o token JWT
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Verificando se o primeiro administrador existe e pegando o tipo correto
        const adminExistente = yield admModel_1.Administrador.findOne();
        if (!adminExistente) {
            res.status(403).json({ error: "Nenhum administrador registrado. Não é possível adicionar administradores." });
            return;
        }
        // Garantindo que adminExistente é do tipo Administrador
        const admin = adminExistente;
        // Verificando se o usuário do token é o primeiro administrador
        if (decoded.userId !== admin._id.toString()) {
            res.status(403).json({ error: "Você não tem permissão para adicionar administradores" });
            return;
        }
        // Se tudo estiver certo, prossiga com a requisição
        next();
    }
    catch (error) {
        console.error("Erro ao verificar autenticidade:", error);
        res.status(401).json({ error: "Token inválido ou expirado" });
        return;
    }
});
exports.verificarAutenticacao = verificarAutenticacao;
