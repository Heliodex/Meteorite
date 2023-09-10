<script lang="ts">
    import Usercard from '../../components/usercard.svelte';
    import type { PageData } from './$types';

    async function refresh(){
    const response = await fetch('/api/friends/friend-requests',{method: "POST",headers: {"content-type": "application/json",'Authorization': data.jwt,}});
    const friendata = await response.json()
    data.friendRequests = friendata.data
    data.friendRequests = data.friendRequests
    }


    export let data: PageData;


</script>

<div class="space-y-4 max-w-[1200px] m-0 m-auto">
    <div class="flex flex-row flex-wrap">
    <h2 class="grow">My Friend Requests</h2>
    <!-- <button class="btn variant-filled-primary rounded-md">Ignore All</button> -->
    </div>

    <div class="flex flex-col flex-wrap md:grid md:grid-cols-3 md:grid-rows-4 gap-2">
        {#if data.friendRequests}
        {#each data.friendRequests as {userid, username}}
    <Usercard userid={userid} username={username} friendRequest={true} jwt={data.jwt} refresh={refresh}/>
    {/each}
    {/if}
</div>


</div>