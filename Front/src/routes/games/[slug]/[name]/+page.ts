import { error, redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load = (async ({ fetch, params }) => {
	const res = await fetch(`http://mete0r.xyz/games/gameinfo/${params.slug}`)
	const data = await res.json()

	if (
		params.name !=
		data.gameinfo.nameofgame.replace(/[^a-zA-Z ]/g, "").replaceAll(" ", "-")
	) {
		throw redirect(
			301,
			"/games/" +
				params.slug +
				"/" +
				data.gameinfo.nameofgame
					.replace(/[^a-zA-Z ]/g, "")
					.replaceAll(" ", "-"),
		)
	}

	if (data.error === false) {
		return {
			game: data.gameinfo,
			creatorusername: data.gameinfo.owner.username,
		}
	}
	throw error(404, "Not found")
}) satisfies PageLoad
