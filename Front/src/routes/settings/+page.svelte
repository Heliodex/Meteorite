<script lang="ts">
	import type { PageData } from "./$types"
	import { RadioGroup, RadioItem } from "@skeletonlabs/skeleton"
	import { writable, type Writable } from "svelte/store"
	import { Modal, modalStore } from "@skeletonlabs/skeleton"
	import type { ModalSettings, ModalComponent } from "@skeletonlabs/skeleton"
	import changePasswordModal from "../../components/settingsmodals/changepassword.svelte"
	import _2faModal from "../../components/settingsmodals/_2fa.svelte"
	import { SlideToggle } from "@skeletonlabs/skeleton"
	import { page } from "$app/stores"
	import { coinstore } from "$lib/coinstore"
	import { toastStore } from "@skeletonlabs/skeleton"
	import type { ToastSettings } from "@skeletonlabs/skeleton"
	let error = $page.url.searchParams.get("error")

	let settingfilter: string
	settingfilter = "info"
	let _2faenabled = false
	let bio: string
	let customcss: string
	let message = { error: false, message: "" }

	export let data: PageData

	customcss = data.user?.css ?? ""

	const jwt = data.jwt

	const t: ToastSettings = {
		message: "resp",
		// Optional: Presets for primary | secondary | tertiary | warning
		preset: "primary",
		// Optional: The auto-hide settings
		autohide: true,
		timeout: 2000,
	}

	if (data.user._2faenabled === true) {
		_2faenabled = true
	}

	async function passwordchange() {
		const modalComponent: ModalComponent = {
			// Pass a reference to your custom component
			ref: changePasswordModal,
			props: { jwt: data.jwt },
		}
		const d: ModalSettings = {
			type: "component",
			// NOTE: title, body, response, etc are supported!
			component: modalComponent,
		}
		modalStore.trigger(d)
	}
	async function attempt2fa() {
		const _2faresp = await fetch("/settings/2fa", {
			headers: {
				Authorization: data.jwt,
			},
		})
		const _2fajson = await _2faresp.json()
		if (!_2fajson.error) {
			console.log(_2fajson)
			const modalComponent: ModalComponent = {
				// Pass a reference to your custom component
				ref: _2faModal,
				props: { jwt: data.jwt, qrcode: _2fajson.qrcode },
			}
			const d: ModalSettings = {
				type: "component",
				// NOTE: title, body, response, etc are supported!
				component: modalComponent,
			}
			modalStore.trigger(d)
		}
	}
	$: if (_2faenabled === false && data.user._2faenabled === true) {
		// cant djisable 2fa mfs LOL
		_2faenabled = true
	}
	$: if (_2faenabled === true && data.user._2faenabled === false) {
		// if they are trying to enable 2fa for the first time
		_2faenabled = false
		attempt2fa()
	}

	async function biochange() {
		const biochangeresp = await fetch("/settings/setbio", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				bio: bio,
			}),
		})
		const biochangejson = await biochangeresp.json()
		if (biochangejson.error) {
			message.message = biochangejson.error
			message.error = true
		} else {
			message.message = biochangejson.message
			message.error = false
		}
	}

	async function csschange() {
		const csschangeresponse = await fetch("/settings/changecss", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
			body: JSON.stringify({
				customcss,
			}),
		})
		const csschange = await csschangeresponse.json()

		if (csschange.error) {
			message.message = csschange.error
			message.error = true
		} else {
			message.message = csschange.message
			message.error = false
		}
	}

	async function buyclassic() {
		const buyresp = await fetch("/api/updateusermembership/buymembership", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: jwt,
			},
		})
		const buyjson = await buyresp.json()

		t.message = buyjson.error ?? buyjson.message

		if (buyjson.error) {
			t.preset = "error"
		} else {
			t.preset = "primary"
			coinstore.update(n => n - 200)
		}
		toastStore.trigger(t)
	}
</script>

