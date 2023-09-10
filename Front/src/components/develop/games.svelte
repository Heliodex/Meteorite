<script lang="ts">
	import { coinstore } from "$lib/coinstore"
	import type { PageData } from "../../routes/$types"
	import Createdgames from "../develop/createdgames.svelte"
	import { url } from "$lib/url"
	export let data: PageData
	let message = { error: false, message: "" }
	let disabled = false
	let itemname: string
	let itemdesc: string
	let files: FileList
	let gamefiles: FileList
	let version: string
	let creations: any[] = []

	$: if (!itemname) {
		disabled = true
		message.message = "Game name required."
		message.error = true
	} else if (!files || !gamefiles) {
		disabled = true
		message.message = "File required."
		message.error = true
	} else {
		disabled = false
		message.message = ""
		message.error = false
	}

	export let type: string
	export let jwt: string

	async function updatecreations() {
		const response = await fetch(url + "/develop/creations", {
			method: "POST",
			body: JSON.stringify({ type: "games" }),
			headers: { "content-type": "application/json", Authorization: jwt },
		})
		const data = await response.json()
		if (!data.error) {
			creations = data
			//console.log(creations)
		}
	}
	updatecreations()

	async function upload() {
		const formData = new FormData()
		formData.append("gamefile", gamefiles[0])
		formData.append("thumbnail", files[0])
		formData.append("gamename", itemname)
		formData.append("description", itemdesc ?? "...")
		formData.append("version", version)

		const req = await fetch("/develop/uploadgame", {
			method: "post",
			body: formData,
			headers: {
				Authorization: jwt,
			},
		})

		const res = await req.json()

		if (!res.error) {
			message.message = "Done!"
			message.error = false
			coinstore.update(n => n - 5)
			updatecreations()
		} else {
			message.message = res.error
			message.error = true
		}
	}

	$: type, updatecreations() // if type variable changes run updatecreations again
</script>

<div class="space-y-2 grow">
	<h3>Create a Game</h3>
	<label class="input-label">
		<span class="pt-3">Thumbnail :</span>
		<input class="w-fit" accept="image/png" bind:files type="file" />
	</label>
	<label class="input-label">
		<span class="pt-3">Game File :</span>
		<input
			class="w-fit"
			accept=".rbxl"
			bind:files={gamefiles}
			type="file" />
	</label>
	<label class="input-label gap-6">
		<span class="pt-3">Game Name:</span>
		<input
			bind:value={itemname}
			type="text"
			class="input input-bordered input-primary w-full max-w-md rounded-md"
			required />
	</label>

	<label class="input-label gap-8">
		<span class="pt-3">Description:</span>
		<textarea
			bind:value={itemdesc}
			class="input input-bordered input-primary w-full max-w-md rounded-md"
			required>
		</textarea>
	</label>

	<label class="input-label gap-14">
		<span class="pt-3">Version:</span>
		<select bind:value={version} class="select w-full max-w-md">
			<option value="2020">2020</option>
			<option value="2018">2018</option>
			<option value="2016">2016</option>
		</select>
	</label>

	<h5
		class="!text-xs mt-6 {message.error === true
			? 'text-error-600'
			: 'text-success-600'}">
		{message.message ?? ""}
	</h5>

	<button
		on:click={upload}
		type="submit"
		class="btn variant-filled-primary btn-sm text-base rounded-md"
		{disabled}>
		Upload for 5 Rocks
	</button>

	<div class="pt-8 space-y-4">
		<h3>Games</h3>

		{#each creations as { nameofgame, idofgame, Description, avatartype, gearallowed }}
			<Createdgames
				itemname={nameofgame}
				itemid={idofgame}
				{data}
				{avatartype}
				{gearallowed} />
		{/each}
	</div>
</div>
