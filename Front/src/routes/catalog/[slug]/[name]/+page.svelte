<script lang="ts">
	import { Avatar } from "@skeletonlabs/skeleton"
	import Rocks from "../../../../components/rocks.svelte"
	import Commentcard from "../../../../components/commentcard.svelte"
	import type { PageData } from "./$types"
	import { toastStore, menu } from "@skeletonlabs/skeleton"
	import type { ToastSettings } from "@skeletonlabs/skeleton"
	import { coinstore } from "$lib/coinstore"
	import { MoreHorizontalIcon } from "lucide-svelte"

	export let data: PageData

	let itemid = data.item.ItemId
	let price = data.item.Price
	let money = data.user.coins
	let jwt = data.jwt
	let disabled = false
	let buyButton = "Buy"
	const t: ToastSettings = {
		message: "resp",
		// Optional: Presets for primary | secondary | tertiary | warning
		preset: "primary",
		// Optional: The auto-hide settings
		autohide: true,
		timeout: 2000,
	}

	async function buy() {
		const response = await fetch("/api/purchase", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				itemid,
			}),
		})
		const data: any = await response.json()
		t.message = data.error ?? data.message
		if (data.error) {
			t.preset = "error"
		} else {
			t.preset = "primary"
			disabled = true
			buyButton = "Owned"
			coinstore.update(n => n - price)
		}
		toastStore.trigger(t)
	}

	async function moderate() {
		const result = await fetch("/api/moderate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				itemid,
			}),
		})
		const moderateresult = await result.json()
		console.log(moderateresult)
		document.location = "/catalog/" + itemid
	}

	if (data.user.inventory) {
		// check if user already owns item
		for (let v of data.user.inventory) {
			if (v.ItemId === data.item.ItemId) {
				// they already own it
				disabled = true
				buyButton = "Owned"
			}
		}
	}
</script>

<svelte:head>
	<title>Meteorite - {data.item.Name}</title>
</svelte:head>

<div
	class="bg-surface-700 p-4 space-x-2 flex flex-row flex-wrap sm:flex-nowrap max-w-[1100px] m-0 m-auto">
	<div class="sm:border m-auto sm:p-12 sm:w-[418px] relative">
		<img
			class="m-auto border sm:border-0 object-cover"
			alt={data.item.Name}
			src="/api/thumbnailrender/asset/?id={data.item.ItemId}" />
		{#if data.user.admin === true || (data.user.userid === data.item?.Creator && data.user.ugcpermission === true)}
			<button
				on:click={moderate}
				class="btn variant-filled-primary rounded-md btn-sm absolute right-0 top-0">
				Delete
			</button>
		{/if}
	</div>
	<div class="text-center sm:text-left">
		<div class="flex flex-row">
			<h2>{data.item.Name}</h2>
			<span class="relative ml-auto">
				<button use:menu={{ menu: "navigationconfig" }}>
					<MoreHorizontalIcon />
				</button>
				<nav
					class=" rounded-none pb-2 pt-2 w-40"
					data-menu="navigationconfig">
					<ul>
						<a
							href="/catalog/{data.item.ItemId}/configure"
							class="btn variant-filled-primary !rounded-md w-full btn-sm text-xs">
							Configure
						</a>
					</ul>
				</nav>
			</span>
		</div>

		<h5>
			By <a href="/users/{data.item.Creator ?? '0'}">
				{data.creatorusername ?? "SushiWasNotHere"}
			</a>
		</h5>

		<div class="flex flex-row pt-4">
			<div class="flex flex-row flex-wrap justify-center">
				<div class="flex flex-row grow">
					<h5 class="text-base hidden sm:block">Price</h5>
					<div class="flex flex-row pl-20 w-[17.5rem]">
						<Rocks width="w-8 mb-10" />
						<h4>{data.item.Price}</h4>
					</div>
				</div>

				<button
					on:click={buy}
					class="btn variant-filled-primary rounded-md w-full sm:w-44 h-14 btn-lg"
					{disabled}>
					{buyButton}
				</button>

				<div class="flex flex-row flex-wrap w-full">
					<h5 class="text-base">Type</h5>
					<div class="flex flex-row pl-20">
						<h5 class="text-base">{data.item.Type}</h5>
					</div>
					<div class="flex flex-row w-full pt-2">
						<h5 class="text-base">Description</h5>
						<div class=" pl-8">
							<h5
								class="text-base w-52 h-48 overflow-y-auto break-words whitespace-pre-line">
								{data.item?.Description ?? ""}
							</h5>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<h3 class="pt-4 max-w-[1100px] m-0 m-auto">Commentary</h3>

<Commentcard
	AssociatedAssetType={"item"}
	AssociatedAssetId={data.item.ItemId}
	jwt={data.jwt}
	width="1100" />
