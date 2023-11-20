<script lang="ts">
	import Gamecard from "../../../../components/gamecard.svelte"
	import { PUBLIC_ORIGIN } from "$env/static/public"
	let gamearray: any[] = []
	let currentcursor = 1

	export let data

	let search = data.slug
	$: {
		search = data.slug
	}
	$: data, fetchfirst()

	async function fetchfirst() {
		const response = await fetch(`http://${PUBLIC_ORIGIN}/games/search`, {
			method: "POST",
			body: JSON.stringify({ cursor: 0, searchquery: search }),
			headers: { "content-type": "application/json" },
		})
		const data = await response.json()
		if (!data.error && data != "[]") {
			//populararray = populararray.concat(data)
			if (gamearray) {
				gamearray.length = 0
				gamearray = gamearray
			}
			gamearray = data
			gamearray = gamearray
			//console.log(gamearrays)
			//console.log(populararray)
			//console.log(gamearrays)
		}
	}

	async function addToArray() {
		const response = await fetch(`http://${PUBLIC_ORIGIN}/games/search`, {
			method: "POST",
			body: JSON.stringify({
				cursor: currentcursor,
				searchquery: search,
			}),
			headers: { "content-type": "application/json" },
		})
		const data = await response.json()
		if (!data.error && data != "[]") {
			//populararray = populararray.concat(data)
			gamearray = gamearray.concat(data)
			//console.log(gamearrays)
			//console.log(populararray)
			currentcursor += 1
			//console.log(gamearrays)
		}
	}
</script>

<div class="space-y-4 max-w-[1800px] m-0 m-auto">
	<h2 class="">Results for {search}:</h2>
	<div class="flex flex-row flex-wrap gap-2">
		{#each gamearray as { nameofgame, idofgame, version, visits, numberofplayers, useridofowner }}
			<Gamecard
				gamename={nameofgame}
				playercount={numberofplayers}
				{version}
				{useridofowner}
				{visits}
				{idofgame}
				useragent={data.useragent} />
		{/each}
	</div>
</div>
