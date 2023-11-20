<script lang="ts">
	import { SlideToggle } from "@skeletonlabs/skeleton"

	let regEnabled = false
	let mainEnabled = false
	let gameEnabled = false
	let keyEnabled = false
	let bannerMessage = ""

	export let jwt: string

	async function updateSliders() {
		const response = await fetch("admin/config", {
			method: "POST",
			headers: { "content-type": "application/json", Authorization: jwt },
		})
		const data = (await response.json()).data
		if (!data.error) {
			regEnabled = data.RegistrationEnabled
			mainEnabled = data.MaintenanceEnabled
			gameEnabled = data.GamesEnabled
			keyEnabled = data.KeysEnabled
			bannerMessage = data.bannermessage
		}
	}
	updateSliders()

	async function updateSetting(setting: String, update: boolean) {
		const response = await fetch("admin/config/update", {
			method: "POST",
			body: JSON.stringify({
				setting,
				update: update === true ? false : true,
			}),
			headers: { "content-type": "application/json", Authorization: jwt },
		})
		const data = (await response.json()).data
		if (!data.error) {
			regEnabled = data.RegistrationEnabled
			mainEnabled = data.MaintenanceEnabled
			gameEnabled = data.GamesEnabled
			keyEnabled = data.KeysEnabled
			bannerMessage = data.bannermessage
		}
	}
</script>

<div class="grow">
	<h2>Config</h2>

	<div class="flex flex-col gap-4 justify-between">
		<div class="flex flex-row space-x-2 grow">
			<h5 class="text-tertiary-600 text-base">Registration enabled</h5>
			<SlideToggle
				name=""
				active="bg-success-600"
				on:click={() => {
					updateSetting("RegistrationEnabled", regEnabled)
				}}
				bind:checked={regEnabled}></SlideToggle>
		</div>

		<div class="flex flex-row space-x-2 grow">
			<h5 class="text-tertiary-600 text-base">Maintenance enabled</h5>
			<SlideToggle
				name=""
				active="bg-success-600"
				on:click={() => {
					updateSetting("MaintenanceEnabled", mainEnabled)
				}}
				bind:checked={mainEnabled}></SlideToggle>
		</div>

		<div class="flex flex-row space-x-2 grow">
			<h5 class="text-tertiary-600 text-base">Games enabled</h5>
			<SlideToggle
				name=""
				active="bg-success-600"
				on:click={() => {
					updateSetting("GamesEnabled", gameEnabled)
				}}
				bind:checked={gameEnabled}></SlideToggle>
		</div>

		<div class="flex flex-row space-x-2 grow">
			<h5 class="text-tertiary-600 text-base">
				Keys enabled (Keys can't be generated normally)
			</h5>
			<SlideToggle
				name=""
				active="bg-success-600"
				on:click={() => {
					updateSetting("KeysEnabled", keyEnabled)
				}}
				bind:checked={keyEnabled}></SlideToggle>
		</div>

		<div class="flex flex-row space-x-2 grow">
			<h5 class="text-tertiary-600 text-base">
				Banner message (Not functional yet.)
			</h5>
			<input
				type="text"
				bind:value={bannerMessage}
				placeholder="..."
				class="input input-bordered input-primary w-full max-w-xs rounded-md"
				required />
		</div>
	</div>
</div>
