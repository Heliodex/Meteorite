<script lang="ts">
	import "@skeletonlabs/skeleton/themes/theme-crimson.css"
	import "@skeletonlabs/skeleton/styles/all.css"
	import "../app.postcss"
	import {
		AppShell,
		AppBar,
		Drawer,
		drawerStore,
		menu,
		Toast,
		AppRail,
		AppRailTile,
		Avatar,
	} from "@skeletonlabs/skeleton"
	import type { PageData } from "./$types"
	import { onMount } from "svelte"
	import Rocks from "../components/rocks.svelte"
	import { slide } from "svelte/transition"
	import { Modal } from "@skeletonlabs/skeleton"
	import { coinstore } from "$lib/coinstore"
	import { HomeIcon } from "svelte-feather-icons"
	import { PersonStandingIcon, Users2Icon } from "lucide-svelte"
	import Progressbar from "../components/progressbar.svelte"
	let coins: number
	let avatar: string
	import { avatarstore } from "$lib/avatarstore"
	avatarstore.subscribe(value => {
		avatar = value
	})

	coinstore.subscribe(value => {
		coins = value
	})
	export let data: PageData
	$: {
		coinstore.update(n => (n = data.user?.coins))
		avatarstore.update(
			n => (n = "/api/thumbnailrender/?id=" + data.user?.userid),
		)
	}
	let search: string
	let previousearch: string

	function p() {
		if (search != "") {
			previousearch = search
		}
	}

	$: search, p()

	function drawerOpen() {
		const settings = {
			// Provide your prop overrides
			position: "top",
			height: "h-44",
		}
		// @ts-ignore
		drawerStore.open(settings)
	}
	onMount(() => {
		function listenCookieChange(callback: any, interval = 1000) {
			let lastCookie = document.cookie
			setInterval(() => {
				let cookie = document.cookie
				if (cookie !== lastCookie) {
					try {
						callback({ oldValue: lastCookie, newValue: cookie })
					} finally {
						lastCookie = cookie
					}
				}
			}, interval)
		}
		listenCookieChange(async () => {
			function getCookie(name: any) {
				function escape(s: string) {
					return s.replace(/([.*+?\^$(){}|\[\]\/\\])/g, "\\$1")
				}
				var match = document.cookie.match(
					RegExp("(?:^|;\\s*)" + escape(name) + "=([^;]*)"),
				)
				return match ? match[1] : null
			}
			const jwt = getCookie("jwt")
			const res = await fetch("/api/auth", {
				credentials: "include",
				headers: { authorization: jwt as string },
			})
			const data = await res.json()
			if (data.error) {
				document.location = "/"
			}
		}, 1000)
	})
</script>

<svelte:head>
	<title>
		Meteorite - {(
			data?.url?.replace("/", "")?.[0]?.toUpperCase() +
			data?.url?.slice(2)
		)?.split("/")?.[0]}
	</title>
	<!-- Google tag (gtag.js) -->
	<!-- Google tag (gtag.js) -->
	<script
		async
		src="https://www.googletagmanager.com/gtag/js?id=G-Z3QGF9XQM4"></script>
	<script>
		window.dataLayer = window.dataLayer || []
		function gtag() {
			dataLayer.push(arguments)
		}
		gtag("js", new Date())

		gtag("config", "G-Z3QGF9XQM4")
	</script>
</svelte:head>

