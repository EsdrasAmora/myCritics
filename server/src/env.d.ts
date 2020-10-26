declare namespace NodeJS {
	export interface ProcessEnv {
		DATABASE_URL: string
		POSTGRES_PASSWORD: string
		REDIS_URL: string
		PORT: string
		REFRESH_TOKEN_SECRET: string
		ACCES_TOKEN_SECRET: string
		CORS_ORIGIN: string
	}
}
