import { error, redirect } from "@sveltejs/kit"
import { PUBLIC_ORIGIN } from "$env/static/public"

export const load = async ({ fetch, params }) => {
	const res = await fetch(
		`http://${PUBLIC_ORIGIN}/api/catalog/iteminfo/${params.slug}`,
	)
	const data = await res.json()

	if (
		params.name !=
		data.iteminfo.Name.replace(/[^0-9a-z ]/gi, "").replaceAll(" ", "-")
	) {
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

	if (data.error === false) {
		const creatorusernameresp = await fetch(
			`http://${PUBLIC_ORIGIN}/api/userinfo/${
				data.iteminfo.Creator ?? "0"
			}`,
		)
		const creatorusername = await creatorusernameresp.json()
		return {
			item: data.iteminfo,
			creatorusername: creatorusername.userinfo.username,
		}
	}
	throw error(404, "Not found")
}
