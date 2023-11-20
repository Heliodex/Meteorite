<script lang="ts">
	import { Avatar } from "@skeletonlabs/skeleton"
	import Gamecard from "../../components/gamecard.svelte"
	let avatar: string
	import { avatarstore } from "$lib/avatarstore"
	import Statusbubble from "../../components/statusbubble.svelte"
	import Skybanner from "../../components/skybanner.svelte"
	import { invalidate } from "$app/navigation"
	import RelativeTime from "@yaireo/relative-time"
	const relativeTime = new RelativeTime()
	//import Bannerad from "../../components/bannerad.svelte";
	avatarstore.subscribe(value => {
		avatar = value
	})

	export let data
	let friends = data.friendsdata
	let FeedDisabled = true
	let sharevalue: string
	let jwt = data.jwt
	$: if (!sharevalue) {
		FeedDisabled = true
	} else {
		FeedDisabled = false
	}
	let feedmessage = { error: false, message: "" }
	async function share() {
		const response = await fetch("/api/feed/share", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				sharevalue,
			}),
		})
		const data = await response.json()
		if (!data.error) {
			sharevalue = ""
			invalidate("/api/feed/fetch")
			feedmessage.error = false
		} else {
			feedmessage.error = true
			feedmessage.message = data.error
		}
	}
</script>

<div class="space-y-4 max-w-[1500px] m-0 m-auto space-x-4">
	<Skybanner customclass="float-left mr-10" />
	<Skybanner customclass="float-right ml-10" />
	<div class="grow space-y-2">
		<div
			class="flex flex-col space-y-2 sm:flex-row sm:space-y-14 sm:space-x-2">
			<a class="unstyled" href="/users/{data.user.userid}">
				<Avatar src={avatar + "&type=headshot"} width="w-40" />
			</a>
			{#if data.user.membership === "BuildersClub"}
				<img
					src="/assets/images/BC_Icon.svg"
					class="h-12 w-[89.5px]"
					alt={data.user.membership} />
			{:else if data.user.membership === "TurboBuildersClub"}
				<img
					src="/assets/images/TBC_Icon.png"
					class="h-12 w-[89.5px]"
					alt={data.user.membership} />
			{:else if data.user.membership === "OutrageousBuildersClub"}
				<img
					src="/assets/images/OBC_Icon.svg"
					class="h-12 w-[89.5px]"
					alt={data.user.membership} />
			{/if}
			<h2 class="">Hello, {data.user.username}!</h2>
		</div>

		<h2 class="">Friends ({data.user?.friends?.length ?? 0})</h2>

		<div
			class="grid grid-flow-col grid-rows-none overflow-x-scroll overflow-y-hidden auto-cols-max bg-surface-700 rounded-md snap-mandatory snap-x h-40">
			{#if data.friendsdata}
				{#each friends as { userid, username, status }}
					<a class="unstyled" href="/users/{userid}">
						<div class="snap-center">
							<header class="card-header relative">
								<Avatar
									width="w-24"
									src="/api/thumbnailrender/?id={userid}&type=headshot" />
								<Statusbubble
									size="4"
									status={status.status}
									{userid}
									gameid={status.status?.id} />
							</header>
							<footer
								class="card-footer truncate w-32 text-center">
								{username}
							</footer>
						</div>
					</a>
				{/each}
			{/if}
		</div>

		<h2 class="">Recently Played</h2>

		<div
			class="flex flex-row flex-wrap md:grid md:grid-flow-col md:grid-rows-none overflow-x-scroll overflow-y-hidden auto-cols-max gap-4 bg-surface-500/5 snap-mandatory snap-x sm:h-60">
			{#if data.recentlyplayed}
				{#each [...data.recentlyplayed].reverse() as { nameofgame, idofgame, version, visits, numberofplayers, useridofowner, owner }}
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
			{/if}
		</div>

		<div
			class="max-w-[1150px] m-0 m-auto flex flex-row gap-x-6 justify-around">
			<div
				class="bg-surface-800 w-full p-4 space-y-2 h-[600px] overflow-auto">
				<h2 class="">My Feed</h2>
				<div class="flex flex-row w-full space-x-4">
					<textarea
						on:click={() => {
							feedmessage.error = false
						}}
						class="rounded-md grow input input-bordered input-primary"
						maxlength={50}
						bind:value={sharevalue}
						placeholder="What are you up to?" />
					<button
						on:click={share}
						class="btn mt-6 variant-filled-primary rounded-md"
						disabled={FeedDisabled}>
						Share
					</button>
				</div>
				{#if feedmessage.error}
					<h5 class="!text-xs text-error-600">
						{feedmessage.message}
					</h5>
				{/if}
				<div
					class="w-full flex flex-col overflow-auto flex-wrap gap-y-5 pt-4">
					{#if data.feed}
						{#each [...data.feed].reverse() as { content, posterid, date, userdata }}
							<div class="flex flex-row gap-x-6">
								<a class="unstyled" href="/users/{posterid}">
									<Avatar
										src={"/api/thumbnailrender/?id=" +
											posterid +
											"&type=headshot"}
										width="w-14" />
								</a>
								<div>
									<a
										class="truncate !text-base"
										href="/users/{posterid}">
										{userdata.username}
									</a>
									<h5 class="!text-base">"{content}"</h5>
									<h5 class="!text-xs">
										Posted {relativeTime.from(
											new Date(date),
										)}
									</h5>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>

			<div class="bg-surface-800 w-full p-4">
				<h2 class="">Blog</h2>
			</div>
		</div>
	</div>
</div>
