export const validateRegister = (password: string, email: string) => {
	console.log(email)
	if (!email.includes("@")) {
		return [
			{
				field: "email",
				message: "invalid email",
			},
		]
	}

	if (email.length <= 4) {
		return [
			{
				field: "email",
				message: "length must be greather than 3",
			},
		]
	}

	if (password.length <= 5) {
		return [
			{
				field: "password",
				message: "length must be greather than 4",
			},
		]
	}

	return null
}
