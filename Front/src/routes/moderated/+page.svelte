<script lang="ts">
    import type { PageData } from "./$types";



        export let data: PageData;

</script>

<div class="bg-surface-700 max-w-[800px] p-6 border-2 border-primary-500 m-0 m-auto">

    <h2>{data.user.moderationstatus.status}</h2>

    <div class="p-4 space-y-4">

    <h5 class="text-base">Our content monitors have determined your behavior on Meteorite is in violation of our Terms of Service.</h5>

    <h5 class="text-base flex flex-row gap-2">Moderator Note: <h5 class="text-base font-bold">{data.user.moderationstatus.Reason}</h5></h5>
    {#if data.user.moderationstatus.ExpiresIn ===  "2100-01-01"}
    <h5 class="text-base">You may reactivate after never.</h5>
    {:else if data.user.moderationstatus.ExpiresIn ===  "2000-01-01"}
    <h5 class="text-base">This expires after you refresh.</h5>
    {:else}
    <h5 class="text-base">You may reactivate after {data.user.moderationstatus.ExpiresIn}.</h5>
    {/if}
</div>

</div>

