<script lang="ts">
	import Gamecard from "../../components/gamecard.svelte"
	import Scrollbar from "../../components/scrollbutton.svelte"

	export let data

	let gamearrays: any = {
		Popular: { array: [], cursor: 1 },
		OurRecommendations: { array: [], cursor: 1 },
		Visits: { array: [], cursor: 1 },
		NewestArrivals: { array: [], cursor: 1 },
	}
	gamearrays.Popular.array = data?.firstpaint.Popular.array
	gamearrays.OurRecommendations.array =
		data?.firstpaint.OurRecommendations.array
	gamearrays.Visits.array = data?.firstpaint.Visits.array
	gamearrays.NewestArrivals.array = data?.firstpaint.NewestArrivals.array
	let scrollTimer: number | null,
		lastScrollFireTime = 0

	async function addToArray(array: string) {
		const response = await fetch("/games/scroll", {
			method: "POST",
			body: JSON.stringify({
				cursor: gamearrays[array].cursor,
				type: array,
			}),
			headers: { "content-type": "application/json" },
		})
		const data = await response.json()
		if (!data.error && data != "[]") {
			//populararray = populararray.concat(data)
			gamearrays[array].array = gamearrays[array].array.concat(data)
			//console.log(gamearrays)
			//console.log(populararray)
			gamearrays[array].cursor += 1
			//console.log(gamearrays)
		}
	}
	//addToArray("Popular")
	//addToArray("OurRecommendations")
	//addToArray("Visits")
	//addToArray("NewestArrivals")

	let popular: HTMLDivElement

	let rec: HTMLDivElement

	let visit: HTMLDivElement

	let newest: HTMLDivElement

	function scrolled(
		scrolleft: any,
		clientwidth: any,
		scrollWidth: any,
		array: string,
	) {
		const diff = Math.abs(scrolleft + clientwidth - scrollWidth)
		if (diff < 500) {
			var minScrollTime = 300
			var now = new Date().getTime()

			function processScroll() {
				addToArray(array)
			}

			if (!scrollTimer) {
				if (now - lastScrollFireTime > 3 * minScrollTime) {
					processScroll() // fire immediately on first scroll
					lastScrollFireTime = now
				}
				scrollTimer = setTimeout(function () {
					scrollTimer = null
					lastScrollFireTime = new Date().getTime()
					processScroll()
				}, minScrollTime)
			}
		}
	}
</script>

<div class="space-y-4 max-w-[1800px] m-0 m-auto">
	<h2 class="">Popular</h2>
	<div class="">
		<Scrollbar scrollDirection="left" scrollElement={popular} />
		<Scrollbar scrollDirection="right" scrollElement={popular} />

		<div
			bind:this={popular}
			on:scroll={e =>
				scrolled(
					e.target?.scrollLeft,
					e.target?.clientWidth,
					e.target?.scrollWidth,
					"Popular",
				)}
			class="grid grid-flow-col grid-rows-none overflow-hidden auto-cols-max gap-4 snap-mandatory snap-x scroll-smooth h-40 sm:h-60">
			{#each gamearrays.Popular.array as { nameofgame, idofgame, version, visits, numberofplayers, useridofowner, owner }}
				<Gamecard
					gamename={nameofgame}
					playercount={numberofplayers}
					{version}
					{useridofowner}
					{visits}
					{idofgame}
					useragent={data.useragent}
					username={owner.username} />
			{/each}
		</div>
	</div>
	<h2 class="">Our Recommendations</h2>
	<div class="">
		<Scrollbar scrollDirection="left" scrollElement={rec} />
		<Scrollbar scrollDirection="right" scrollElement={rec} />

		<div
			bind:this={rec}
			on:scroll={e =>
				scrolled(
					e.target?.scrollLeft,
					e.target?.clientWidth,
					e.target?.scrollWidth,
					"OurRecommendations",
				)}
			class="grid grid-flow-col grid-rows-none overflow-hidden auto-cols-max gap-4 snap-mandatory snap-x scroll-smooth h-40 sm:h-60">
			{#each gamearrays.OurRecommendations.array as { nameofgame, idofgame, version, visits, numberofplayers, useridofowner, owner }}
				<Gamecard
					gamename={nameofgame}
					playercount={numberofplayers}
					{version}
					{useridofowner}
					{visits}
					{idofgame}
					useragent={data.useragent}
					username={owner.username} />
			{/each}
		</div>
	</div>
	<h2 class="">Most Visited</h2>
	<div class="">
		<Scrollbar scrollDirection="left" scrollElement={visit} />
		<Scrollbar scrollDirection="right" scrollElement={visit} />

		<div
			bind:this={visit}
			on:scroll={e =>
				scrolled(
					e.target?.scrollLeft,
					e.target?.clientWidth,
					e.target?.scrollWidth,
					"Visits",
				)}
			class="grid grid-flow-col grid-rows-none overflow-hidden auto-cols-max gap-4 snap-mandatory snap-x scroll-smooth h-40 sm:h-60">
			{#each gamearrays.Visits.array as { nameofgame, idofgame, version, visits, numberofplayers, useridofowner, owner }}
				<Gamecard
					gamename={nameofgame}
					playercount={numberofplayers}
					{version}
					{useridofowner}
					{visits}
					{idofgame}
					useragent={data.useragent}
					username={owner.username} />
			{/each}
		</div>
	</div>
	<h2 class="">Newest Arrivals</h2>
	<div class="">
		<Scrollbar scrollDirection="left" scrollElement={newest} />
		<Scrollbar scrollDirection="right" scrollElement={newest} />

		<div
			bind:this={newest}
			on:scroll={e =>
				scrolled(
					e.target?.scrollLeft,
					e.target?.clientWidth,
					e.target?.scrollWidth,
					"NewestArrivals",
				)}
			class="grid grid-flow-col grid-rows-none overflow-hidden auto-cols-max gap-4 snap-mandatory snap-x scroll-smooth h-40 sm:h-60">
			{#each gamearrays.NewestArrivals.array as { nameofgame, idofgame, version, visits, numberofplayers, useridofowner, owner }}
				<Gamecard
					gamename={nameofgame}
					playercount={numberofplayers}
					{version}
					{useridofowner}
					{visits}
					{idofgame}
					useragent={data.useragent}
					username={owner.username} />
			{/each}
		</div>
	</div>
</div>