<div
	class="bg-surface-700 p-4 flex flex-row flex-wrap space-x-2 space-y-4 relative max-w-[970px] m-0 m-auto">
	<h2 class="font-bold w-full">My Settings</h2>

	<div class="flex flex-row sm:flex-col sm:space-y-4">
		<button
			on:click={() => {
				settingfilter = "info"
			}}
			class="btn rounded-none btn-base {settingfilter === 'info'
				? 'border-l-2'
				: ''}">
			Account Info
		</button>
		<button
			on:click={() => {
				settingfilter = "security"
			}}
			class="btn rounded-none btn-base {settingfilter === 'security'
				? 'border-l-2'
				: ''}">
			Security
		</button>
		<button
			on:click={() => {
				settingfilter = "bc"
			}}
			class="btn rounded-none btn-base {settingfilter === 'bc'
				? 'border-l-2'
				: ''}">
			Builders Club
		</button>
	</div>

	{#if settingfilter === "info"}
		<div class="grow">
			<h4>Account Info</h4>

			<div class="flex flex-row justify-between">
				<div class="flex flex-row space-x-2 grow">
					<h5 class="text-tertiary-600 text-base">Username:</h5>
					<h5 class="text-base">{data.user.username}</h5>
				</div>

				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="feather feather-edit shrink">
					<path
						d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7">
					</path>
					<path
						d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z">
					</path>
				</svg>
			</div>

			<div class="flex flex-row justify-between">
				<div class="flex flex-row space-x-2 grow">
					<h5 class="text-tertiary-600 text-base">Password:</h5>
					<h5 class="text-base">*******</h5>
				</div>

				<svg
					on:click={passwordchange}
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="feather feather-edit shrink">
					<path
						d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7">
					</path>
					<path
						d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z">
					</path>
				</svg>
			</div>

			<div class="flex flex-row justify-between">
				<div class="flex flex-row space-x-2 grow">
					<h5 class="text-tertiary-600 text-base">Discord:</h5>
					{#if error === "alreadyused"}
						<h5 class="text-base">
							{"Error: This discord account has already been linked!"}
						</h5>
					{:else if error === "toonew"}
						<h5 class="text-base">
							{"Error: This discord account is too new! (4weeks)"}
						</h5>
					{/if}
					<h5 class="text-base">
						{data.user?.discordid ?? "Not Linked"}
					</h5>
				</div>
				{#if !data.user.discordid}
					<a
						class="unstyled"
						href="https://discord.com/api/oauth2/authorize?client_id=1008206768989544449&redirect_uri=http%3A%2F%2Fmete0r.xyz%2Fsettings%2Fauthenticate&response_type=code&scope=identify">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="feather feather-edit shrink">
							<path
								d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7">
							</path>
							<path
								d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z">
							</path>
						</svg>
					</a>
				{/if}
			</div>

			<div class="w-full flex flex-row gap-2">
				<h5 class="text-tertiary-600 text-base">Bio:</h5>
				<input
					bind:value={bio}
					type="text"
					placeholder={data.user?.bio ?? "Bio"}
					maxlength="100"
					class="input input-bordered input-primary rounded-md grow"
					required />

				<button
					on:click={biochange}
					class="btn variant-filled-primary rounded-md h-12 btn-sm">
					Change
				</button>
			</div>

			<div class="w-full flex flex-row gap-2">
				<h5 class="text-tertiary-600 text-base w-16">
					Custom Profile CSS:
				</h5>
				<textarea
					bind:value={customcss}
					maxlength={5000}
					placeholder={"Custom CSS"}
					class="input h-64 input-bordered input-primary rounded-md grow"
					required>
				</textarea>

				<button
					on:click={csschange}
					class="btn variant-filled-primary rounded-md h-12 btn-sm">
					Apply
				</button>
			</div>
			<h5 class="text-tertiary-600 text-base">
				If you wish to use Images. Prepend your image url with
				https://wsrv.nl/?url=
			</h5>

			<h5
				class="!text-xs mt-6 {message.error === true
					? 'text-error-600'
					: 'text-success-600'}">
				{message.message ?? ""}
			</h5>
		</div>
	{/if}

	{#if settingfilter === "security"}
		<div class="grow">
			<h4>2 Step Verification</h4>

			<div class="flex flex-row justify-between">
				<div class="flex flex-row space-x-2 grow">
					<h5 class="text-tertiary-600 text-base">
						Authenticator App (Very Secure)
					</h5>
				</div>

				<SlideToggle active="bg-success-600" bind:checked={_2faenabled}
				></SlideToggle>
			</div>
		</div>
	{/if}

	{#if settingfilter === "bc"}
		<div class="grow space-y-2">
			<h4>Builders Club</h4>

			<div class="flex flex-row justify-around">
				<div class="flex flex-col space-y-4 w-24">
					<h3 class="text-center">Classic</h3>
					<img
						alt="Classic"
						src="/assets/images/buildersclub/classic.png" />
					<button
						on:click={buyclassic}
						class="btn variant-filled-primary rounded-md h-12 btn-sm">
						200 Rocks
					</button>
				</div>

				<div class="flex flex-col space-y-4 w-24">
					<h3 class="text-center">Turbo</h3>
					<img
						alt="Classic"
						src="/assets/images/buildersclub/turbo.png" />
					<a
						href="https://discord.gg/5r6ZjG57kU"
						class="btn variant-filled-primary rounded-md h-12 btn-sm">
						Boost
					</a>
				</div>

				<div class="flex flex-col space-y-4 w-24">
					<h3 class="text-center">Outrageous</h3>
					<img
						alt="Classic"
						src="/assets/images/buildersclub/outrageous.png" />
					<a
						href="https://ko-fi.com/meteoriterevival"
						class="btn variant-filled-primary rounded-md h-12 btn-sm">
						Donate
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>

{#if settingfilter === "bc"}
	<div
		class="bg-surface-700 p-4 flex flex-col gap-y-2 relative max-w-[970px] m-0 m-auto sm:pl-40">
		<h4 class="font-bold">How does Builders Club work?</h4>

		<h5 class="!text-sm text-blue-300">
			Classic - Obtain with 200 rocks a lifetime purchase.
		</h5>

		<div class="list-disc pl-4">
			<li class="!text-sm">Increases your daily stipend to 60 rocks.</li>
		</div>

		<h5 class="!text-sm text-orange-300">
			Turbo - Obtain by boosting the discord server.
		</h5>

		<div class="list-disc pl-4">
			<li class="!text-sm">Increases your daily stipend to 90 rocks.</li>
		</div>

		<h5 class="!text-sm text-red-400">
			Outrageous - Obtain by donating <a
				href="https://ko-fi.com/meteoriterevival">
				here.
			</a>
		</h5>

		<div class="list-disc pl-4">
			<li class="!text-sm">Increases your daily stipend to 150 rocks.</li>
		</div>
	</div>
{/if}
