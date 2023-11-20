<script lang="ts">
	import { goto } from "$app/navigation"

	export let data

	const jwt = data.jwt

	let disabled = false
	let message = { error: false, message: "" }

	let name: string

	let price: number

	let description: string

	async function save() {
		const save = await fetch(
			`/api/catalog/iteminfo/${data.item.ItemId}/configure`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: jwt,
				},
				body: JSON.stringify({
					name,
					description,
					price,
				}),
			}
		)
		const saveJson = await save.json()
		if (!saveJson.error) {
			message.message = "Done!"
			message.error = false
			goto("/catalog/" + data.item.ItemId)
		} else {
			message.message = saveJson.error
			message.error = true
		}
	}

	$: if (!name && !description && !price && price !== 0) {
		disabled = true
		message.error = true
		message.message = "Change required"
	} else {
		disabled = false
		message.message = ""
	}
</script>

<svelte:head>
	<title>Meteorite - {data.item.Name} Configure</title>
</svelte:head>

<div
	class="bg-surface-700 p-4 space-x-2 flex flex-row flex-wrap sm:flex-nowrap max-w-[1100px] m-0 m-auto">
	<div class="sm:border sm:p-12 sm:w-[418px] relative">
		<img
			class="m-auto border sm:border-0 object-cover"
			alt={data.item.Name}
			src="/api/thumbnailrender/asset/?id={data.item.ItemId}" />
	</div>

	<div class="text-center sm:text-left ml-auto grow">
		<h2>{data.item.Name} - Configure</h2>

		<div class="space-y-4 w-full">
			<h5 class="">Edit Asset</h5>

			<label class="label">
				<span>Name</span>
				<input
					type="text"
					bind:value={name}
					class="input input-bordered input-primary w-full rounded-md" />
			</label>

			<label class="label">
				<span>Price</span>
				<input
					type="number"
					bind:value={price}
					min="0"
					step="1"
					class="input input-bordered input-primary w-full rounded-md" />
			</label>

			<label class="label">
				<span>Description</span>
				<textarea
					bind:value={description}
					class="input input-bordered input-primary w-full rounded-md" />
			</label>

			<div
				class="!text-xs mt-6 {message.error === true
					? 'text-error-600'
					: 'text-success-600'}">
				{message.message ?? ""}
			</div>

			<button
				on:click={save}
				type="submit"
				class="btn variant-filled-primary btn-sm w-full text-base rounded-md"
				{disabled}>
				Save
			</button>
		</div>
	</div>
</div>
