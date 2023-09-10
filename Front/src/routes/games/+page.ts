import type { PageLoad } from "./$types"
import { url } from "$lib/url"

export const load = (async ({ fetch }) => {
	let gamearrays: any = {
		Popular: { array: [] },
		OurRecommendations: { array: [] },
		Visits: { array: [] },
		NewestArrivals: { array: [] },
	}

	async function addToArray() {
		const response = await fetch(url + "/games/firstpaint", {
			method: "POST",
			headers: { "content-type": "application/json" },
		})
		const data = await response.json()
		if (!data.error && data != "[]") {
			gamearrays = data
		}
	}
	await addToArray()

	return {
		firstpaint: gamearrays,
	}
}) satisfies PageLoad
