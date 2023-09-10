<script lang="ts">
	import Usercard from "../../../../components/usercard.svelte"
	import type { PageData } from "./$types"
	import { url } from "$lib/url"
	let currentPage = 1
	let maxiumumPage = 1

	export let data: PageData
	let search = data.slug
	$: {
		search = data.slug
		currentPage = 1
		updateUsers()
	}

	let users: []
	async function updateUsers() {
		const response = await fetch(url + "/api/users/search", {
			method: "POST",
			body: JSON.stringify({ searchquery: search, page: currentPage }),
			headers: { "content-type": "application/json" },
		})
		const data = await response.json()
		if (!data.error) {
			if (users) {
				users.length = 0
				users = users
			}
			users = data.data
			users = users
			maxiumumPage = data.pages
		}
	}
	function setPage(value: number) {
		if (currentPage - value >= 1 && currentPage - value <= maxiumumPage) {
			currentPage -= value
			updateUsers()
		}
	}
	updateUsers()
</script>

<div class="space-y-4 max-w-[1200px] m-0 m-auto">
	<h2 class="">Results for {search}:</h2>
	<div
		class="flex flex-col flex-wrap md:grid md:grid-cols-3 md:grid-rows-4 gap-2">
		{#if users}
			{#each users as { userid, username }}
				<Usercard {userid} {username} />
			{/each}
		{/if}
	</div>
	<div class="flex flex-row space-x-2 justify-center">
		<button
			on:click={() => {
				setPage(1)
			}}
			class="btn btn-sm bg-surface-600 rounded-md">
			&lt;
		</button>
		<h5 class="">{currentPage} / {maxiumumPage}</h5>
		<button
			on:click={() => {
				setPage(-1)
			}}
			class="btn btn-sm bg-surface-600 rounded-md">
			&gt;
		</button>
	</div>
</div>
