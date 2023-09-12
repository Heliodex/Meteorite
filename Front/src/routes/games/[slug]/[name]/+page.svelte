<script lang="ts">
	import type { PageData } from "./$types"
	import { menu, tooltip } from "@skeletonlabs/skeleton"
	import Commentcard from "../../../../components/commentcard.svelte"
	import { TabGroup, Tab } from "@skeletonlabs/skeleton"
	import { writable, type Writable } from "svelte/store"
	import { Modal, modalStore } from "@skeletonlabs/skeleton"
	import type { ModalSettings, ModalComponent } from "@skeletonlabs/skeleton"
	import { invalidate } from "$app/navigation"
	import Skybanner from "../../../../components/skybanner.svelte"
	import Launchmodal from "../../../../components/games/launchmodal.svelte"
	import Linkdiscordmodal from "../../../../components/games/linkdiscordmodal.svelte"
	import Advertisemodal from "../../../../components/assets/advertisemodal.svelte"
	import Itemcard from "../../../../components/itemcard.svelte"
	import { MoreHorizontalIcon } from "lucide-svelte"
	let storeTab = "About"

	export let data: PageData
	const jwt = data.jwt

	let likefill = "none"
	let dislikefill = "none"
	let gamepasses: any[] = []

	function launch() {
		console.log(data.user.discordid)
		if (!data?.user?.discordid) {
			const modalComponent: ModalComponent = {
				// Pass a reference to your custom component
				ref: Linkdiscordmodal,
				// Add your props as key/value pairs
				// Provide default slot content as a template literal
				slot: "<p>Skeleton</p>",
			}
			const d: ModalSettings = {
				type: "component",
				// NOTE: title, body, response, etc are supported!,
				component: modalComponent,
			}
			modalStore.trigger(d)
			return
		}
		document.location.href = `meteorite-launch://${data.game.idofgame}[${data.jwt}[${data.game.version}`

		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: Launchmodal,
			// Add your props as key/value pairs
			// Provide default slot content as a template literal
			slot: "<p>Skeleton</p>",
		}
		const d: ModalSettings = {
			type: "component",
			// NOTE: title, body, response, etc are supported!,
			component: modalComponent,
		}
		modalStore.trigger(d)

		setTimeout(function () {
			modalStore.close()
		}, 4000) // wait 4 seconds
	}

	async function shutdown() {
		const shutdownresp = await fetch("http://mete0r.xyz/games/shutdown", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				gameid: data.game.idofgame,
			}),
		})
		const shutdownjson = await shutdownresp.json()
		console.log(shutdownjson)
	}

	async function evictplayer(userid: Number) {
		const evictplayerresp = await fetch(
			"http://mete0r.xyz/games/evictplayer",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: jwt,
				},
				body: JSON.stringify({
					gameid: data.game.idofgame,
					userid,
				}),
			},
		)
		const evictplayerjson = await evictplayerresp.json()
		console.log(evictplayerjson)
		invalidate(
			url => url.pathname === "/games/gameinfo/" + data.game.idofgame,
		)
	}

	function advertise() {
		const modalComponent: ModalComponent = {
			ref: Advertisemodal,
			props: { jwt: data.jwt, itemid: data.game.idofgame, type: "game" },
		}
		const d: ModalSettings = {
			type: "component",
			component: modalComponent,
		}
		modalStore.trigger(d)
	}

	async function requestStore() {
		const res = await fetch(`/games/gameinfo/${data.game.idofgame}/store`)
		gamepasses = (await res.json()).gameinfo
	}

	$: if (storeTab === "Store" && gamepasses.length === 0) {
		requestStore()
	}
</script>

<svelte:head>
	<title>Meteorite - {data.game.nameofgame}</title>
	<meta content="Meteorite!" property="og:title" />
	<meta
		content="{data.game
			.nameofgame} - Join others who are recreating the game world."
		property="og:description" />
	<meta content="https://mete0r.xyz" property="og:url" />
	<meta content="#6f00ff" data-react-helmet="true" name="theme-color" />

	<meta
		name="twitter:image:src"
		content="https://mete0r.xyz/assets/gameassets/thumbnail-{data.game
			.idofgame}.png" />
	<meta name="twitter:site" content="@Meteorite" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="{data.game
			.nameofgame} - Join others who are recreating the game world." />
	<meta name="twitter:description" content="Meteorite" />
