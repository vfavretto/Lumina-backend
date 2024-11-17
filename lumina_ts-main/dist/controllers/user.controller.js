"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = void 0;
const getUser = (_req, res) => {
    const user = {
        id: 1,
        name: 'João Silva',
        age: 18
    };
    res.json(user);
};
exports.getUser = getUser;
