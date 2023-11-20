<script lang="ts">
	let disabled = false
	let message = { error: false, message: "" }

	let userid: any
	let username: any

	export let jwt: string
	export let data

	async function searchuser() {
		const response = await fetch("admin/moderateuserlookup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				userid: userid ?? "",
				username: username ?? "",
			}),
		})
		const responsejson = await response.json()
		if (!responsejson.error) {
			message.message = "woo"
			message.error = false
			data = responsejson.data
		} else {
			message.message = responsejson.error
			message.error = true
		}
	}
	$: if (!userid && !username) {
		disabled = true
		message.message = "Enter userid or username"
		message.error = true
	} else if (userid && username) {
		disabled = true
		message.message = "You can only search userid or username dummy"
		message.error = true
	} else {
		disabled = false
		message.message = ""
		message.error = false
	}
</script>

<div class="flex flex-wrap space-y-2">
	<input
		type="text"
		bind:value={userid}
		placeholder="UserID"
		class="input input-bordered input-primary w-full rounded-md" />
	<div class="w-full !text-xs">or</div>
	<input
		type="text"
		bind:value={username}
		placeholder="Username"
		class="input input-bordered input-primary w-full rounded-md" />
	<div
		class="!text-xs mt-6 {message.error === true
			? 'text-error-600'
			: 'text-success-600'}">
		{message.message ?? ""}
	</div>
	<button
		type="submit"
		on:click={searchuser}
		class="btn variant-filled-primary btn-sm w-full rounded-md"
		{disabled}>
		Search
	</button>
</div>
