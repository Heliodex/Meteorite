<script lang="ts">
	import { json } from "@sveltejs/kit"
	import { slide } from "svelte/transition"
	import Itemcard from "../../../../components/itemcard.svelte"
	import Rocks from "../../../../components/rocks.svelte"
	import { Avatar } from "@skeletonlabs/skeleton"
	import { url } from "$lib/url"
	import type { PageData } from "./$types"

	export let data: PageData
	let search = data.slug

	let accessories = false
	let bodyparts = false
	let currentFilter = "Featured"
	let currentCategory = "All"
	let currentPage = 1
	let maxiumumPage = 1
	$: {
		search = data.slug
		currentPage = 1
		updateItems()
	}
	$: data, updateItems()
	let items: any
	async function updateItems() {
		const response = await fetch(url + "/api/catalog/search", {
			method: "POST",
			body: JSON.stringify({
				filter: currentFilter,
				sort: currentCategory,
				page: currentPage,
				searchquery: search,
			}),
			headers: { "content-type": "application/json" },
		})
		const data = await response.json()
		if (!data.error) {
			if (items) {
				items.length = 0
				items = items
			}
			items = data.data
			items = items
			maxiumumPage = data.pages
		}
	}
	function setPage(value: number) {
		if (currentPage - value >= 1 && currentPage - value <= maxiumumPage) {
			currentPage -= value
			updateItems()
		}
	}
	function setCategory(event: any) {
		currentCategory = event.target.innerText
		currentPage = 1
		updateItems()
	}
	function setFilter(event: any) {
		currentFilter = event.target.innerText
		currentPage = 1
		updateItems()
	}
	updateItems()
</script>

<div class="sm:flex sm:flex-row gap-2 max-w-[1200px] m-0 m-auto">
	<div class="hidden sm:block">
		<div class="flex flex-col">
			<h2 class="font-bold">Catalog</h2>
			<h3>Category</h3>
			<button
				on:click={event => {
					setFilter(event)
				}}
				class="btn hover:text-blue-300">
				Featured
			</button>
			<button
				on:click={event => {
					setFilter(event)
				}}
				class="btn hover:text-blue-300">
				Best Selling
			</button>
			<button
				on:click={() => {
					accessories = !accessories
				}}
				class="btn hover:text-blue-300">
				Accessories
			</button>
			{#if accessories}
				<div
					class="flex flex-col"
					transition:slide|local={{ duration: 400 }}>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Hats
					</button>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Shirts
					</button>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Pants
					</button>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Gears
					</button>
				</div>
			{/if}
			<button
				on:click={() => {
					bodyparts = !bodyparts
				}}
				class="btn hover:text-blue-300">
				Body Parts
			</button>
			{#if bodyparts}
				<div
					class="flex flex-col"
					transition:slide|local={{ duration: 400 }}>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Faces
					</button>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Packages
					</button>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Heads
					</button>
				</div>
			{/if}
		</div>
	</div>

	<div class="col-span-5">
		<!-- mobile filter menu :D -->
		<div class="block sm:hidden">
			<div class="flex flex-row flex-wrap justify-evenly">
				<button
					on:click={event => {
						setFilter(event)
					}}
					class="btn hover:text-blue-300">
					Featured
				</button>
				<button
					on:click={event => {
						setFilter(event)
					}}
					class="btn hover:text-blue-300">
					Best Selling
				</button>
				<button
					on:click={() => {
						accessories = !accessories
					}}
					class="btn hover:text-blue-300 w-full">
					Accessories
				</button>
				{#if accessories}
					<div
						class="flex flex-row"
						transition:slide|local={{ duration: 400 }}>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Hats
						</button>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Shirts
						</button>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Pants
						</button>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Gears
						</button>
					</div>
				{/if}
				<button
					on:click={() => {
						bodyparts = !bodyparts
					}}
					class="btn hover:text-blue-300 w-full">
					Body Parts
				</button>
				{#if bodyparts}
					<div
						class="flex flex-row"
						transition:slide|local={{ duration: 400 }}>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Faces
						</button>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Packages
						</button>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Heads
						</button>
					</div>
				{/if}
			</div>
		</div>

		<h3>{currentFilter}</h3>
		<h4>{currentCategory}</h4>
		<div
			class="flex flex-col flex-wrap sm:grid sm:grid-cols-6 sm:grid-rows-5 gap-2">
			{#if items}
				{#each items as { Name, Price, ItemId, Hidden, Sales }}
					<Itemcard
						itemname={Name}
						itemid={ItemId}
						price={Price}
						sales={Sales} />
					<a
						class="unstyled block sm:hidden px-2"
						href="/catalog/{ItemId}/{Name.replace(
							/[^a-zA-Z ]/g,
							'',
						).replaceAll(' ', '-')}">
						<div class="bg-surface-800 flex flex-row">
							<img
								class="w-20"
								alt="L"
								src="/api/thumbnailrender/asset/?id={ItemId}" />
							<div>
								<h3 class="truncate">{Name}</h3>
								<div class="flex flex-row mt-4">
									<Rocks width="w-6" />
									<h4 class="">{Price ?? "0"}</h4>
								</div>
							</div>
						</div>
					</a>
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
</div>
