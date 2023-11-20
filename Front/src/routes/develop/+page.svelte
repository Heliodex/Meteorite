<script lang="ts">
	import { Tab, TabGroup } from "@skeletonlabs/skeleton"
	import Clothing from "$lib/components/develop/clothing.svelte"
	import Games from "$lib/components/develop/games.svelte"
	import Asset from "$lib/components/develop/asset.svelte"
	import Packages from "$lib/components/develop/admin/packages.svelte"
	import Accessories from "$lib/components/develop/admin/accessories.svelte"
	import { modalStore } from "@skeletonlabs/skeleton"
	import type { ModalSettings, ModalComponent } from "@skeletonlabs/skeleton"
	import { slide } from "svelte/transition"
	import Launchmodal from "$lib/components/games/launchmodal.svelte"

	let storeTab = "Shirts"

	export let data

	let openstudio = false

	function launch(version: string) {
		document.location.href = `meteorite-launch://${0}[${
			data.jwt
		}[${version}[${"studio"}`

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
</script>

<div
	class="bg-surface-800 p-4 flex flex-row flex-wrap space-x-2 space-y-4 relative max-w-[970px] m-0 m-auto">
	<div class="w-full flex flex-row">
		<h3>Develop</h3>

		<div class="grow flex flex-row">
			<button
				on:click={() => {
					openstudio = !openstudio
				}}
				class="btn hover:text-blue-300">
				Open Studio
			</button>
			{#if openstudio}
				<div
					class="flex flex-row"
					transition:slide|local={{ duration: 400, axis: "x" }}>
					<button
						on:click={() => {
							launch("2016")
						}}
						class="btn !text-sm">
						2016
					</button>
					<button
						on:click={() => {
							launch("2020")
						}}
						class="btn !text-sm">
						2020
					</button>
				</div>
			{/if}
		</div>
	</div>

	<TabGroup
		justify="flex flex-row flex-wrap sm:flex-col sm:w-32"
		borderWidth="border-l-2"
		rounded="">
		<div>
			<Tab bind:group={storeTab} value="Shirts">Shirts</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="Pants">Pants</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="games">Games</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="audios">Audios</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="badges">Badges</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="meshes">Meshes</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="userads">User Ads</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="videos">Videos</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="gamepasses">Game Passes</Tab>
		</div>
		<div>
			<Tab bind:group={storeTab} value="devproducts">
				Developer Products
			</Tab>
		</div>
		{#if data.user.admin === true || data.user.ugcpermission === true}
			<h3 class="w-full">Admin</h3>
			<div>
				<Tab bind:group={storeTab} value="Hats">Hats</Tab>
			</div>
			<div>
				<Tab bind:group={storeTab} value="Gears">Gears</Tab>
			</div>
			<div>
				<Tab bind:group={storeTab} value="Faces">Faces</Tab>
			</div>
			<div>
				<Tab bind:group={storeTab} value="Packages">Packages</Tab>
			</div>
			<div>
				<Tab bind:group={storeTab} value="Animation Bundle">
					Animation Bundles
				</Tab>
			</div>
			<div>
				<Tab bind:group={storeTab} value="Emotes">Emotes</Tab>
			</div>
		{/if}
	</TabGroup>
	{#if storeTab === "Shirts" || storeTab === "Pants"}
		<Clothing jwt={data.jwt} type={storeTab} />
	{/if}

	{#if storeTab === "games"}
		<Games jwt={data.jwt} type={storeTab} {data} />
	{/if}

	{#if storeTab === "audios" || storeTab === "badges" || storeTab === "meshes" || storeTab === "userads" || storeTab === "gamepasses" || storeTab === "videos"}
		<Asset jwt={data.jwt} type={storeTab} />
	{/if}

	{#if storeTab === "Packagess"}
		<Packages jwt={data.jwt} type={storeTab} />
	{/if}

	{#if storeTab === "Hats" || storeTab === "Gears" || storeTab === "Faces" || storeTab === "Emotes"}
		<Accessories jwt={data.jwt} type={storeTab} />
	{/if}

	<!-- {#if storeTab === "userads"}{/if} -->
</div>
