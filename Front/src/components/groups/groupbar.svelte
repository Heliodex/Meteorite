<script lang="ts">
	import { Avatar } from "@skeletonlabs/skeleton"
	export let grouplist: any[] // ???
</script>

<div class="hidden sm:block">
	<div class="flex flex-col">
		<h2 class="font-bold">Groups</h2>

		{#if grouplist}
			{#each grouplist as { Name, groupid }}
				<a class="unstyled group" href="/groups/{groupid}">
					<div
						class="flex flex-row bg-surface-700 p-4 gap-2 shadow-[inset_4px_0_0_0_white]">
						<Avatar
							width="w-8"
							rounded="rounded-none"
							src="/assets/groupicons/icon-0.png" />
						<h5
							class="!text-xs truncate w-48 m-auto group-hover:text-white">
							{Name}
						</h5>
					</div>
				</a>
			{/each}
		{/if}

		<a
			href="/groups/create"
			class="btn variant-ringed-surface rounded-md w-full btn-sm">
			Create Group
		</a>
	</div>
</div>
