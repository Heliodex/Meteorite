<script lang="ts">
	import { page } from "$app/stores"
</script>

<div class="flex h-screen space-y-2">
	<div class="m-auto w-96 text-center bg-surface-700 p-4">
		<h1 class="font-bold text-7xl">{$page.status} :(</h1>
		<h5 class="">Oops!</h5>
		<h5 class="text-xl font-bold">{$page?.error?.message}</h5>
		<button
			on:click={() => {
				history.back()
			}}
			class="btn variant-filled-primary rounded-md w-full btn-lg">
			Go Back!
		</button>
	</div>
</div>
