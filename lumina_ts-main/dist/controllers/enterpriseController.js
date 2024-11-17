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
exports.deleteEmpresa = exports.updateEmpresa = exports.getEmpresa = exports.checkAuth = exports.login = exports.register = void 0;
const enterpriseModel_1 = require("../models/enterpriseModel");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nomeEmpresa, email, password } = req.body;
    try {
        // Verifica se o usuário já existe
        const existingEmpresa = yield enterpriseModel_1.Empresa.findOne({ "auth.email": email });
        if (existingEmpresa) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        // Criptografa a senha
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Cria uma nova empresa com apenas os dados de autenticação
        const empresa = new enterpriseModel_1.Empresa({
            auth: {
                nomeEmpresa,
                email,
                password: hashedPassword,
            },
        });
        // Salva a empresa no banco de dados
        yield empresa.save();
        // Gera um token JWT para o usuário
        const token = jsonwebtoken_1.default.sign({ empresaId: empresa._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        // Retorna os dados da empresa e o token
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
        // Busca a empresa pelo email da empresa
        const empresa = yield enterpriseModel_1.Empresa.findOne({ "auth.email": email });
        if (!empresa || !empresa.auth) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        // Verifica se a senha está correta
        const isPasswordValid = yield bcryptjs_1.default.compare(password, empresa.auth.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid password" });
            return;
        }
        // Gera o token JWT
        const token = jsonwebtoken_1.default.sign({ empresaId: empresa._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        // Retorna os dados da empresa e o token
        res.status(200).json({ empresa, token });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.login = login;
const checkAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Extraímos o token do cabeçalho
    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }
    try {
        // Verifica e decodifica o token JWT
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Busca a empresa pelo ID do token
        const empresa = yield enterpriseModel_1.Empresa.findById(decoded.empresaId);
        if (!empresa) {
            res.status(404).json({ error: "Empresa not found" });
            return;
        }
        // Adiciona os dados da empresa ao objeto `req` para uso nas rotas subsequentes
        req.body.authenticatedEmpresa = empresa;
        // Passa o controle para a próxima função de middleware ou rota
        next();
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});
exports.checkAuth = checkAuth;
const getEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Busca a empresa pelo ID
        const empresa = yield enterpriseModel_1.Empresa.findById(id);
        console.log(empresa);
        if (!empresa) {
            res.status(404).json({ error: "Empresa not found" });
            return;
        }
        // Retorna os dados da empresa
        res.status(200).json(empresa);
    }
    catch (error) {
        console.error("Error fetching empresa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getEmpresa = getEmpresa;
const updateEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // O ID da empresa será passado na URL
    const { nomeEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ, endereco, redesSociais, mensagens, servicos, userImg, local } = req.body;
    try {
        // Atualiza os dados da empresa com os campos fornecidos
        const updatedEmpresa = yield enterpriseModel_1.Empresa.findByIdAndUpdate(id, {
            nomeEmpresa, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ,
            endereco, redesSociais, mensagens, servicos, userImg, local
        }, { new: true } // Retorna o documento atualizado
        );
        // Verifica se a empresa foi encontrada
        if (!updatedEmpresa) {
            res.status(404).json({ error: "Empresa not found" });
            return;
        }
        res.status(200).json({ message: "Dados da empresa atualizados com sucesso!", empresa: updatedEmpresa });
    }
    catch (error) {
        console.error("Error updating empresa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.updateEmpresa = updateEmpresa;
const deleteEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findByIdAndDelete(id);
        if (!empresa) {
            res.status(404).json({ error: "Empresa not found" });
            return;
        }
        res.status(204).json();
    }
    catch (error) {
        console.error("Error deleting empresa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.deleteEmpresa = deleteEmpresa;
