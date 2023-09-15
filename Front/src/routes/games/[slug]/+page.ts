import { error, redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { PUBLIC_ORIGIN } from "$env/static/public"

export const load = (async ({ fetch, params }) => {
	const res = await fetch(`http://${PUBLIC_ORIGIN}/games/gameinfo/${params.slug}`)
	const data = await res.json()
	if (data.error === false) {
		throw redirect(
			301,
			"/games/" +
				params.slug +
				"/" +
				data.gameinfo.nameofgame
					.replace(/[^0-9a-z ]/gi, "")
					.replaceAll(" ", "-"),
		)
	}
	throw error(404, "Not found")
}) satisfies PageLoad
