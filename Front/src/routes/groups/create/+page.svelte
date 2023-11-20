<script lang="ts">
	import { goto } from "$app/navigation"

	let groupname: string
	let groupdescription: string
	let files: FileList
	let publicgroup = true
	let disabled = true

	import Rocks from "$lib/components/rocks.svelte"

	export let data
	let jwt = data.jwt

	$: if (groupname && files && data.user.coins >= 100) {
		disabled = false
	} else {
		disabled = true
	}

	const toBase64 = (file: Blob) =>
		new Promise((resolve, reject) => {
			const reader = new FileReader()
			reader.readAsDataURL(file)
			reader.onload = () => resolve(reader.result)
			reader.onerror = error => reject(error)
		})

	async function create() {
		const formData = new FormData()
		formData.append("groupicon", files[0])
		formData.append("groupname", groupname)
		formData.append("description", groupdescription ?? "...")
		formData.append("publicgroup", publicgroup.toString())

		const req = await fetch("/api/groups/create", {
			method: "post",
			body: formData,
			headers: {
				Authorization: jwt,
			},
		})

		const res = await req.json()

		if (!res.error) {
			goto("/groups")
		} else {
		}
	}
	let base64: any
	async function conv() {
		base64 = await toBase64(files[0])
	}
	$: if (files) {
		conv()
	}
</script>

<div class="max-w-[1200px] m-0 m-auto">
	<div class="flex flex-col gap-y-2">
		<h2 class="font-bold">Create a Group</h2>

		<label>
			<span class="block text-sm">Group Name</span>
			<input
				bind:value={groupname}
				maxlength={20}
				type="text"
				class="input input-bordered input-primary w-full rounded-md"
				placeholder="Name of group"
				required />
		</label>

		<label>
			<span class="block text-sm">Group Description</span>
			<textarea
				bind:value={groupdescription}
				maxlength={500}
				class="input input-bordered input-primary w-full h-64 rounded-md"
				placeholder="Description"
				required />
		</label>

		<label>
			<span class="block text-sm">Icon</span>
			<input class="w-full" accept="image/png" bind:files type="file" />
			{#if base64}
				<img alt="" class="w-32 aspect-square" src={base64} />
			{/if}
		</label>

		<h4 class="font-bold">Settings</h4>

		<div class="space-y-4 w-full bg-surface-700 rounded-md p-4">
			<label class="flex items-center space-x-2">
				<input
					bind:group={publicgroup}
					class="radio"
					type="radio"
					checked
					name="radio-setting"
					value={true} />
				<p>Anyone can join</p>
			</label>

			<label class="flex items-center space-x-2">
				<input
					bind:group={publicgroup}
					class="radio"
					type="radio"
					name="radio-setting"
					value={false} />
				<p>Manual Approval</p>
			</label>
		</div>

		<div class="flex flex-row gap-2 justify-end">
			<a
				href="/groups"
				class="btn variant-ringed-surface rounded-md btn-sm">
				Cancel
			</a>
			<button
				class="btn variant-filled-primary rounded-md btn-sm"
				{disabled}
				on:click={create}>
				<Rocks width="w-4" />
				100
			</button>
		</div>
	</div>
</div>
