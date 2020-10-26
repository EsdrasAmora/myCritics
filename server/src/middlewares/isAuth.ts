import { AuthenticationError } from "apollo-server-express"
import { verify } from "jsonwebtoken"
import { Middleware } from "type-graphql/dist/interfaces/Middleware"
import { MyContext } from "../types"

export const isAuth: Middleware<MyContext> = ({ context }, next) => {
	const authorization = context.req.headers["authorization"]

	if (!authorization) {
		throw new AuthenticationError("null authorization Token")
	}

	try {
		const token = authorization.split(" ")[1]
		const payload = verify(token, process.env.ACCES_TOKEN_SECRET)
		context.payload = payload as any
	} catch (err) {
		console.log(err)
		throw new AuthenticationError("null authorization Token")
	}

	return next()
}
