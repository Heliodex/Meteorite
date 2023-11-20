<script lang="ts">
	import { Avatar, Tab, TabGroup } from "@skeletonlabs/skeleton"
	import Statusbubble from "$lib/components/statusbubble.svelte"
	import Gamecard from "$lib/components/gamecard.svelte"

	export let data
	let jwt = data.jwt

	let gameid = data.profile.status.id
	let gamename = ""
	let canfriend = true
	let friendbutton = "Add Friend"
	let friends = data.profile?.friends
	let storeTab = "About"
	let creations: any[] = []
	let editAbout = false
	let about: string
	let checkedgames = false
	//$:console.log(friends)
	async function saveabout() {
		const result = await fetch("/settings/aboutme", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				about,
			}),
		})
		const aboutresult = await result.json()
		if (!aboutresult.error) {
			editAbout = false
			data.profile.aboutme = about
		}
	}

	$: {
		if (friends) {
			friends = data.profile?.friends
			friends = friends.sort((x: { offline: any }) =>
				!x.offline ? -1 : 1
			)
		}
	}

	async function requestGames() {
		const res = await fetch(
			`/api/userinfo/${data.profile.userid}/creations`
		)
		creations = await res.json()
		console.log(creations)
		checkedgames = true
	}

	$: if (
		storeTab === "Games" &&
		creations.length === 0 &&
		checkedgames === false
	) {
		requestGames()
	}

	async function requestGameName() {
		const res = await fetch(`/games/gameinfo/${gameid}`)
		const data = await res.json()
		if (data.error === false) {
			gamename = data.gameinfo.nameofgame
		}
	}
	$: if (data.profile.status.id) {
		gameid = data.profile.status.id
		requestGameName()
	}
	let equippedcount =
		data.profile?.inventory?.filter(
			(c: any) => c.Equipped === true && !c.Hidden
		)?.length ?? 0

	if (data.alreadyFriends === true) {
		friendbutton = "Sent!"
		canfriend = false
	}
	if (data.otherUserWantsToBeFriends === true) {
		friendbutton = "Accept"
	}

	async function requestFriend() {
		const result = await fetch("/api/friends/request-friendship", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				recipientUserId: data.profile.userid.toString(),
			}),
		})
		const requestresult = await result.json()
		console.log(requestresult)
		if (!requestresult.error) {
			if (requestresult?.message === "Friend request sent!") {
				friendbutton = "Sent!"
				canfriend = false
			}
			if (requestresult?.message === "You are now friends :D") {
				friendbutton = "Friends"
				canfriend = false
			}
		}
	}

	if (data.profile.friends) {
		if (
			data.profile.friends.some(
				(userid: { userid: any }) => userid.userid == data.user.userid
			) === true
		) {
			// already friends
			canfriend = false
			friendbutton = "Friends"
		}
	}
</script>

