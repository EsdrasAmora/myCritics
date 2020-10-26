import React from "react"
import { useMeQuery } from "../generated/graphql"

const Me: React.FC = ({}) => {
	const { data, loading, error } = useMeQuery({ fetchPolicy: "network-only" })

	if (error) {
		return <div>error</div>
	}

	if (loading) {
		return <div>loading...</div>
	}

	if (!data?.me) {
		return <div>login to see your status</div>
	}

	return <div> {data.me?.email}</div>
}

export default Me
