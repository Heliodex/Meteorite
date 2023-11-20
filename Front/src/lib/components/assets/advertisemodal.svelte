<script lang="ts">
	let message = { error: false, message: "" }
	let disabled = false
	let AdId = ""

	export let jwt: string
	export let itemid: string
	export let type: string

	async function advertise() {
		const result = await fetch("/api/advertise", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				itemid,
				AdId,
				type,
			}),
		})
		const advertiseresult = await result.json()
		if (!advertiseresult.error) {
			message.message = advertiseresult.message
			message.error = false
		} else {
			message.message = advertiseresult.error
			message.error = true
		}
	}

	$: if (!AdId) {
		disabled = true
		message.message = "Ad ID not inputted"
		message.error = true
	} else {
		disabled = false
		message.message = ""
		message.error = false
	}
</script>

<h5>Advertise</h5>

<div class="p-2 space-y-2">
	<label class="label">
		<span>Ad ID</span>
		<input
			type="number"
			bind:value={AdId}
			class="input input-bordered input-primary w-full rounded-md"
			required />
	</label>

	<div>
		<h5
			class="!text-xs mt-6 {message.error === true
				? 'text-error-600'
				: 'text-success-600'}">
			{message.message ?? ""}
		</h5>
		<button
			on:click={advertise}
			class="btn variant-filled-primary btn-base w-full rounded-md"
			{disabled}>
			Advertise for 10 Rocks (For 24 hours)
		</button>
	</div>
</div>
