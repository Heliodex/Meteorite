<script lang="ts">
	import { json } from "@sveltejs/kit"
	import { slide } from "svelte/transition"
	import Itemcard from "$lib/components/itemcard.svelte"
	import Rocks from "$lib/components/rocks.svelte"
	import { url } from "$lib/url"
	import { menu } from "@skeletonlabs/skeleton"
	import { page } from "$app/stores"
	import { goto } from "$app/navigation"
	import type { PageData } from "../$types"
	let accessories = false
	let bodyparts = false
	let animations = false
	let items: any
	let currentSort = "Oldest"
	$: query = $page.url.searchParams

	export let data: PageData

	$: maxiumumPage = data.maxiumumPage

	$: currentPage = data.currentPage

	$: currentFilter = data.currentFilter

	$: currentCategory = data.currentCategory

	$: items = data.items
	function setPage(value: number) {
		if (currentPage - value >= 1 && currentPage - value <= maxiumumPage) {
			currentPage -= value
			query.set("page", currentPage.toString())
			goto(`?${query.toString()}`)
		}
	}
	function setCategory(event: any) {
		currentCategory = event.target.innerText
		currentPage = 1
		query.set("category", currentCategory.toString())
		query.set("page", "1")
		goto(`?${query.toString()}`)
	}
	function setFilter(event: any) {
		currentFilter = event.target.innerText
		currentPage = 1
		query.set("filter", currentFilter.toString())
		query.set("page", "1")
		goto(`?${query.toString()}`)
	}
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
			<button
				on:click={() => {
					animations = !animations
				}}
				class="btn hover:text-blue-300">
				Animations
			</button>
			{#if animations}
				<div
					class="flex flex-col"
					transition:slide|local={{ duration: 400 }}>
					<button
						on:click={event => {
							setCategory(event)
						}}
						class="btn !text-sm hover:text-blue-300">
						Emotes
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
				<button
					on:click={() => {
						animations = !animations
					}}
					class="btn hover:text-blue-300 w-full">
					Animations
				</button>
				{#if animations}
					<div
						class="flex flex-row"
						transition:slide|local={{ duration: 400 }}>
						<button
							on:click={event => {
								setCategory(event)
							}}
							class="btn !text-sm hover:text-blue-300">
							Emotes
						</button>
					</div>
				{/if}
			</div>
		</div>

		<h3>{currentFilter}</h3>

		<div class="flex flex-row">
			<h4>{currentCategory}</h4>

			<button
				class="ring-surface-500 hover:ring-surface-300 ring-2 rounded p-1 flex flex-row gap-x-3 relative ml-auto w-24"
				use:menu={{ menu: "navigationsort" }}>
				<h5 class="!text-sm hover:text-white">{currentSort}</h5>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="w-4 ml-auto">
					<line x1="12" y1="5" x2="12" y2="19" />
					<polyline points="19 12 12 19 5 12" />
				</svg>
				<nav class=" rounded-none mt-6" data-menu="navigationsort">
					<ul>
						<button
							class="btn bg-surface-700 !rounded-none text-sm">
							Oldest
						</button>
					</ul>
					<ul>
						<button
							class="btn bg-surface-700 !rounded-none text-sm">
							Newest
						</button>
					</ul>
					<ul>
						<button
							class="btn bg-surface-700 !rounded-none text-sm">
							Bestselling
						</button>
					</ul>
					<ul>
						<button
							class="btn bg-surface-700 !rounded-none text-sm">
							Price (High to Low)
						</button>
					</ul>
					<ul>
						<button
							class="btn bg-surface-700 !rounded-none text-sm">
							Price (Low to High)
						</button>
					</ul>
				</nav>
			</button>
		</div>

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
							/[^0-9a-z ]/gi,
							''
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
