import { url as url2 } from "$lib/url"

export const load = async ({ fetch, url }) => {
	const currentPage = Number(url.searchParams.get("page") ?? "1")
	const currentCategory = String(url.searchParams.get("category") ?? "All")
	const currentFilter = String(url.searchParams.get("filter") ?? "Featured")

	const response = await fetch(url2 + "/api/catalog/fetch", {
		method: "POST",
		body: JSON.stringify({
			filter: currentFilter,
			sort: currentCategory,
			page: currentPage,
		}),
		headers: { "content-type": "application/json" },
	})
	const data = await response.json()

	if (!data.error) {
		return {
			items: data.data,
			maxiumumPage: data.pages,
			currentPage,
			currentFilter,
			currentCategory,
		}
	}
}
