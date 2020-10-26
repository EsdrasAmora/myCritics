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
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
require("dotenv-safe/config");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const user_1 = require("./resolvers/user");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jsonwebtoken_1 = require("jsonwebtoken");
const auth_1 = require("./auth");
const sendRefreshToken_1 = require("./sendRefreshToken");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const app = express_1.default();
    app.use(cookie_parser_1.default());
    app.set("trust proxy", 1);
    app.use(cors_1.default({ origin: process.env.CORS_ORIGIN, credentials: true }));
    app.post("/refresh_token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const token = req.cookies.jid;
        if (!token) {
            return res.send({ ok: false, accessToken: "" });
        }
        let payload = null;
        try {
            payload = jsonwebtoken_1.verify(token, process.env.REFRESH_TOKEN_SECRET);
        }
        catch (err) {
            console.log(err);
            return res.send({ ok: false, accessToken: "" });
        }
        const user = yield User_1.User.findOne({ id: payload.userId });
        if (!user) {
            return res.send({ ok: false, accessToken: "" });
        }
        if (user.tokenVersion !== payload.tokenVersion) {
            return res.send({ ok: false, accessToken: "" });
        }
        sendRefreshToken_1.sendRefreshToken(res, auth_1.createRefreshToken(user));
        return res.send({ ok: true, accessToken: auth_1.createAccesToken(user) });
    }));
    yield typeorm_1.createConnection({
        url: process.env.DATABASE_URL,
        password: process.env.POSTGRES_PASSWORD,
        type: "postgres",
        logging: true,
        synchronize: true,
        migrations: [path_1.default.join(__dirname, "./migrations/*")],
        entities: [User_1.User],
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [user_1.UserResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
        }),
    });
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(4000, () => {
        console.log("express server runing in port 4000");
    });
});
main();
//# sourceMappingURL=index.js.map