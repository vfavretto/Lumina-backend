"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
router.get('/check', userController_1.checkAuth);
router.get('/user/:id', userController_1.getEmpresa);
router.put('/user/:id', userController_1.updateEmpresa);
router.delete('/user/:id', userController_1.deleteEmpresa);
exports.default = router;
