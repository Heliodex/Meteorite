import { url } from "$lib/url"

export const load = async ({ fetch, parent }) => {
	let data = await parent()

	const response = await fetch(url + "/api/groups", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: data.jwt,
		},
	})
	const groups = await response.json()

	return {
		groups,
	}
}
