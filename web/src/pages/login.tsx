import { Box, Button, Flex, Link } from "@chakra-ui/core"
import { Form, Formik } from "formik"
import NextLink from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { setAccessToken } from "../accessToken"
import { InputField } from "../components/InputField"
import { Wrapper } from "../components/Wrapper"
import { useLoginMutation } from "../generated/graphql"
import { toErrorMap } from "../utils/toErrorMap"

const login: React.FC<{}> = ({}) => {
	const router = useRouter()
	const [login] = useLoginMutation()

	return (
		<Wrapper variant="small">
			<Formik
				initialValues={{ email: "", password: "" }}
				onSubmit={async (values, { setErrors }) => {
					const response = await login({ variables: { email: values.email, password: values.password } })
					if (response.data?.login.errors) {
						setErrors(toErrorMap(response.data.login.errors))
					} else if (response.data?.login.user) {
						setAccessToken(response.data?.login.accesToken!)
						if (typeof router.query.next === "string") {
							router.push(router.query.next)
						} else {
							router.push("/")
						}
					}
				}}
			>
				{({ isSubmitting }) => (
					<Form>
						<InputField name="email" placeholder="Email" label="Email" />
						<Box mt={4}>
							<InputField name="password" placeholder="Password" label="Password" type="Password" />
						</Box>
						<Flex mt={2}>
							<NextLink href="/forgot-password">
								<Link ml="auto">Forgot Password ?</Link>
							</NextLink>
						</Flex>
						<Button mt={4} type="submit" isLoading={isSubmitting} variantColor="teal">
							login
						</Button>
					</Form>
				)}
			</Formik>
		</Wrapper>
	)
}

export default login
