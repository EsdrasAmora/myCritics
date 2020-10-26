import { User } from "../entities/User"
import { Arg, Ctx, Field, Int, Mutation, ObjectType, Query, Resolver, UseMiddleware } from "type-graphql"
import argon2 from "argon2"
import { MyContext } from "../types"
import { createAccesToken, createRefreshToken } from "../auth"
import { isAuth } from "../middlewares/isAuth"
import { sendRefreshToken } from "../sendRefreshToken"
import { getConnection } from "typeorm"
import { validateRegister } from "../utils/validateRegister"
import { verify } from "jsonwebtoken"

@ObjectType()
class FieldError {
	@Field()
	field: string

	@Field()
	message: string
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]

	@Field(() => User, { nullable: true })
	user?: User

	@Field(() => String, { nullable: true })
	accesToken?: string
}

@Resolver(User)
export class UserResolver {
	@Query(() => String)
	test() {
		return "tudo ok"
	}

	@Query(() => [User])
	users() {
		return User.find()
	}

	@Query(() => String)
	@UseMiddleware(isAuth)
	testAuth(@Ctx() { payload }: MyContext) {
		return `your user id is: ${payload!.userId}`
	}

	@Mutation(() => Boolean)
	async logout(@Ctx() { res }: MyContext) {
		sendRefreshToken(res, "")

		return true
	}

	@Query(() => User, { nullable: true })
	me(@Ctx() context: MyContext) {
		const authorization = context.req.headers["authorization"]

		if (!authorization) {
			return null
		}

		try {
			const token = authorization.split(" ")[1]
			const payload: any = verify(token, process.env.ACCES_TOKEN_SECRET)
			return User.findOne(payload.userId)
		} catch (err) {
			console.log(err)
			return null
		}
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { res }: MyContext
	): Promise<UserResponse> {
		const errors = validateRegister(password, email)
		if (errors) {
			return { errors }
		}
		const hashedPassword = await argon2.hash(password)
		let user
		try {
			const result = await getConnection()
				.createQueryBuilder()
				.insert()
				.into(User)
				.values({
					email: email,
					password: hashedPassword,
				})
				.returning("*")
				.execute()
			user = result.raw[0]
		} catch (err) {
			console.log(err)
			if (err.code === "23505") {
				//|| err.detail.includes("already exists")) {
				return {
					errors: [
						{
							field: "username",
							message: "username already taken",
						},
					],
				}
			}
			return {
				errors: [
					{
						field: "?",
						message: "something went wrong",
					},
				],
			}
		}

		sendRefreshToken(res, createRefreshToken(user))

		return {
			user,
			accesToken: createAccesToken(user),
		}
	}

	@Mutation(() => Boolean)
	async revokeRefreshTokenForUser(@Arg("userId", () => Int) userId: number) {
		await getConnection().getRepository(User).increment({ id: userId }, "tokenVersion", 1)
		return true
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("email") email: string,
		@Arg("password") password: string,
		@Ctx() { res }: MyContext
	): Promise<UserResponse> {
		const user = await User.findOne({ where: { email } })

		if (!user) {
			return {
				errors: [
					{
						field: "username",
						message: "that username dosen't exist",
					},
				],
			}
		}

		const valid = await argon2.verify(user.password, password)

		if (!valid) {
			return {
				errors: [
					{
						field: "password",
						message: "incorrect password",
					},
				],
			}
		}

		sendRefreshToken(res, createRefreshToken(user))

		return {
			user: user,
			accesToken: createAccesToken(user),
		}
	}
}
