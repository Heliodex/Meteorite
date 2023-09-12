<script lang="ts">
	import type { PageData } from "../$types"
	import Groupbar from "../../components/groups/groupbar.svelte"
	let selectedgroup = "Lambda Media Group"

	export let data: PageData
</script>

<div class="sm:flex sm:flex-row gap-2 max-w-[1400px] m-0 m-auto">
	{#if data.groups}
		<Groupbar {selectedgroup} grouplist={data.groups} />
	{/if}

	<div class="col-span-5"></div>
</div>
