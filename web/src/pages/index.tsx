import { Box, Button, Link } from "@chakra-ui/core"
import NextLink from "next/link"
import React from "react"
import { setAccessToken } from "../accessToken"
import { useLogoutMutation, useUsersQuery } from "../generated/graphql"

interface indexProps {}

const index: React.FC = ({}) => {
	const { data, loading, error } = useUsersQuery()
	const [logout, { client }] = useLogoutMutation()

	if (loading) {
		return <div>loading</div>
	}

	if (error) {
		return <div>error</div>
	}

	if (!data) {
		return <div> sem usuarios</div>
	}

	return (
		<Box>
			<NextLink href="/register">
				<Button mr={3} as={Link}>
					register
				</Button>
			</NextLink>
			<NextLink href="/login">
				<Button mr={3} as={Link}>
					login
				</Button>
			</NextLink>
			<NextLink href="/me">
				<Button mr={3} as={Link}>
					me
				</Button>
			</NextLink>
			<Button
				mr={3}
				onClick={async () => {
					await logout()
					setAccessToken("")
					await client.resetStore()
				}}
			>
				logout
			</Button>

			{data.users.map((user) => (
				<div key={user.id}>
					{user.email} {user.id}
				</div>
			))}
		</Box>
	)
}

export default index
