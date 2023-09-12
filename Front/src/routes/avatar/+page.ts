import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { url as url2 } from "$lib/url"

export const load = (async ({ parent, url, fetch }) => {
	const avatarfilter = String(url.searchParams.get("filter") ?? "shirts")
	const currentPage = Number(url.searchParams.get("page") ?? "1")
	let currentItems: Array<any> = []
	const userid = (await parent()).user.userid

	const response = await fetch(url2 + `/api/userinfo/${userid}/inventory`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ page: currentPage, filter: avatarfilter }),
	})
	const data = await response.json()
	currentItems = data.inventory

	currentItems = currentItems.filter(
		currentItems => currentItems.Type.toLowerCase() === avatarfilter,
	)

	if (!data.error) {
		return {
			currentItems,
			maxiumumPage: data.pages,
			currentPage,
			avatarfilter,
		}
	}
}) satisfies PageLoad
