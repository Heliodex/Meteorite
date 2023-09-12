import type { PageLoad } from "./$types"
import { url } from "$lib/url"
import { error } from "@sveltejs/kit"

export const load = (async ({ fetch, parent, params }) => {
	let data = await parent()

	const response = await fetch(url + "/api/groups", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: data.jwt,
		},
	})
	const groups = await response.json()

	const responsegroup = await fetch(url + "/api/groups/" + params.slug, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: data.jwt,
		},
	})
	const group = await responsegroup.json()

	if (!group.error) {
		return {
			groups,
			group: group.data,
		}
	}
	throw error(404, "Not found")
}) satisfies PageLoad
