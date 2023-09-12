<script lang="ts">
	import { Avatar } from "@skeletonlabs/skeleton"

	export let lookupdata: any
	export let jwt: string
	let lookupaction = "Banned"
	let banreason: string
	let expirationdate: string
	let disabled = false
	let message = { error: false, message: "" }

	$: if (!banreason || banreason === "") {
		disabled = true
		message.message = "Enter ban reason"
		message.error = true
	} else if (!expirationdate && lookupaction === "Banned") {
		disabled = true
		message.message = "Date required"
		message.error = true
	} else {
		disabled = false
		message.message = ""
		message.error = false
	}

	async function submitaction() {
		const response = await fetch("admin/moderateuser", {
			method: "POST",
			body: JSON.stringify({
				userid: lookupdata.userid,
				reason: banreason,
				unbantime: expirationdate ?? "0",
				Type: lookupaction,
			}),
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
		})
		const json = await response.json()
		if (!json.error) {
			message.message = json.message
			message.error = false
		} else {
			message.message = json.error
			message.error = true
		}
	}
</script>

<div class="w-full flex flex-row gap-6">
	<div>
		<h5>Action:</h5>

		<label>
			<input type="radio" bind:group={lookupaction} value="Banned" />
			Ban
		</label>

		<label>
			<input
				type="radio"
				bind:group={lookupaction}
				value="Permanent Ban" />
			Permanent Ban
		</label>

		<label>
			<input type="radio" bind:group={lookupaction} value="Warning" />
			Warning
		</label>

		{#if lookupaction === "Banned"}
			<input bind:value={expirationdate} type="date" />
		{/if}
	</div>

	<div class="flex flex-col gap-y-1">
		<h5>Auto Fill:</h5>
		<button
			type="submit"
			on:click={() => {
				banreason = "real"
			}}
			class="btn variant-filled-primary btn-sm w-full rounded-md">
			Exploiting
		</button>
		<button
			type="submit"
			on:click={() => {
				banreason =
					"Adult content is not allowed on Meteorite. You are not allowed to create new accounts."
			}}
			class="btn variant-filled-primary btn-sm w-full rounded-md">
			NSFW
		</button>
	</div>

	<div class="grow space-y-2">
		<h5>Moderator Note:</h5>
		<textarea
			bind:value={banreason}
			class="input input-bordered input-primary w-full rounded-md h-32" />
		<div
			class="!text-xs mt-6 {message.error === true
				? 'text-error-600'
				: 'text-success-600'}">
			{message.message ?? ""}
		</div>
		<div class="flex flex-row justify-around gap-4">
			<button
				type="submit"
				on:click={submitaction}
				class="btn variant-filled-primary btn-base grow rounded-md"
				{disabled}>
				Submit
			</button>
			<button
				type="submit"
				on:click={() => {
					lookupdata = null
				}}
				class="btn variant-filled-primary btn-base rounded-md">
				Close
			</button>
		</div>
	</div>
</div>

<div class="flex flex-row justify-around w-full border-none gap-8">
	<div
		class="w-96 flex flex-wrap flex-row bg-surface-700 rounded-md p-4 border-none divide-y">
		<div class="flex flex-row w-full">
			<h5 class="font-bold grow">{lookupdata.username}</h5>
		</div>

		<div class="flex flex-row w-full grow">
			<a class="unstyled" href="/users/{lookupdata.userid}">
				<Avatar
					src="/api/thumbnailrender/?id={lookupdata.userid}"
					background=""
					width="w-32" />
			</a>

			<div>
				{#if JSON.parse(lookupdata.moderation).status.toUpperCase() != "OK"}
					<h5 class="!text-sm flex flex-row gap-1">
						Moderation Status: <h5 class="!text-sm text-error-600">
							{JSON.parse(lookupdata.moderation).status}
						</h5>
					</h5>
				{:else}
					<h5 class="!text-sm flex flex-row gap-1">
						Moderation Status: <h5
							class="!text-sm text-success-600">
							{JSON.parse(lookupdata.moderation).status}
						</h5>
					</h5>
				{/if}
				<h5 class="!text-sm">Rocks: {lookupdata.coins}</h5>
				<h5 class="!text-sm">
					Discord ID: {lookupdata.discordid ?? "Not Linked"}
				</h5>
				<a><h5 class="!text-sm">View Screenshots</h5></a>
				<a><h5 class="!text-sm">View Identity</h5></a>
			</div>
		</div>
	</div>
	<div class="table-container rounded-none h-52">
		<h5>Moderation History</h5>
		<table class="table table-hover">
			<thead>
				<tr>
					<th>Type</th>
					<th>Reason</th>
					<th>BannedBy</th>
					<th>Date</th>
				</tr>
			</thead>
			<tbody>
				{#if lookupdata.moderationhistory}
					{#each lookupdata.moderationhistory as { status, Reason, BannedBy, Date }}
						<tr>
							<td>{status}</td>
							<td
								style="white-space: nowrap; text-overflow:ellipsis; overflow: hidden; max-width:1px;">
								{Reason}
							</td>
							<td>{BannedBy}</td>
							<td>{Date}</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