<svelte:head>
	<title>Meteorite - {data.profile.username}</title>
	{#if data.profile.css}
		{@html `<` + `style>${data.profile.css}</style>`}
	{/if}
</svelte:head>
<div class="max-w-[970px] m-0 m-auto">
	{#if data.profile.userid === 18}
		<audio id="my-audio" loop autoplay>
			<source
				src="https://cdn.mete0r.xyz/file/meteorite/bittersweet.m4a"
				type="audio/x-m4a" />
		</audio>
		<script type="text/javascript">
			let isAudioPlayed = false

			function playAudio() {
				isAudioPlayed = true
				const myAudio = document.getElementById("my-audio")
				myAudio.play()
			}

			document.body.onclick = () => {
				if (isAudioPlayed) return
				playAudio()
			}
		</script>
	{/if}

	<div>
		<div
			class="bg-surface-700 p-4 flex flex-row flex-wrap space-x-2 relative justify-between">
			<div class="m-auto relative">
				<Avatar
					width="block md:hidden w-28 m-auto"
					src="/api/thumbnailrender/?id={data.profile.userid +
						'&type=headshot&a=' +
						Date.now()}" />
				<Statusbubble
					customclass="block md:hidden"
					size="5"
					status={data.profile.status?.status}
					gameid={data.profile.status?.id} />
			</div>
			<div class="relative">
				<Avatar
					width="hidden md:block w-32"
					src="/api/thumbnailrender/?id={data.profile.userid +
						'&type=headshot&a=' +
						Date.now()}" />
				<Statusbubble
					customclass="hidden md:block"
					size="5"
					status={data.profile.status?.status}
					gameid={data.profile.status?.id} />
			</div>
			<div class="text-center sm:text-left grow">
				<div class="flex flex-row">
					<h2>{data.profile.username}</h2>

					{#if data.profile.membership === "BuildersClub"}
						<img
							src="/assets/images/BC_Icon.svg"
							class="h-12 w-[89.5px]"
							alt={data.user.membership} />
					{:else if data.profile.membership === "TurboBuildersClub"}
						<img
							src="/assets/images/TBC_Icon.png"
							class="h-12 w-[89.5px]"
							alt={data.user.membership} />
					{:else if data.profile.membership === "OutrageousBuildersClub"}
						<img
							src="/assets/images/OBC_Icon.svg"
							class="h-12 w-[89.5px]"
							alt={data.user.membership} />
					{/if}
				</div>

				<h5 class="!text-xs truncate">
					"{data.profile.bio ?? "Set your bio in settings!"}"
				</h5>
				{#if data.profile.status.status.includes("Playing") === true}
					<a class="unstyled" href="/games/{gameid}">
						<h5
							class="!text-base truncate text-green-500 hover:underline">
							Playing {gamename}
						</h5>
					</a>
				{/if}

				<div class="flex flex-row text-center pt-2">
					<div class="flex flex-row space-x-8 grow">
						<div class="truncate">
							<h5>Friends</h5>
							<h5>{data.profile?.friends?.length ?? 0}</h5>
						</div>
						<div class="truncate">
							<h5>Followers</h5>
							<h5>{data.profile?.followers ?? 0}</h5>
						</div>
					</div>
					{#if data.user.userid != data.profile.userid}
						<button
							on:click={requestFriend}
							class="btn variant-filled-primary rounded-md h-12 btn-sm"
							disabled={!canfriend}>
							{friendbutton}
						</button>
					{:else}
						<button
							class="btn variant-filled-primary rounded-md h-12 btn-sm"
							disabled>
							Add Friend
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<div
		class="bg-surface-700 mt-4 flex flex-row justify-evenly relative w-full">
		<TabGroup hover="" class="w-full">
			<Tab bind:group={storeTab} flex="grow" value="About">About</Tab>
			<Tab bind:group={storeTab} flex="grow" value="Games">Games</Tab>
		</TabGroup>
	</div>
	{#if storeTab === "About"}
		<div class="flex flex-row pt-4 gap-x-1">
			<h3 class="">About</h3>
			{#if data.user.userid === data.profile.userid}
				<svg
					on:click={() => {
						;(editAbout = true), (about = data.profile.aboutme)
					}}
					on:keydown
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="mt-2 hover:stroke-white">
					<path
						d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
					<path
						d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
				</svg>
			{/if}
		</div>
		{#if editAbout}
			<textarea
				class="rounded-md grow input input-bordered input-primary"
				bind:value={about}
				placeholder="Tell the Meteorite community what you think!"
				maxlength={200} />

			<div class="flex flex-row justify-end gap-x-2">
				<button
					on:click={() => ((editAbout = false), (about = ""))}
					class="btn btn-sm variant-filled-primary rounded-md">
					Cancel
				</button>
				<button
					on:click={saveabout}
					class="btn btn-sm variant-filled-primary rounded-md">
					Save
				</button>
			</div>
		{/if}
		<h5
			class="break-words max-h-24 overflow-auto whitespace-pre-line !text-base {editAbout ===
			true
				? 'hidden'
				: ''}">
			{data.profile.aboutme ?? ""}
		</h5>

		<h3 class="pt-4">Currently Wearing</h3>

		<div class="bg-surface-700 grid grid-cols-2 space-x-2 relative">
			<Avatar
				width="w-[300px] block md:hidden col-span-2 justify-self-center"
				background=""
				alt={data.profile.username}
				src="/api/thumbnailrender/?id={data.profile.userid +
					'&a=' +
					Date.now()}" />

			<Avatar
				width="w-[300px] hidden md:block justify-self-center"
				background=""
				alt={data.profile.username}
				src="/api/thumbnailrender/?id={data.profile.userid +
					'&a=' +
					Date.now()}" />
			<!-- if a user has less than 8 items in there inventory we space it differently -->
			<div
				class="bg-primary-700 max-h-[300px] col-span-2 md:col-span-1 px-2 py-2 md:p-8 gap-2 {equippedcount <=
				8
					? 'md:gap-y-10'
					: ''} overflow-x-scroll md:overflow-x-hidden md:overflow-y-scroll grid md:grid-cols-4 grid-flow-col md:grid-rows-none md:grid-flow-row auto-rows-max auto-cols-max">
				{#if data.wearingItems}
					{#each data.wearingItems as { Type, ItemId, itemdata, Equipped, Hidden }}
						{#if Equipped === true && !Hidden}
							<a
								href="/catalog/{ItemId}/{itemdata.Name.replace(
									/[^0-9a-z ]/gi,
									''
								).replaceAll(' ', '-')}">
								<img
									class="bg-surface-800 p-2 rounded-md w-28"
									alt={itemdata.Name}
									src="/api/thumbnailrender/asset/?id={ItemId}" />
							</a>
						{/if}
					{/each}
				{/if}
			</div>
		</div>

		<h3 class="pt-4">Friends</h3>

		<div
			class="grid grid-flow-col grid-rows-none overflow-x-scroll overflow-y-hidden auto-cols-max bg-surface-700 rounded-md snap-mandatory snap-x h-40">
			{#if data.profile.friends}
				{#each friends as { userid, username }, i}
					<a class="unstyled" href="/users/{userid}">
						<div class="snap-center">
							<header class="card-header relative">
								<Avatar
									width="w-24"
									src="/api/thumbnailrender/?id={userid}&type=headshot" />
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

		<h3 class="pt-4">Badges</h3>

		<div
			class="bg-surface-700 p-4 grid grid-flow-col auto-cols-max overflow-x-scroll h-40 sm:h-60">
			{#if data.profile.admin === true}
				<div
					class="card rounded-md card-glass-surface snap-center card-hover group w-20 sm:w-40 relative">
					<Avatar
						width=""
						rounded="rounded-none"
						src="/assets/images/logosmall.png" />
					<p class="truncate w-auto">Administrator</p>
				</div>
			{/if}
		</div>

		<h3 class="pt-4">Statistics</h3>

		<div
			class="bg-surface-700 p-4 flex flex-row justify-evenly h-20 text-center">
			<div class="">
				<p class="font-bold">Join Date</p>
				<p>{data.profile.joindate}</p>
			</div>

			<div class="">
				<p class="font-bold">Last Online</p>
				<p>{data.profile.lastonline}</p>
			</div>

			<div class="">
				<p class="font-bold">Place Visits</p>
				<p>{data.visits}</p>
			</div>
		</div>
	{/if}

	{#if storeTab === "Games"}
		<h3 class="pt-4">Games</h3>

		<div class="flex flex-row flex-wrap gap-2 pt-4">
			{#each creations as { nameofgame, idofgame, version, visits, numberofplayers, useridofowner }}
				<Gamecard
					gamename={nameofgame}
					playercount={numberofplayers}
					{version}
					{useridofowner}
					{visits}
					{idofgame}
					useragent={data.useragent} />
			{/each}
		</div>
	{/if}
</div>