<!-- App Shell -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<Progressbar />
<AppShell
	slotSidebarLeft="!w-40 hidden sm:block"
	slotPageFooter="flex justify-center bg-transparent">
	<Drawer>
		<a href="/games">
			<div>
				<button class="btn btn-sm text-white">Games</button>
			</div>
		</a>
		<a href="/catalog">
			<div>
				<button class="btn btn-sm text-white">Catalog</button>
			</div>
		</a>
		<a href="/develop">
			<div>
				<button class="btn btn-sm text-white">Develop</button>
			</div>
		</a>
		<a href="/avatar">
			<div>
				<button class="btn btn-sm text-white">Avatar</button>
			</div>
		</a>
		<div class="relative">
			<input
				type="text"
				bind:value={search}
				on:click={() => {
					search = previousearch
				}}
				placeholder="Search"
				class="input input-bordered input-primary pr-8 w-full rounded-none"
				maxlength="50"
				required />
			{#if search}
				<svg
					on:click={() => {
						search = ""
					}}
					class="w-8 h-8 absolute inset-y-0 right-0 pt-2 pr-3"
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			{:else}
				<svg
					class="w-8 h-8 absolute inset-y-0 right-0 pt-2 pr-3 pointer-events-none"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z">
					</path>
				</svg>
			{/if}
		</div>
		{#if search}
			<nav
				class="list-nav bg-surface-700 rounded-md w-full absolute z-50">
				<ul>
					<li>
						<a
							href="/catalog/search/{search}"
							on:click={() => {
								search = ""
							}}>
							<span class="flex-auto truncate">
								Search "{search}" in Catalog
							</span>
						</a>
					</li>
				</ul>
				<ul>
					<li>
						<a
							href="/games/search/{search}"
							on:click={() => {
								search = ""
							}}>
							<span class="flex-auto truncate">
								Search "{search}" in Games
							</span>
						</a>
					</li>
				</ul>
				<ul>
					<li>
						<a
							href="/users/search/{search}"
							on:click={() => {
								search = ""
							}}>
							<span class="flex-auto truncate">
								Search "{search}" in Players
							</span>
						</a>
					</li>
				</ul>
				<ul>
					<li>
						<a
							href="/groups/search/{search}"
							on:click={() => {
								search = ""
							}}>
							<span class="flex-auto truncate">
								Search "{search}" in Groups
							</span>
						</a>
					</li>
				</ul>
			</nav>
		{/if}
	</Drawer>
	<Toast />
	<Modal width="w-full max-w-[500px]" />
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar padding="px" slotLead="space-x-2">
			<svelte:fragment slot="lead">
				<a href="/home">
					<img
						src="/assets/images/logo600200.png"
						alt="meteorite"
						class="max-h-12 pl-6 hidden xl:block" />
				</a>
				<svg
					class="w-6 h-6 md:hidden block"
					on:click={drawerOpen}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 6h16M4 12h16M4 18h16">
					</path>
				</svg>
				<a href="/home">
					<img
						src="/assets/images/logosmall.png"
						alt="meteorite"
						class="max-h-12 xl:hidden block" />
				</a>
				<div class="hidden md:block">
					<a
						class="btn btn-sm rounded-none group relative"
						href="/games">
						Games
						<div
							class="transition-width delay-0 absolute min-h-[1px] top-8 w-4 group-hover:w-16 group-hover:shadow-[inset_0_-2px_0_0_white]">
						</div>
					</a>
					{#if data.user?.admin === true}
						<a
							class="btn btn-sm rounded-none group relative"
							href="/admin">
							Admin
							<div
								class="transition-width delay-0 absolute min-h-[1px] top-8 w-4 group-hover:w-16 group-hover:shadow-[inset_0_-2px_0_0_white]">
							</div>
						</a>
					{/if}
					<a
						class="btn btn-sm rounded-none group relative"
						href="/catalog">
						Catalog
						<div
							class="transition-width delay-0 absolute min-h-[1px] top-8 w-4 group-hover:w-16 group-hover:shadow-[inset_0_-2px_0_0_white]">
						</div>
					</a>
					<a
						class="btn btn-sm rounded-none group relative"
						href="/develop">
						Develop
						<div
							class="transition-width delay-0 absolute min-h-[1px] top-8 w-4 group-hover:w-16 group-hover:shadow-[inset_0_-2px_0_0_white]">
						</div>
					</a>
				</div>
				<div class="relative hidden md:block">
					<input
						type="text"
						bind:value={search}
						on:dblclick={() => {
							search = previousearch
						}}
						placeholder="Search"
						class="input input-bordered input-primary pr-8 w-48 lg:w-96 max-w-full rounded-md"
						maxlength="50"
						required />
					<!-- refill on double click as well -->
					{#if search}
						<svg
							on:click={() => {
								search = ""
							}}
							class="w-8 h-8 absolute inset-y-0 right-0 pt-2 pr-3"
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round">
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					{:else}
						<svg
							class="w-8 h-8 absolute inset-y-0 right-0 pt-2 pr-3 pointer-events-none"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z">
							</path>
						</svg>
					{/if}
					{#if search}
						<nav
							class="list-nav bg-surface-700 rounded-md w-48 lg:w-96 max-w-full absolute z-50"
							transition:slide={{ duration: 100 }}>
							<ul>
								<li>
									<a
										href="/catalog/search/{search}"
										on:click={() => {
											search = ""
										}}>
										<span class="flex-auto truncate">
											Search "{search}" in Catalog
										</span>
									</a>
								</li>
							</ul>
							<ul>
								<li>
									<a
										href="/games/search/{search}"
										on:click={() => {
											search = ""
										}}>
										<span class="flex-auto truncate">
											Search "{search}" in Games
										</span>
									</a>
								</li>
							</ul>
							<ul>
								<li>
									<a
										href="/users/search/{search}"
										on:click={() => {
											search = ""
										}}>
										<span class="flex-auto truncate">
											Search "{search}" in Players
										</span>
									</a>
								</li>
							</ul>
							<ul>
								<li>
									<a
										href="/groups/search/{search}"
										on:click={() => {
											search = ""
										}}>
										<span class="flex-auto truncate">
											Search "{search}" in Groups
										</span>
									</a>
								</li>
							</ul>
						</nav>
					{/if}
				</div>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				{#if data.user}
					<Rocks />
					{coins ?? "0"}
					<span class="relative pr-2">
						<button
							class="w-6 pt-2"
							use:menu={{ menu: "navigation" }}>
							<svg
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z">
								</path>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
								</path>
							</svg>
						</button>
						<nav
							class="list-nav !rounded-md pb-2 pt-2 w-40 bg-surface-800"
							data-menu="navigation">
							<ul>
								<li>
									<a class="!rounded-none" href="/settings">
										Settings
									</a>
								</li>
								<li>
									<a class="!rounded-none" href="/logout">
										Logout
									</a>
								</li>
							</ul>
						</nav>
					</span>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />

	<svelte:fragment slot="sidebarLeft">
		<!-- Hidden below Tailwind's large breakpoint -->
		{#if data.user}
			<div
				id="sidebar-left"
				class="z-50 h-full bg-surface-800 flex flex-col space-y-3 md:block p-3">
				<a
					href="/users/{data.user.userid}"
					class="flex flex-row space-y-2 unstyled">
					<Avatar width="w-12" src={avatar + "&type=headshot"} />
					<h5 class="!text-sm font-semibold truncate w-40">
						{data.user.username}
					</h5>
				</a>

				<a
					class="unstyled flex flex-row group gap-x-1 pt-4"
					href="/home">
					<HomeIcon
						class="group-hover:stroke-white"
						strokeWidth={1.3}
						size="28" />
					<h5 class="font-semibold group-hover:text-white">Home</h5>
				</a>

				<a class="unstyled flex flex-row group gap-x-1" href="/avatar">
					<PersonStandingIcon
						class="group-hover:stroke-white"
						strokeWidth={1.5}
						size="28" />
					<h5 class="font-semibold group-hover:text-white">Avatar</h5>
				</a>

				<a
					class="unstyled relative flex flex-row group gap-x-1"
					href="/friends">
					<Users2Icon
						class="group-hover:stroke-white"
						strokeWidth={1.5}
						size="28" />
					<h5 class="font-semibold group-hover:text-white">
						Friends
					</h5>
					{#if data.user?.friendrequests?.length > 0}
						<div
							class="p-1 bg-primary-500 rounded-md !text-xs ml-auto my-auto">
							{data.user?.friendrequests?.length}
						</div>
					{/if}
				</a>

				<a class="unstyled flex flex-row group gap-x-1" href="/groups">
					<svg
						fill="none"
						width="28"
						height="28"
						stroke="currentColor"
						stroke-width="1.5"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						class="group-hover:stroke-white"
						aria-hidden="true">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z">
						</path>
					</svg>
					<h5 class="font-semibold group-hover:text-white">Groups</h5>
				</a>

				<a
					class="unstyled flex flex-row group gap-x-1"
					href="https://discord.gg/5r6ZjG57kU">
					<svg
						class="group-hover:stroke-white"
						width="28"
						height="28"
						viewBox="0 0 34 34">
						<g fill="currentColor">
							<path
								d="M26.0015 6.9529C24.0021 6.03845 21.8787 5.37198 19.6623 5C19.3833 5.48048 19.0733 6.13144 18.8563 6.64292C16.4989 6.30193 14.1585 6.30193 11.8336 6.64292C11.6166 6.13144 11.2911 5.48048 11.0276 5C8.79575 5.37198 6.67235 6.03845 4.6869 6.9529C0.672601 12.8736 -0.41235 18.6548 0.130124 24.3585C2.79599 26.2959 5.36889 27.4739 7.89682 28.2489C8.51679 27.4119 9.07477 26.5129 9.55525 25.5675C8.64079 25.2265 7.77283 24.808 6.93587 24.312C7.15286 24.1571 7.36986 23.9866 7.57135 23.8161C12.6241 26.1255 18.0969 26.1255 23.0876 23.8161C23.3046 23.9866 23.5061 24.1571 23.7231 24.312C22.8861 24.808 22.0182 25.2265 21.1037 25.5675C21.5842 26.5129 22.1422 27.4119 22.7621 28.2489C25.2885 27.4739 27.8769 26.2959 30.5288 24.3585C31.1952 17.7559 29.4733 12.0212 26.0015 6.9529ZM10.2527 20.8402C8.73376 20.8402 7.49382 19.4608 7.49382 17.7714C7.49382 16.082 8.70276 14.7025 10.2527 14.7025C11.7871 14.7025 13.0425 16.082 13.0115 17.7714C13.0115 19.4608 11.7871 20.8402 10.2527 20.8402ZM20.4373 20.8402C18.9183 20.8402 17.6768 19.4608 17.6768 17.7714C17.6768 16.082 18.8873 14.7025 20.4373 14.7025C21.9717 14.7025 23.2271 16.082 23.1961 17.7714C23.1961 19.4608 21.9872 20.8402 20.4373 20.8402Z">
							</path>
						</g>
					</svg>
					<h5 class="font-semibold group-hover:text-white">
						Discord
					</h5>
				</a>
			</div>
		{/if}
	</svelte:fragment>

	<svelte:fragment slot="pageFooter">
		<div class="text-center">
			<h5 class="!text-xs">Copyright © Meteorite 2023</h5>
			<a href="/legal/terms">Terms of Service</a>
			<a href="/legal/privacy">Privacy Policy</a>
		</div>
	</svelte:fragment>
</AppShell>
