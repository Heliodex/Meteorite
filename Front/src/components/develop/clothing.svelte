<script lang="ts">
	import { coinstore } from "$lib/coinstore"
	import Createditems from "../develop/createditems.svelte"
	import { url } from "$lib/url"
	let message = { error: false, message: "" }
	let disabled = false
	let itemname: string
	let itemdesc: string
	let files: FileList
	let price: string
	let creations: any[] = []

	$: if (!itemname || !price) {
		disabled = true
		message.message = "Item name and price required."
		message.error = true
	} else if (parseFloat(price) < 5) {
		disabled = true
		message.message = "Minimum price is 5 rocks."
		message.error = true
	} else if (!files) {
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
		formData.append("clothingfile", files[0])
		formData.append("clothingname", itemname)
		formData.append("description", itemdesc ?? "...")
		formData.append("price", price)
		formData.append("type", type)

		const req = await fetch("develop/uploadclothing", {
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
	{#if type === "Shirts"}
		<h3>Create a Shirt</h3>
	{:else if type === "Pants"}
		<h3>Create a Pant</h3>
	{/if}
	<label class="input-label">
		<span class="pt-3">Find your image:</span>
		<input class="w-fit" accept="image/png" bind:files type="file" />
	</label>
	<label class="input-label gap-8">
		{#if type === "Shirts"}
			<span class="pt-3">Shirt Name:</span>
		{:else if type === "Pants"}
			<span class="pt-3">Pant Name:</span>
		{/if}
		<input
			bind:value={itemname}
			type="text"
			class="input input-bordered input-primary w-full max-w-md rounded-md"
			required />
	</label>

	<label class="input-label gap-8">
		<span class="pt-3">Description:</span>
		<input
			bind:value={itemdesc}
			type="text"
			class="input input-bordered input-primary w-full max-w-md rounded-md"
			required />
	</label>

	<label class="input-label gap-8">
		<span class="pt-3">Price:</span>
		<input
			bind:value={price}
			type="number"
			class="input input-bordered input-primary w-full max-w-md rounded-md"
			required />
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
		<h3>{type}</h3>

		{#each creations as { Name, ItemId, Description }}
			<Createditems itemname={Name} itemid={ItemId} />
		{/each}
	</div>
</div>
