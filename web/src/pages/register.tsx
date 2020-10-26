import { Box, Button } from "@chakra-ui/core"
import { Form, Formik } from "formik"
import { useRouter } from "next/router"
import React from "react"
import { setAccessToken } from "../accessToken"
import { InputField } from "../components/InputField"
import { Wrapper } from "../components/Wrapper"
import { useRegisterMutation } from "../generated/graphql"
import { toErrorMap } from "../utils/toErrorMap"

const Register: React.FC<{}> = ({}) => {
	const router = useRouter()
	const [register] = useRegisterMutation()

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await register({ variables: { email: values.email, password: values.password } })
					if (response.data?.register.errors) {
						setErrors(toErrorMap(response.data.register.errors))
					} else if (response.data?.register.user) {
						setAccessToken(response.data?.register.accesToken!)
						router.push("/")
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="email" placeholder="Email" label="Email" />
						<Box mt={4}>
							<InputField name="password" placeholder="Password" label="Password" type="Password" />
						</Box>
						<Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">
							register
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	)
}

export default Register
