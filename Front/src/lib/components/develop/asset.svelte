<script lang="ts">
	import Createditems from "./createditems.svelte"
	import { url } from "$lib/url"

	let message = { error: false, message: "" }
	let disabled = false
	let itemname: string
	let files: FileList
	let price: string
	let associatedgameid: string
	let creations: any[] = []

	$: if (!itemname) {
		disabled = true
		message.message = "Item name required."
		message.error = true
	} else if (!files) {
		disabled = true
		message.message = "File required."
		message.error = true
	} else if (type === "gamepasses" && (!price || !associatedgameid)) {
		disabled = true
		message.message = "Price and associated game id required."
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
			body: JSON.stringify({ type }),
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
		formData.append("assetfile", files[0])
		formData.append("itemname", itemname)
		formData.append("price", price)
		formData.append("gameid", associatedgameid)

		const req = await fetch("/develop/upload" + type, {
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
			updatecreations()
		} else {
			message.message = res.error
			message.error = true
		}
	}

	$: type, updatecreations() // if type variable changes run updatecreations again
</script>

<div class="space-y-2 grow">
	{#if type === "audios"}
		<h3>Create a Audio</h3>
	{:else if type === "badges"}
		<h3>Create a Badge</h3>
	{:else if type === "meshes"}
		<h3>Create a Mesh</h3>
	{:else if type === "userads"}
		<h3>Create a User Ad</h3>
	{:else if type === "gamepasses"}
		<h3>Create a Gamepass</h3>
	{:else if type === "videos"}
		<h3>Create a Video</h3>
	{/if}
	<label class="input-label">
		{#if type === "badges" || type === "userads" || type === "gamepasses"}
			<span class="pt-3">Find your image:</span>
		{:else if type === "meshes"}
			<span class="pt-3">Find your mesh:</span>
		{:else if type === "audios"}
			<span class="pt-3">Find your audio:</span>
		{:else if type === "videos"}
			<span class="pt-3">Find your video:</span>
		{/if}

		{#if type === "audios"}
			<input class="w-fit" accept="audio/mp3" bind:files type="file" />
		{:else if type === "meshes"}
			<input class="w-fit" accept=".mesh" bind:files type="file" />
		{:else if type === "badges" || type === "userads" || type === "gamepasses"}
			<input class="w-fit" accept="image/png" bind:files type="file" />
		{:else if type === "videos"}
			<input class="w-fit" accept=".webm" bind:files type="file" />
		{/if}
	</label>
	<label class="input-label gap-8">
		{#if type === "audios"}
			<span class="pt-3">Audio Name:</span>
		{:else if type === "badges"}
			<span class="pt-3">Badge Name:</span>
		{:else if type === "meshes"}
			<span class="pt-3">Mesh Name:</span>
		{:else if type === "userads"}
			<span class="pt-3">Ad Name:</span>
		{:else if type === "gamepasses"}
			<span class="pt-3">Gamepass Name:</span>
		{:else if type === "videos"}
			<span class="pt-3">Video Name:</span>
		{/if}
		<input
			bind:value={itemname}
			type="text"
			class="input input-bordered input-primary w-full max-w-md rounded-md"
			required />
	</label>

	{#if type === "gamepasses"}
		<label class="input-label gap-8">
			<span class="pt-3">Price:</span>
			<input
				bind:value={price}
				type="number"
				class="input input-bordered input-primary w-full max-w-md rounded-md"
				required />
		</label>
	{/if}

	{#if type === "gamepasses"}
		<label class="input-label gap-8">
			<span class="pt-3">Associated game id:</span>
			<input
				bind:value={associatedgameid}
				type="number"
				class="input input-bordered input-primary w-full max-w-md rounded-md"
				required />
		</label>
	{/if}

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
		Upload for 0 Rocks
	</button>

	<div class="pt-8 space-y-4">
		{#if type === "audios"}
			<h3>Audios</h3>
		{:else if type === "badges"}
			<h3>Badges</h3>
		{:else if type === "meshes"}
			<h3>Meshes</h3>
		{:else if type === "userads"}
			<h3>User Ads</h3>
		{:else if type === "gamepasses"}
			<h3>Gamepasses</h3>
		{:else if type === "videos"}
			<h3>Videos</h3>
		{/if}

		{#each creations as { Name, ItemId }}
			<Createditems itemname={Name} itemid={ItemId} {type} />
		{/each}
	</div>
</div>
