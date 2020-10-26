import { ApolloClient, ApolloLink, ApolloProvider, HttpLink, InMemoryCache } from "@apollo/client"
import { setContext } from "@apollo/client/link/context"
import { onError } from "@apollo/client/link/error"
import { ColorModeProvider, CSSReset, ThemeProvider } from "@chakra-ui/core"
import { TokenRefreshLink } from "apollo-link-token-refresh"
import jwtDecode from "jwt-decode"
import { useEffect, useState } from "react"
import { getAccessToken, setAccessToken } from "../accessToken"
import theme from "../theme"

const authLink = setContext((_, { headers }) => {
	const token = getAccessToken()
	console.log("setou o token:" + token)
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : "",
		},
	}
})

const isTokenValidOrUndefined = () => {
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
}

const client = new ApolloClient({
	link: ApolloLink.from([
		new TokenRefreshLink({
			accessTokenField: "accessToken",
			isTokenValidOrUndefined,
			fetchAccessToken: () => {
				return fetch("http://localhost:4000/refresh_token", {
					method: "POST",
					credentials: "include",
				})
			},
			handleFetch: (accessToken) => {
				console.log("buscou: ", accessToken)
				setAccessToken(accessToken)
			},
			handleError: (err) => {
				console.warn("Your refresh token is invalid. Try to relogin")
				console.error(err)
			},
		}),
		authLink,
		onError(({ graphQLErrors, networkError }) => {
			if (graphQLErrors)
				graphQLErrors.map(({ message, locations, path }) =>
					console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
				)
			if (networkError) console.log(`[Network error]: ${networkError}`)
		}),
		new HttpLink({
			uri: "http://localhost:4000/graphql",
			credentials: "include",
		}),
	]),
	cache: new InMemoryCache({}),
})

function MyApp({ Component, pageProps }: any) {
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		if (isTokenValidOrUndefined()) {
			fetch("http://localhost:4000/refresh_token", {
				method: "POST",
				credentials: "include",
			}).then(async (res) => {
				const { accessToken } = await res.json()
				console.log("montou: ", accessToken)
				setAccessToken(accessToken)
				setLoading(false)
			})
		}
	}, [])

	if (loading) {
		return <div>loading...</div>
	}

	return (
		<ApolloProvider client={client}>
			<ThemeProvider theme={theme}>
				<ColorModeProvider value="dark">
					<CSSReset />
					<Component {...pageProps} />
				</ColorModeProvider>
			</ThemeProvider>
		</ApolloProvider>
	)
}

export default MyApp
