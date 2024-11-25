"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
const routes_1 = __importDefault(require("./config/routes"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const yaml_1 = __importDefault(require("yaml"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: `${process.env.VITE_FRONTEND_URL}`,
}));
(0, database_1.default)();
app.use(express_1.default.json());
const swaggerPath = process.env.NODE_ENV === "production"
    ? path_1.default.join(__dirname, "../dist/config/swagger.yaml")
    : path_1.default.join(__dirname, "../src/config/swagger.yaml");
let swaggerFile;
if (fs_1.default.existsSync(swaggerPath)) {
    const swaggerContent = fs_1.default.readFileSync(swaggerPath, "utf-8");
    swaggerFile = yaml_1.default.parse(swaggerContent);
}
else {
    console.error("⚠️ Arquivo Swagger não encontrado. A documentação não estará disponível.");
}
if (swaggerFile) {
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerFile));
}
app.use("/api/v1", routes_1.default);
exports.default = app;
