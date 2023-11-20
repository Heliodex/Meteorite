<script lang="ts">
	import { Avatar } from "@skeletonlabs/skeleton"

	export let userid: string
	export let username: string
	export let friendRequest = false
	export let jwt = ""
	export let refresh = async () => {}

	async function ignore() {
		const result = await fetch("/api/friends/decline-friend-request", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				recipientUserId: userid.toString(),
			}),
		})
		const requestresult = await result.json()
		console.log(requestresult)
		refresh()
	}

	async function accept() {
		const result = await fetch("/api/friends/request-friendship", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				recipientUserId: userid.toString(),
			}),
		})
		const requestresult = await result.json()
		console.log(requestresult)
		refresh()
	}
</script>

<div
	class="card rounded-md card-glass-surface snap-center card-hover group w-full lg:w-96 relative p-2">
	<a class="unstyled" href="/users/{userid}">
		<div class="flex flex-row gap-4">
			<Avatar width="w-32" src="/api/thumbnailrender/?id={userid}#" />
			<h5 class="truncate w-96">{username}</h5>
		</div>
	</a>
	{#if friendRequest === true}
		<div class="flex flex-row gap-4 justify-around p-4">
			<button
				on:click={ignore}
				type="submit"
				class="btn variant-filled-primary btn-base rounded-md w-full">
				Ignore
			</button>

			<button
				on:click={accept}
				type="submit"
				class="btn variant-filled-primary btn-base rounded-md w-full">
				Accept
			</button>
		</div>
	{/if}
</div>
