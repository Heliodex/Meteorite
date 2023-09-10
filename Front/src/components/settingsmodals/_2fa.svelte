<script lang="ts">
	let _2facode: string
	let message = { error: false, message: "" }
	let disabled = false

	export let jwt: string
	export let qrcode: string

	$: if (!_2facode) {
		disabled = true
		message.message = "2FA code not inputted"
		message.error = true
	} else {
		disabled = false
		message.message = ""
		message.error = false
	}

	async function verify2fa() {
		const response = await fetch("/settings/verify2fa", {
			method: "POST",
			body: JSON.stringify({ code: _2facode }),
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
		})
		const json = await response.json()
		if (!json.error) {
			message.message = "2FA Enabled"
			message.error = false
			document.location = "/settings"
		} else {
			message.message = json.error
			message.error = true
		}
	}
</script>

<div class="space-y-2 flex flex-row flex-wrap justify-center">
	<h5 class="m-auto text-center w-full">Confirm 2FA</h5>

	<img alt={qrcode} class="w-64" src={qrcode} />

	<div class="space-y-4 w-full">
		<input
			type="text"
			bind:value={_2facode}
			placeholder="Input 2FA"
			class="input input-bordered input-primary w-full rounded-md"
			required />
		<h5
			class="!text-xs mt-6 {message.error === true
				? 'text-error-600'
				: 'text-success-600'}">
			{message.message ?? ""}
		</h5>
	</div>

	<button
		on:click={verify2fa}
		class="btn variant-filled-primary btn-base rounded-md"
		{disabled}>
		Confirm
	</button>
</div>
