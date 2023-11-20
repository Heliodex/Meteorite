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

export const load = async ({ url, locals }) => {
	// console.log(locals)
	// await parent()

	if (!locals.user) {
		if (
			protectedroutes.includes(url.pathname) === true ||
			protectedroutes.some(substr =>
				url.pathname.toLowerCase().startsWith(substr.toLowerCase()),
			) === true
		) {
			throw redirect(303, "/")
		}
	}

	if (
		locals.user?.moderationstatus &&
		locals?.user?.moderationstatus?.status.toUpperCase() != "OK" &&
		url.pathname != "/moderated"
	) {
		throw redirect(303, "/moderated")
	}
	if (url.pathname.toLowerCase().startsWith("/admin") === true) {
		// admin route
		if (!locals.user) {
			throw redirect(303, "/")
		}
		if (locals.user.admin === false) {
			throw redirect(303, "/")
		}
	}

	if (url.pathname === "/" && locals.user) {
		throw redirect(303, "/home")
	}

	return {
		user: locals.user,
		jwt: locals.jwt,
		useragent: locals.useragent,
		protocol: url.protocol,
		url: url.pathname,
	}
}
