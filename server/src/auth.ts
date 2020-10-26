import { sign } from "jsonwebtoken"
import { User } from "./entities/User"
import "dotenv-safe/config"

export const createAccesToken = (user: User) => {
	return sign({ userId: user.id }, process.env.ACCES_TOKEN_SECRET, { expiresIn: "15s" })
}

export const createRefreshToken = (user: User) => {
	return sign({ userId: user.id, tokenVersion: user.tokenVersion }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	})
}
