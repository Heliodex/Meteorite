<script lang="ts">
	import { Avatar } from "@skeletonlabs/skeleton"
	import { onMount } from "svelte"
	export let gamename = ""
	export let playercount = ""
	export let idofgame: String
	export let version = ""
	export let visits = ""
	export let useridofowner = ""
	export let useragent: string
	export let username = ""
	let imageloading = true
	const onload = (node: HTMLImageElement, callback: VoidFunction) => {
		if (node.complete) {
			imageloading = false
		} else {
			node.addEventListener("load", callback)

			return {
				destroy() {
					node.removeEventListener("load", callback)
				},
			}
		}
	}
</script>

{#if useragent.includes("Android") === true || useragent.includes("iPhone") === true}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="unstyled group"
		on:click={() => {
			document.location.href =
				"/games/" +
				idofgame +
				"/" +
				gamename.replace(/[^0-9a-z ]/gi, "").replaceAll(" ", "-")
		}}>
		<div
			class="card rounded-md card-glass-surface snap-center card-hover w-20 sm:w-40 relative">
			{#if imageloading}
				<div
					class="w-20 h-20 sm:w-40 sm:h-40 rounded-none placeholder animate-pulse">
				</div>
			{/if}
			<img
				alt=""
				class="avatar-image w-20 h-20 sm:w-40 sm:h-40 object-cover {imageloading ===
				true
					? 'hidden'
					: ''} "
				use:onload={() => (imageloading = false)}
				src="/assets/gameassets/thumbnail-{idofgame}.png#" />
			<p class="truncate w-auto">{gamename}</p>
			<div class="!text-sm">{playercount} Playing</div>
			<div
				class="btn h-2 w-6 sm:w-14 variant-filled-surface rounded-none absolute top-0 right-0">
				{version}
			</div>
			<div
				class="hidden group-hover:block hover:block absolute top-32 sm:top-52">
				<div class="!text-xs">
					By <a href="/users/{useridofowner}">{username}</a>
				</div>
				<div class="!text-xs">{visits ?? "0"} Visits</div>
			</div>
		</div>
	</div>
{:else}
	<a
		class="unstyled group"
		href="/games/{idofgame}/{gamename
			.replace(/[^0-9a-z ]/gi, '')
			.replaceAll(' ', '-')}">
		<div
			class="card rounded-md card-glass-surface snap-center card-hover w-20 sm:w-40 relative">
			{#if imageloading}
				<div
					class="w-20 h-20 sm:w-40 sm:h-40 rounded-none placeholder animate-pulse">
				</div>
			{/if}
			<img
				alt=""
				class="avatar-image w-20 h-20 sm:w-40 sm:h-40 object-cover {imageloading ===
				true
					? 'hidden'
					: ''} "
				use:onload={() => (imageloading = false)}
				src="/assets/gameassets/thumbnail-{idofgame}.png#" />
			<p class="truncate w-auto">{gamename}</p>
			<div class="!text-sm">{playercount} Playing</div>
			<div
				class="btn h-2 w-6 sm:w-14 variant-filled-surface rounded-none absolute top-0 right-0">
				{version}
			</div>
			{#if username}<div
					class="hidden group-hover:block hover:block absolute top-32 sm:top-52">
					<div class="!text-xs flex flex-row">
						By <div
							class="text-primary-700 dark:text-primary-500 hover:brightness-110 underline truncate w-20 sm:w-40">
							{username}
						</div>
					</div>
					<!-- not using anchor links here because it breaks styling in certain instances -->
					<div class="!text-xs">{visits ?? "0"} Visits</div>
				</div>{/if}
		</div>
	</a>
{/if}
