<script lang="ts">
	import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton"
	import Itemcard from "$lib/components/itemcard.svelte"
	import Colorpicker from "$lib/components/colorpicker.svelte"
	import { modalStore } from "@skeletonlabs/skeleton"
	import type { ModalSettings, ModalComponent } from "@skeletonlabs/skeleton"
	let avatar: string
	import { avatarstore } from "$lib/avatarstore"
	import { page } from "$app/stores"
	import { goto, invalidate } from "$app/navigation"

	avatarstore.subscribe(value => {
		avatar = value
	})

	let regenerating = false

	$: query = $page.url

	export let data
	const jwt = data.jwt
	const userid = data.user.userid

	let avatartype = data.user.avatartype ?? "R6"
	$: avatarfilter = data.avatarfilter
	$: currentPage = data.currentPage
	$: maxiumumPage = data.maxiumumPage
	$: currentItems = data.currentItems
	async function updateBodyType(newavatartype: string) {
		if (avatartype != newavatartype) {
			avatartype = newavatartype
			const response = await fetch("/api/avatar/updateavatartype", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: jwt,
				},
			})
		}
	}
	async function itemaction(action: any, itemid: Number) {
		console.log(action)
		console.log(itemid)
		const itemactionresult = await fetch("/api/itemaction", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				action,
				itemid,
			}),
		})
		const itemaction = await itemactionresult.json()
		invalidate("/api/userinfo/" + userid)
		console.log(itemaction)
	}
	$: if (avatarfilter == "bodycolors") {
		// pop up modal
		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: Colorpicker,
			props: { jwt: data.jwt },
		}
		const d: ModalSettings = {
			type: "component",
			// NOTE: title, body, response, etc are supported!
			component: modalComponent,
			modalClasses: "w-full max-w-[700px] p-4",
		}
		modalStore.trigger(d)
	}

	let regeneratebtn = "Regenerate"
	let regenerateimg: HTMLImageElement

	async function regenerate() {
		if (regenerating === false) {
			regenerating = true
			regeneratebtn = "Regenerating..."
			await fetch(
				`/api/thumbnailrender/?id=${data.user.userid}&method=regenerate`,
				{
					headers: { Authorization: jwt },
				}
			)
			await fetch(
				`/api/thumbnailrender/?id=${data.user.userid}&type=headshot&method=regenerate`,
				{
					headers: { Authorization: jwt },
				}
			)
			avatarstore.update(
				n =>
					(n =
						"/api/thumbnailrender/?id=" +
						data.user.userid +
						"&a=" +
						Date.now())
			)
			regeneratebtn = "Regenerate"
			regenerating = false
		}
	}

	function setPage(value: number) {
		if (currentPage - value >= 1 && currentPage - value <= maxiumumPage) {
			currentPage -= value
			query.searchParams.set("page", currentPage.toString())
			goto(query.href)
			console.log(query.href)
		}
	}

	//$:avatarfilter,updateAvatarFilter()
</script>

<div
	class="bg-surface-700 p-4 flex flex-row flex-wrap space-x-2 relative max-w-[1000px] m-0 m-auto">
	<div class="bg-surface-800 relative block lg:hidden w-full">
		<RadioGroup
			rounded="rounded-md"
			display="flex absolute right-0 bottom-12">
			<RadioItem
				bind:group={avatartype}
				on:click={() => {
					updateBodyType("R15")
				}}
				value="R15">
				R15
			</RadioItem>
			<RadioItem
				bind:group={avatartype}
				on:click={() => {
					updateBodyType("R6")
				}}
				value="R6">
				R6
			</RadioItem>
		</RadioGroup>
		<img
			bind:this={regenerateimg}
			src={avatar}
			alt={data.user.username}
			class="h-64 m-auto" />
		<button
			on:click={regenerate}
			class="btn variant-filled-primary w-full rounded-md btn-base"
			disabled={regenerating}>
			{regeneratebtn}
		</button>
	</div>

	<div class="w-full flex flex-row gap-2">
		<div class="bg-surface-800 relative hidden lg:block h-[19rem]">
			<RadioGroup
				rounded="rounded-md"
				display="flex absolute right-0 bottom-12">
				<RadioItem
					bind:group={avatartype}
					on:click={() => {
						updateBodyType("R15")
					}}
					value="R15">
					R15
				</RadioItem>
				<RadioItem
					bind:group={avatartype}
					on:click={() => {
						updateBodyType("R6")
					}}
					value="R6">
					R6
				</RadioItem>
			</RadioGroup>
			<img
				bind:this={regenerateimg}
				src={avatar}
				alt={data.user.username}
				class="h-64" />
			<button
				on:click={regenerate}
				class="btn variant-filled-primary w-full rounded-md btn-base"
				disabled={regenerating}>
				{regeneratebtn}
			</button>
		</div>

		<div class="bg-surface-800">
			<RadioGroup rounded="rounded-md truncate flex-wrap lg:flex-nowrap">
				<a class="unstyled" href="?filter=shirts">
					<RadioItem bind:group={avatarfilter} value="shirts">
						Shirts
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=pants">
					<RadioItem bind:group={avatarfilter} value="pants">
						Pants
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=hats">
					<RadioItem bind:group={avatarfilter} value="hats">
						Hats
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=faces">
					<RadioItem bind:group={avatarfilter} value="faces">
						Faces
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=packages">
					<RadioItem bind:group={avatarfilter} value="packages">
						Packages
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=heads">
					<RadioItem bind:group={avatarfilter} value="heads">
						Heads
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=gears">
					<RadioItem bind:group={avatarfilter} value="gears">
						Gears
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=emotes">
					<RadioItem bind:group={avatarfilter} value="emotes">
						Emotes
					</RadioItem>
				</a>
				<a class="unstyled" href="?filter=bodycolors">
					<RadioItem bind:group={avatarfilter} value="bodycolors">
						🖌️
					</RadioItem>
				</a>
			</RadioGroup>
			<div
				class="flex flex-col flex-wrap sm:grid sm:grid-cols-6 gap-2 p-2">
				{#if currentItems && avatarfilter != "bodycolors"}
					{#each currentItems as { itemdata, ItemId, Hidden, Equipped }}
						{#if !Hidden}
							<Itemcard
								itemname={itemdata.Name}
								itemid={ItemId}
								width="w-24"
								interact="true"
								equipped={Equipped}
								action={itemaction} />
							<div
								class="bg-surface-800 flex flex-row block sm:hidden px-2 relative">
								<a
									class="unstyled"
									href="/catalog/{ItemId}/{itemdata.Name.replace(
										/[^0-9a-z ]/gi,
										''
									).replaceAll(' ', '-')}">
									<img
										class="w-20"
										alt="L"
										src="/api/thumbnailrender/asset/?id={ItemId}" />
								</a>
								<div>
									<h3 class="truncate">{itemdata.Name}</h3>
								</div>
								{#if Equipped === true}
									<button
										on:click={() => {
											itemaction(
												"remove",
												parseFloat(ItemId)
											)
										}}
										class="btn variant-filled-primary rounded-md btn-sm absolute right-0 top-5">
										Remove
									</button>
								{:else}
									<button
										on:click={() => {
											itemaction(
												"wear",
												parseFloat(ItemId)
											)
										}}
										class="btn variant-filled-primary rounded-md btn-sm absolute right-0 top-5">
										Wear
									</button>
								{/if}
							</div>
						{/if}
					{/each}
				{/if}
			</div>
			{#if avatarfilter != "bodycolors"}
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
			{/if}
		</div>
	</div>
</div>
