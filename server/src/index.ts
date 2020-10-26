import express from "express"
import "reflect-metadata"
import "dotenv-safe/config"
import path from "path"
import cors from "cors"
import { ApolloServer } from "apollo-server-express"
import { buildSchema } from "type-graphql"
import { UserResolver } from "./resolvers/user"
import { createConnection } from "typeorm"
import { User } from "./entities/User"
import cookieParser from "cookie-parser"
import { verify } from "jsonwebtoken"
import { createAccesToken, createRefreshToken } from "./auth"
import { sendRefreshToken } from "./sendRefreshToken"

const main = async () => {
	const app = express()
	app.use(cookieParser())
	app.set("trust proxy", 1)
	app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }))

	app.post("/refresh_token", async (req, res) => {
		const token = req.cookies.jid
		if (!token) {
			return res.send({ ok: false, accessToken: "" })
		}
		let payload: any = null
		try {
			payload = verify(token, process.env.REFRESH_TOKEN_SECRET)
		} catch (err) {
			console.log(err)
			return res.send({ ok: false, accessToken: "" })
		}
		const user = await User.findOne({ id: payload.userId })
		if (!user) {
			return res.send({ ok: false, accessToken: "" })
		}

		if (user.tokenVersion !== payload.tokenVersion) {
			return res.send({ ok: false, accessToken: "" })
		}

		sendRefreshToken(res, createRefreshToken(user))
		return res.send({ ok: true, accessToken: createAccesToken(user) })
	})

	await createConnection({
		url: process.env.DATABASE_URL,
		password: process.env.POSTGRES_PASSWORD,
		type: "postgres",
		logging: true,
		synchronize: true,
		migrations: [path.join(__dirname, "./migrations/*")],
		entities: [User],
	})

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [UserResolver],
			validate: false,
		}),
		context: ({ req, res }) => ({
			req,
			res,
		}),
	})

	apolloServer.applyMiddleware({ app, cors: false })

	app.listen(4000, () => {
		console.log("express server runing in port 4000")
	})
}

main()
