<script lang="ts">
	import { toastStore } from "@skeletonlabs/skeleton"
	import type { ToastSettings } from "@skeletonlabs/skeleton"
	import HCaptcha from "svelte-hcaptcha"
	import { Noir } from "@skeletonlabs/skeleton"
	import { modalStore } from "@skeletonlabs/skeleton"
	import type { ModalSettings, ModalComponent } from "@skeletonlabs/skeleton"
	import _2famodal from "$lib/components/login/2famodal.svelte"

	let current = "login"
	let username: string
	let password: string
	let _2fa: number
	let captcha: any
	const t: ToastSettings = {
		message: "resp",
		// Optional: Presets for primary | secondary | tertiary | warning
		preset: "error",
		// Optional: The auto-hide settings
		autohide: true,
		timeout: 2000,
	}
	function handleSuccess(token: any) {
		captcha = token.detail.token
	}

	async function login() {
		if (username && password) {
			const loginresp = await fetch("/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify({
					username,
					password,
					_2fa,
				}),
			})
			const login = await loginresp.json()
			if (!login.error) {
				t.preset = "success"
				t.message = "Logged in!"
				toastStore.trigger(t)
				document.location = "/home"
			} else if (
				login?.error === "2FA Enabled on account but 2fa not sent"
			) {
				const modalComponent: ModalComponent = {
					// Pass a reference to your custom component
					ref: _2famodal,
					// Add your props as key/value pairs
					// Provide default slot content as a template literal
					slot: "<p>Skeleton</p>",
					props: { username, password },
				}
				const _2faprompt: ModalSettings = {
					type: "component",
					// NOTE: title, body, response, etc are supported!,
					component: modalComponent,
				}

				modalStore.trigger(_2faprompt)
			} else {
				t.message = login.error
				toastStore.trigger(t)
			}
		}
	}
	async function signup() {
		if (username && password) {
			const signupresp = await fetch("register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					username,
					password,
					captcha,
				}),
			})
			const login = await signupresp.json()
			if (!login.error) {
				t.preset = "success"
				t.message = "Signed up!"
				current = "login"
				toastStore.trigger(t)
			} else {
				t.message = login.error
				toastStore.trigger(t)
			}
		}
	}
	let scroll: number
</script>

<Noir />

<div class="grid auto-rows-max gap-4 grid-cols-1 xl:grid-cols-2 pt-24">
	<img
		src="/assets/images/logo600200.png"
		alt="meteorite!"
		class="max-w-full w-3/6 justify-self-center xl:justify-self-end xl:pt-20" />

	<div
		class="flex flex-col justify-center items-center space-y-5 needs-validation card rounded-md w-96 h-[28rem] max-w-full justify-self-center xl:justify-self-start"
		novalidate
		id="form"
		action="/login"
		method="post">
		{#if current === "signup"}
			<h3 class="font-bold">Sign up!</h3>

			<input
				type="text"
				bind:value={username}
				placeholder="Username"
				class="input input-bordered input-primary w-full max-w-xs rounded-md"
				name="username"
				id="username"
				aria-describedby="usernamehelp"
				required />

			<input
				type="password"
				bind:value={password}
				placeholder="Password"
				class="input input-bordered input-primary w-full max-w-xs rounded-md"
				name="pass"
				id="password"
				required />

			<HCaptcha
				sitekey="30f6dee1-f765-42d0-ae34-29697c4aa623"
				,
				theme={"dark"}
				on:success={handleSuccess} />

			<h5 class="!text-xs w-full max-w-xs">
				By clicking Sign Up, you are agreeing to the <a
					href="/legal/terms"
					class="!text-xs">
					Terms of Use
				</a>
				including the arbitration clause and you are acknowledging the
				<a href="/legal/privacy" class="!text-xs">Privacy Policy</a>
			</h5>

			<div>
				<button
					type="submit"
					on:click={signup}
					class="btn variant-filled-primary btn-base w-80 rounded-md">
					Sign Up
				</button>
			</div>
			<button
				on:click={() => (current = "login")}
				class="!text-sm flex flex-row">
				Already have an account? <h5
					class="!text-sm pl-2 text-primary-500">
					Sign In
				</h5>
			</button>
		{:else}
			<h3 class="font-bold">Login</h3>
			<input
				type="text"
				bind:value={username}
				placeholder="Username"
				class="input input-bordered input-primary w-full max-w-xs rounded-md"
				required />
			<input
				type="password"
				bind:value={password}
				placeholder="Password"
				class="input input-bordered input-primary w-full max-w-xs rounded-md"
				required />
			<h5 class="!text-xs w-full max-w-xs">
				By clicking Login, you are agreeing to the <a
					href="/legal/terms"
					class="!text-xs">
					Terms of Use
				</a>
				including the arbitration clause and you are acknowledging the
				<a href="/legal/privacy" class="!text-xs">Privacy Policy</a>
			</h5>
			<div>
				<button
					type="submit"
					on:click={login}
					class="btn variant-filled-primary btn-base w-80 rounded-md">
					Login
				</button>
			</div>
			<button
				on:click={() => (current = "signup")}
				class="!text-sm flex flex-row">
				Don't have an account? <h5
					class="!text-sm pl-2 text-primary-500">
					Sign Up
				</h5>
			</button>
		{/if}
	</div>
</div>
<svelte:window
	bind:scrollY={scroll}
	on:wheel={() => {
		scroll += 1
	}} />
