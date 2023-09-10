<script lang="ts">
    import { Avatar, menu } from "@skeletonlabs/skeleton";
    import type { PageData } from "../$types";
    import Groupbar from "../../../components/groups/groupbar.svelte";
    import Commentcard from "../../../components/commentcard.svelte";
    import { url } from "$lib/url"
    let selectedgroup = "Lambda Media Group"
    let currentPage = 1;
    let maxiumumPage = 1;
    let users: []

    export let data: PageData;
    let groupid = data.group.groupid

    async function updateMembers(){
        const response = await fetch(url+'/api/groups/'+groupid+'/members',{method: "POST", body: JSON.stringify({page: currentPage, rank: 1}),headers: {"content-type": "application/json"}});
        const data = await response.json()
        if (!data.error){
            if (users){
            users.length = 0
            users = users
            }
            users = data.data
            users = users
            maxiumumPage = data.pages
        }

    }

    updateMembers()

    </script>




<div class="sm:flex sm:flex-row gap-2 max-w-[1400px] m-0 m-auto">
    <Groupbar selectedgroup={selectedgroup} grouplist={data.groups}/>
    
    <div class="col-span-5 mt-8 w-full space-y-2">
        <div class="bg-surface-700 p-4">

        <div class="">
        <div class="flex flex-row gap-x-4">
        <Avatar width="w-36"  rounded="rounded-none" src="/assets/groupicons/icon-0.png" />

        <div>
        <h2 class="font-bold">{data.group.Name}</h2>
        <h5 class="!text-sm">By <a href="/users/{data.group.owner.userid}">{data.group.owner.username}</a></h5>
        </div>

    </div>

    <div class="w-full space-y-2">
        <h5 class="font-bold !text-base">Description</h5>
        <h5>{data.group.Description}</h5>
    </div>

</div>

        
    </div>
    
    <h4 class="font-bold">Shout</h4>

    <div class="">

    <div class="bg-surface-700 p-4 flex flex-row gap-x-2">
        <a href="/users/0"><Avatar width="w-12" src="/api/thumbnailrender?id=0&type=headshot" /></a>

        <div>
        <h5 class="!text-sm font-semibold">SushiWasNotHere</h5>
        <h5 class="!text-sm">Hello, world!</h5>
        
    </div>

    </div>
    <div class="bg-surface-700 p-4 flex flex-row gap-x-2">
    <textarea class="rounded-md grow input input-bordered input-primary" placeholder="Shout here!!" />
    <button class="btn mb-6 variant-filled-primary rounded-md ">Shout</button>
</div>
    
</div>

    <div class="flex flex-row justify-between">
    <h4 class="font-bold">Members</h4>

    <div class="flex flex-row gap-x-2">
        <button on:click={() => {}} class="btn btn-sm bg-surface-600 rounded-md">&lt;</button>
        <h5 class="">1 / 1</h5>
        <button on:click={() => {}} class="btn btn-sm bg-surface-600 rounded-md">&gt;</button>

            <button class="ring-surface-500 hover:ring-surface-300 ring-2 rounded p-1 flex flex-row gap-x-3 relative">
                <h5 class="!text-sm hover:text-white">Members</h5>
                <h5 class="!text-sm hover:text-white">(1)</h5>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="w-4 "><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>

            </button>

    </div>

</div>

    <div class="bg-surface-700 p-4 flex flex-row gap-x-2">
        {#if users}

        {#each users as {userid, username}}
        <a class="unstyled" href="/users/{userid}"><div class="w-20">
            <Avatar width="w-20" src="/api/thumbnailrender?id={userid}&type=headshot" />
            <h5 class="!text-base truncate">{username}</h5>
        </div></a>
        {/each}

        {/if}
    </div>

    <h4 class="font-bold">Wall</h4>
    <Commentcard PostText="Post" PlaceholderText="Say something..."/>

</div>

  </div>