import { error, redirect } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { PUBLIC_ORIGIN } from "$env/static/public"

export const load = (async ({ fetch, params }) => {
	const res = await fetch(
		`http://${PUBLIC_ORIGIN}/api/catalog/iteminfo/${params.slug}`,
	)
	const data = await res.json()
	if (data.error === false) {
		throw redirect(
			301,
			"/catalog/" +
				params.slug +
				"/" +
				data.iteminfo.Name.replace(/[^0-9a-z ]/gi, "").replaceAll(
					" ",
					"-",
				),
		)
	}
	throw error(404, "Not found")
}) satisfies PageLoad
