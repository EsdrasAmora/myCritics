import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { TokenRefreshLink } from "apollo-link-token-refresh"
import jwtDecode from "jwt-decode"
import { getAccessToken, setAccessToken } from "../accessToken"

const createApolloClient = (): any => {
	const httpLink = createHttpLink({
		uri: "http://localhost:4000/graphql",
		credentials: "include",
	})

	const authLink = setContext((_, { headers }) => {
		const token = getAccessToken()

		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : "",
			},
		}
	})

	const refreshTokenLink = new TokenRefreshLink({
		accessTokenField: "accessToken",
		isTokenValidOrUndefined: () => {
			const token = getAccessToken()

			if (!token) {
				return true
			}

			try {
				const { exp } = jwtDecode(token)
				if (Date.now() >= exp * 1000) {
					return false
				} else {
					return true
				}
			} catch {
				return false
			}
		},
		fetchAccessToken: () => {
			return fetch("http://localhost:4000/refresh_token", {
				method: "POST",
				credentials: "include",
			})
		},
		handleFetch: (accessToken) => {
			setAccessToken(accessToken)
		},
		// handleResponse: (operation, accessTokenField) => (response) => response,
		handleError: (err) => {
			console.warn("Your refresh token is invalid. Try to relogin")
			console.error(err)
		},
	})

	return new ApolloClient({
		link: authLink.concat(httpLink).concat(refreshTokenLink),
		cache: new InMemoryCache(),
	})
}
