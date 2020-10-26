"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefreshToken = exports.createAccesToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
require("dotenv-safe/config");
exports.createAccesToken = (user) => {
    return jsonwebtoken_1.sign({ userId: user.id }, process.env.ACCES_TOKEN_SECRET, { expiresIn: "15s" });
};
exports.createRefreshToken = (user) => {
    return jsonwebtoken_1.sign({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });
};
//# sourceMappingURL=auth.js.map