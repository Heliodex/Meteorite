import { authenticateUser } from "$lib/auth"
import { redirect } from "@sveltejs/kit"

const protectedroutes = [
	"/home",
	"/catalog",
	"/develop",
	"/users",
	"/avatar",
	"/settings",
	"/admin",
]

export const handle = async ({ event, resolve }) => {
	// Stage 1
	event.locals.user = await authenticateUser(event)
	event.locals.jwt = event.cookies.get("jwt") ?? ""
	event.locals.useragent = event.request.headers.get("user-agent")
	// console.log(event.locals.user)

	if (
		protectedroutes.includes(event.url.pathname) === true ||
		protectedroutes.some(substr =>
			event.url.pathname.toLowerCase().startsWith(substr.toLowerCase()),
		) === true
	) {
		if (!event.locals.user) {
			throw redirect(303, "/")
		}
		if (
			event.locals.user?.moderationstatus &&
			event.locals.user.moderationstatus?.status.toUpperCase() != "OK" &&
			event.url.pathname != "moderated"
		) {
			throw redirect(303, "/moderated")
		}
	}
	if (event.url.pathname.toLowerCase().startsWith("/admin") === true) {
		// admin route
		if (!event.locals.user) {
			throw redirect(303, "/")
		}
		if (event.locals.user.admin === false) {
			throw redirect(303, "/")
		}
	}

	const response = await resolve(event) // Stage 2

	// Stage 3
	// console.log(event.url.protocol)
	if (event.url.protocol === "https:") {
		response.headers.append(
			"Content-Security-Policy",
			"img-src 'self' data: wsrv.nl images.weserv.nl;upgrade-insecure-requests;",
		)
	} else {
		response.headers.append(
			"Content-Security-Policy",
			"img-src 'self' data: wsrv.nl images.weserv.nl;",
		)
	}

	return response
}
