<script lang="ts">
	import { TabGroup, Tab } from "@skeletonlabs/skeleton"
	import Lookup from "../../components/admin/lookup.svelte"
	import Lookupdone from "../../components/admin/lookupdone.svelte"
	import Assetqueue from "../../components/admin/assetqueue.svelte"
	import Logs from "../../components/admin/logs.svelte"
	import Config from "../../components/admin/config.svelte"

	let lookupdata: any
	let storeTab = "lookup"

	export let data
</script>

<div
	class="gap-2 bg-surface-800 p-4 max-w-[1300px] m-0 m-auto flex flex-row flex-wrap">
	<h2 class="w-full">Admin Panel</h2>
	<div class="flex flex-row grow">
		<TabGroup
			justify="flex flex-col w-32"
			borderWidth="border-l-2"
			rounded="">
			<h5>People</h5>
			<h5 class="absolute right-[80rem] opacity-[0.005]">
				{data.user.username}
			</h5>
			<div class="pl-2">
				<Tab bind:group={storeTab} value="lookup">Lookup Users</Tab>
			</div>

			<div class="pl-2">
				<Tab bind:group={storeTab} value="queue">Asset Queue</Tab>
			</div>

			<div class="pl-2">
				<Tab bind:group={storeTab} value="logs">Logs</Tab>
			</div>

			<div class="pl-2">
				<Tab bind:group={storeTab} value="config">Config</Tab>
			</div>

			<h5>Forums</h5>

			<h5>Website</h5>

			<div class="pl-2">
				<Tab bind:group={storeTab} value="banner">Set Banner</Tab>
			</div>
		</TabGroup>
		{#if storeTab === "lookup"}
			<div
				class="flex flex-row flex-wrap p-4 space-y-4 divide-y-2 divide-primary-500">
				{#if !lookupdata}
					<Lookup bind:data={lookupdata} jwt={data.jwt} />
				{/if}

				{#if lookupdata}
					<Lookupdone jwt={data.jwt} bind:lookupdata />
				{/if}
			</div>
		{/if}

		{#if storeTab === "queue"}
			<Assetqueue jwt={data.jwt} />
		{/if}

		{#if storeTab === "logs"}
			<Logs jwt={data.jwt} />
		{/if}

		{#if storeTab === "config"}
			<Config jwt={data.jwt} />
		{/if}
	</div>
</div>
