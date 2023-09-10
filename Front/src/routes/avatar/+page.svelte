<script lang="ts">
    import type { PageData } from './$types';
    import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
    import { writable, type Writable } from 'svelte/store';
    import Itemcard from '../../components/itemcard.svelte';
    import Colorpicker from '../../components/colorpicker.svelte';
    import { modalStore } from '@skeletonlabs/skeleton';
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import { url } from "$lib/url"
    let avatar: string;
    import { avatarstore } from "$lib/avatarstore"
    import { onMount } from 'svelte';
	avatarstore.subscribe(value => {
		avatar = value
	})

    let regenerating = false
  
    export let data: PageData;
    const jwt = data.jwt;
    const userid = data.user.userid

    let avatartype = data.user.avatartype??"R6"
    let avatarfilter = "shirts"
    let currentItems: any[] = [];
    async function updateBodyType(newavatartype: string){
        if (avatartype != newavatartype){
            avatartype = newavatartype
            const response = await fetch("/api/avatar/updateavatartype", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
                    'Authorization': jwt,
				}
			})

        }
    }
    async function updateItems(){
        const response = await fetch(url+`/api/userinfo/${userid}`)
        const data = await response.json()
        if (currentItems){
            currentItems.length = 0
            currentItems = currentItems
            }
            currentItems = data.userinfo.inventory
            currentItems = currentItems
            currentItems = currentItems.filter(currentItems => currentItems.Type.toLowerCase() === avatarfilter)
            //console.log(currentItems)

    }
    async function itemaction(action: any,itemid: Number){
        console.log(action)
        console.log(itemid)
        const itemactionresult = await fetch('/api/itemaction', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
                        'Authorization': jwt,
					},
					body: JSON.stringify({
                        action,
                        itemid
					})
				})
        const itemaction = await itemactionresult.json()
        updateItems()
        console.log(itemaction)

    }
    $:{
        if (avatarfilter != "bodycolors"){
            updateItems()
        }else{
            // pop up modal
            const modalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: Colorpicker,
        props: { jwt: data.jwt},
	};
	const d: ModalSettings = {
		type: 'component',
		// NOTE: title, body, response, etc are supported!
		component: modalComponent,
        modalClasses: 'w-full max-w-[700px] p-4'
	};
	modalStore.trigger(d);
        }
    }
    let regeneratebtn = "Regenerate"
    let regenerateimg: HTMLImageElement
    
    async function regenerate(){
        if (regenerating === false){
        regenerating = true
        regeneratebtn = "Regenerating..."
        await fetch(`/api/thumbnailrender/?id=${data.user.userid}&method=regenerate`, {
	    headers: {'Authorization': jwt}
        })
        await fetch(`/api/thumbnailrender/?id=${data.user.userid}&type=headshot&method=regenerate`, {
	    headers: {'Authorization': jwt}
        })
        avatarstore.update(n => n = "/api/thumbnailrender/?id="+data.user.userid+"&a="+Date.now())
        regeneratebtn = "Regenerate"
        regenerating = false
    }
    }
  </script>

<div class="bg-surface-700 p-4 flex flex-row flex-wrap space-x-2 relative max-w-[1000px] m-0 m-auto">

    <div class="bg-surface-800 relative block lg:hidden w-full">
        <RadioGroup rounded="rounded-md" display="flex absolute right-0 bottom-12">
          <RadioItem bind:group={avatartype} on:click={() => {updateBodyType("R15")}} value="R15">R15</RadioItem>
          <RadioItem bind:group={avatartype} on:click={() => {updateBodyType("R6")}} value="R6">R6</RadioItem>
      </RadioGroup>
      <img bind:this={regenerateimg} src={avatar} alt={data.user.username} class="h-64 m-auto">
      <button on:click={regenerate} class="btn variant-filled-primary w-full rounded-md btn-base" disabled={regenerating}>
          {regeneratebtn}
      </button>
  </div>

    <div class="w-full flex flex-row gap-2">

    <div class="bg-surface-800 relative hidden lg:block h-[19rem]">
          <RadioGroup rounded="rounded-md" display="flex absolute right-0 bottom-12">
            <RadioItem bind:group={avatartype} on:click={() => {updateBodyType("R15")}} value="R15">R15</RadioItem>
            <RadioItem bind:group={avatartype} on:click={() => {updateBodyType("R6")}} value="R6">R6</RadioItem>
        </RadioGroup>
        <img bind:this={regenerateimg} src={avatar} alt={data.user.username} class="h-64">
        <button on:click={regenerate} class="btn variant-filled-primary w-full rounded-md btn-base" disabled={regenerating}>
            {regeneratebtn}
        </button>
    </div>

    <div class="bg-surface-800">
        <RadioGroup rounded="rounded-md truncate flex-wrap lg:flex-nowrap">
            <RadioItem bind:group={avatarfilter} value="shirts">Shirts</RadioItem>
            <RadioItem bind:group={avatarfilter} value="pants">Pants</RadioItem>
            <RadioItem bind:group={avatarfilter} value="hats">Hats</RadioItem>
            <RadioItem bind:group={avatarfilter} value="faces">Faces</RadioItem>
            <RadioItem bind:group={avatarfilter} value="packages">Packages</RadioItem>
            <RadioItem bind:group={avatarfilter} value="heads">Heads</RadioItem>
            <RadioItem bind:group={avatarfilter} value="gears">Gears</RadioItem>
            <RadioItem bind:group={avatarfilter} value="emotes">Emotes</RadioItem>
            <RadioItem bind:group={avatarfilter} value="bodycolors">🖌️</RadioItem>
        </RadioGroup>
        <div class="flex flex-col flex-wrap sm:grid sm:grid-cols-6 gap-2 p-2">
        {#if currentItems && avatarfilter != "bodycolors"}
        {#each currentItems as {ItemName, ItemId, Hidden, Equipped}}
        {#if !Hidden}
        <Itemcard itemname={ItemName} itemid={ItemId} width="w-24" interact="true" equipped={Equipped} action={itemaction}/>
        <div class="bg-surface-800 flex flex-row block sm:hidden px-2 relative">
            <a class="unstyled" href="/catalog/{ItemId}/{ItemName.replace(/[^a-zA-Z ]/g, "").replaceAll(' ', '-')}"><img class="w-20" alt="L" src="/api/thumbnailrender/asset/?id={ItemId}"/></a>
            <div>
                <h3 class="truncate">{ItemName}</h3>
            </div>
            {#if Equipped === true}
            <button on:click={() => {itemaction('remove',parseFloat(ItemId))}} class="btn variant-filled-primary rounded-md btn-sm absolute right-0 top-5">Remove</button>
            {:else}
            <button on:click={() => {itemaction('wear',parseFloat(ItemId))}} class="btn variant-filled-primary rounded-md btn-sm absolute right-0 top-5">Wear</button>
            {/if}
        </div>
        
        {/if}
        {/each}
        {/if}
    </div>
    </div>

    </div>



</div>