import type { RequestEvent } from "@sveltejs/kit"
import { PUBLIC_ORIGIN } from "$env/static/public"

export const authenticateUser = async (event: RequestEvent) => {
	// get the cookies from the request
	const { cookies } = event
	const { route } = event

	// get the user token from the cookie
	const userToken = cookies.get("jwt")
	if (!userToken) {
		return null
	}
	// if the user token is not valid, return null
	// this is where you would check the user token against your database
	// to see if it is valid and return the user object
	const res = await fetch(`http://${PUBLIC_ORIGIN}/api/auth`, {
		credentials: "include",
		headers: { cookie: "jwt=" + userToken, route: route.id as string },
	})
	const data = await res.json()
	if (!data.error) {
		return data
	} else if (data.moderationstatus) {
		return data
	}

	return null
}
