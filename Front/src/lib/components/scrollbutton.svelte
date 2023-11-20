<script lang="ts">
	export let scrollDirection: String
	export let scrollElement: HTMLDivElement
	const scroll = async (node: HTMLDivElement, direction: String) => {
		if (direction === "right") {
			if (window.matchMedia("(min-width: 640px)").matches === true) {
				return (node.scrollLeft += 800)
			}
			node.scrollLeft += 200
		} else {
			if (window.matchMedia("(min-width: 640px)").matches === true) {
				return (node.scrollLeft -= 800)
			}
			node.scrollLeft -= 200
		}
	}
</script>

<button
	class="btn btn-ringed btn-base w-3 rounded-md float-{scrollDirection} h-32 sm:h-52"
	on:click={() => scroll(scrollElement, scrollDirection)}
	style="transition: none !important;transform: none !important;">
	{#if scrollDirection === "right"}
		&gt;
	{:else}
		&lt;
	{/if}
</button>