</svelte:head>
<div class="max-w-[1400px] m-0 m-auto">
	<Skybanner customclass="float-left" customMediaClass="hidden xl:block" />
	<Skybanner customclass="float-right" customMediaClass="hidden xl:block" />
	<div
		class="bg-surface-700 p-4 flex flex-row flex-wrap space-x-4 relative max-w-[970px] m-0 m-auto">
		<img
			class="h-[360px] w-[640px] aspect-video m-auto"
			alt={data.game.nameofgame}
			src="http://mete0r.xyz/assets/gameassets/thumbnail-{data.game
				.idofgame}.png#"
			style="height:360px;width:640px" />
		<div class="grow">
			<div class=" flex flex-row justify-evenly">
				<h3 class="font-bold truncate overflow-auto w-64">
					{data.game.nameofgame}
				</h3>
				{#if data?.user?.admin === true || data.game?.useridofowner === data?.user?.userid}
					<span class="relative">
						<button
							class="w-6 pt-2"
							use:menu={{ menu: "navigationgame" }}>
							<MoreHorizontalIcon />
						</button>
						<nav
							class="rounded-none pb-2 pt-2 w-40"
							data-menu="navigationgame">
							<ul class="space-y-1">
								<button
									on:click={shutdown}
									class="btn variant-filled-primary !rounded-md w-full btn-sm text-xs">
									Shut Down All Servers
								</button>
								<button
									on:click={advertise}
									class="btn variant-filled-primary !rounded-md w-full btn-sm text-xs">
									Advertise
								</button>
							</ul>
						</nav>
					</span>
				{/if}
			</div>

			<h5 class="text-base truncate w-64">
				By <a href="/users/{data.game.useridofowner}">
					{data.creatorusername}
				</a>
			</h5>
			<div class="pt-10 sm:pt-40 px-6">
				{#if data.user}
					{#if data.useragent.includes("Android") === true || (data.useragent.includes("iPhone") === true && data.game.version != "2020")}
						<a
							data-sveltekit-reload
							class="btn variant-filled-primary rounded-md w-full btn-lg"
							href="/games/start?placeid={data.game.idofgame}">
							Play
						</a>
					{:else if data.useragent.includes("Android") === true || data.useragent.includes("iPhone") === true}
						<a
							rel="external"
							class="btn variant-filled-primary rounded-md w-full btn-lg"
							href="robloxmobile://placeID={data.game.idofgame}">
							Play
						</a>
					{:else}
						<button
							on:click={launch}
							class="btn variant-filled-primary rounded-md w-full btn-lg">
							Play
						</button>
					{/if}
				{:else}
					<a
						class="btn variant-filled-primary rounded-md w-full btn-lg"
						href="/">
						Register
					</a>
				{/if}
			</div>
			<div class="flex flex-row pt-4 justify-evenly">
				<div class="flex flex-row space-x-2">
					<button>
						<svg
							on:mouseover={() => {
								likefill = "lime"
							}}
							on:mouseleave={() => {
								likefill = "none"
							}}
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill={likefill}
							stroke="lime"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="feather feather-thumbs-up">
							<path
								d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3">
							</path>
						</svg>
					</button>
					<h5 class="!text-sm pt-2">0</h5>
				</div>
				<div class="flex flex-row space-x-2">
					<button class="">
						<svg
							on:mouseover={() => {
								dislikefill = "red"
							}}
							on:mouseleave={() => {
								dislikefill = "none"
							}}
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill={dislikefill}
							stroke="red"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="feather feather-thumbs-up">
							<path
								d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17">
							</path>
						</svg>
					</button>
					<h5 class="!text-sm pt-2">0</h5>
				</div>
			</div>
		</div>
	</div>

	<div
		class="bg-surface-700 mt-4 flex flex-row justify-around flex-wrap relative max-w-[970px] m-0 m-auto">
		<TabGroup hover="" class="w-full">
			<Tab bind:group={storeTab} flex="grow" value="About">About</Tab>
			<Tab bind:group={storeTab} flex="grow" value="Store">Store</Tab>
			<Tab bind:group={storeTab} flex="grow" value="Players">Players</Tab>
		</TabGroup>
	</div>
	<h3 class="pt-4 max-w-[970px] m-0 m-auto">{storeTab}</h3>
	{#if storeTab === "About"}
		<div
			class="bg-surface-700 p-4 flex flex-row flex-wrap relative max-w-[970px] m-0 m-auto">
			<h5 class="break-words text-base whitespace-pre-line">
				{data.game?.descrption ?? "No Description"}
			</h5>

			<div class="w-full flex flex-row justify-around text-center">
				<div class="">
					<p class="font-bold">Playing</p>
					<p>{data.game.numberofplayers}</p>
				</div>

				<div class="">
					<p class="font-bold">Visits</p>
					<p>{data.game?.visits ?? "0"}</p>
				</div>

				<div class="">
					<p class="font-bold">Created</p>
					<p>{data.game.creationdate}</p>
				</div>
			</div>
		</div>
		<h3 class="pt-4 max-w-[970px] m-0 m-auto">Commentary</h3>
		<Commentcard
			AssociatedAssetType={"game"}
			AssociatedAssetId={data.game.idofgame}
			jwt={data.jwt}
			width="970" />
	{/if}

	{#if storeTab === "Players"}
		<div
			class="bg-surface-700 p-4 flex flex-row flex-wrap relative max-w-[970px] m-0 m-auto">
			<div class="flex flex-row flex-wrap">
				{#if data.game.players}
					{#each data.game.players as { userid, name }}
						<div class="relative">
							{#if data?.user?.admin === true || data.game?.useridofowner === data?.user?.userid}
								<button
									on:click={() => {
										evictplayer(userid)
									}}
									class="btn variant-filled-primary rounded-md btn-sm w-8 h-6 absolute right-0 top-0 z-10">
									Kick
								</button>
							{/if}
							<a href="/users/{userid}" class="relative">
								<img
									title={name}
									alt={name}
									class="h-20"
									src="/api/thumbnailrender/?id={userid}" />
							</a>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	{/if}

	{#if storeTab === "Store"}
		<div
			class="bg-surface-700 p-4 flex flex-row flex-wrap relative max-w-[970px] m-0 m-auto">
			<div class="flex flex-row flex-wrap">
				{#if gamepasses}
					{#each gamepasses as { Name, Price, ItemId, Hidden, Sales }}
						<Itemcard
							itemname={Name}
							itemid={ItemId}
							price={Price}
							sales={Sales} />
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>
