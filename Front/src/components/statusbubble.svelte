<script lang="ts">
	import { onMount } from "svelte"

	export let size: string
	export let status = "Offline"
	export let userid = "0"
	export let gameid = "0"
	export let offline = false
	export let customclass = ""
	$: if (status === "Offline") {
		offline = true
	}
</script>

{#if status === "Offline"}
	<div
		class="{customclass} absolute bottom-2 right-5 w-{size} h-{size} bg-surface-300 rounded-full">
	</div>
{:else if status === "Online"}
	<div
		class="{customclass} absolute bottom-2 right-5 w-{size} h-{size} bg-blue-500 rounded-full">
	</div>
{:else if status.includes("Playing") === true}
	<a class="unstyled" href="http://mete0r.xyz/games/{gameid}">
		<div
			class="{customclass} absolute bottom-2 right-5 w-{size} h-{size} bg-green-500 rounded-full">
		</div>
	</a>
{/if}
