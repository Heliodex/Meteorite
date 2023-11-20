<script lang="ts">
	import Groupbar from "$lib/components/groups/groupbar.svelte"

	export let data
</script>

<div class="sm:flex sm:flex-row gap-2 max-w-[1400px] m-0 m-auto">
	{#if data.groups}
		<Groupbar grouplist={data.groups} />
	{/if}

	<div class="col-span-5" />
</div>
