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
/**
 * @swagger
 * /api/v1/empresa/register:
 *   post:
 *     summary: Registra uma nova empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeEmpresa:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Empresa criada com sucesso
 *       '400':
 *         description: Empresa já registrada
 *       '500':
 *         description: Erro interno do servidor
 */
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nomeEmpresa, email, password } = req.body;
    try {
        const existingEmpresa = yield enterpriseModel_1.Empresa.findOne({ "auth.email": email });
        if (existingEmpresa) {
            res.status(400).json({ error: "User already exists" });
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
/**
 * @swagger
 * /api/v1/empresa/login:
 *   post:
 *     summary: Realiza login para a empresa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Login realizado com sucesso
 *       '401':
 *         description: Credenciais inválidas
 *       '500':
 *         description: Erro interno do servidor
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findOne({ "auth.email": email });
        if (!empresa || !empresa.auth) {
            res.status(401).json({ error: "User not found" });
            return;
        }
        const isPasswordValid = yield bcryptjs_1.default.compare(password, empresa.auth.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: "Invalid password" });
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
/**
 * @swagger
 * /api/v1/empresa/auth:
 *   get:
 *     summary: Verifica a autenticação do token JWT
 *     responses:
 *       '200':
 *         description: Token válido
 *       '401':
 *         description: Token inválido ou não fornecido
 */
const checkAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]; // Extraímos o token do cabeçalho
    if (!token) {
        res.status(401).json({ error: "No token provided" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const empresa = yield enterpriseModel_1.Empresa.findById(decoded.empresaId);
        if (!empresa) {
            res.status(404).json({ error: "Empresa not found" });
            return;
        }
        req.body.authenticatedEmpresa = empresa;
        next();
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ error: "Invalid token" });
    }
});
exports.checkAuth = checkAuth;
/**
 * @swagger
 * /api/v1/empresa/{id}:
 *   get:
 *     summary: Busca uma empresa pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Empresa encontrada
 *       '404':
 *         description: Empresa não encontrada
 *       '500':
 *         description: Erro interno do servidor
 */
const getEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const empresa = yield enterpriseModel_1.Empresa.findById(id);
        console.log(empresa);
        if (!empresa) {
            res.status(404).json({ error: "Empresa not found" });
            return;
        }
        res.status(200).json(empresa);
    }
    catch (error) {
        console.error("Error fetching empresa:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getEmpresa = getEmpresa;
/**
 * @swagger
 * /api/v1/empresa/{id}:
 *   put:
 *     summary: Atualiza os dados de uma empresa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomeEmpresa:
 *                 type: string
 *               senha:
 *                 type: string
 *               telefoneEmpresa:
 *                 type: string
 *               emailEmpresa:
 *                 type: string
 *               siteEmpresa:
 *                 type: string
 *               tipoEmpresa:
 *                 type: string
 *               CNPJ:
 *                 type: string
 *               endereco:
 *                 type: object
 *               redesSociais:
 *                 type: object
 *               mensagens:
 *                 type: object
 *               servicos:
 *                 type: object
 *               userImg:
 *                 type: string
 *               local:
 *                 type: object
 *     responses:
 *       '200':
 *         description: Empresa atualizada com sucesso
 *       '404':
 *         description: Empresa não encontrada
 *       '500':
 *         description: Erro interno do servidor
 */
const updateEmpresa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { nomeEmpresa, senha, telefoneEmpresa, emailEmpresa, siteEmpresa, tipoEmpresa, CNPJ, endereco, redesSociais, mensagens, servicos, userImg, local } = req.body;
    try {
        const updatedEmpresa = yield enterpriseModel_1.Empresa.findByIdAndUpdate(id, {
            'auth.nomeEmpresa': nomeEmpresa,
            'auth.senha': senha,
            'auth.email': emailEmpresa,
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
            local
        }, { new: true });
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
/**
 * @swagger
 * /api/v1/empresa/{id}:
 *   delete:
 *     summary: Remove uma empresa pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Empresa deletada com sucesso
 *       '404':
 *         description: Empresa não encontrada
 *       '500':
 *         description: Erro interno do servidor
 */
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
