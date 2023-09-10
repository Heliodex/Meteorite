<script lang="ts">
    import { Avatar } from "@skeletonlabs/skeleton";
    import Rocks from '../components/rocks.svelte';
    export let itemname: String;
    export let price:any = undefined
    export let itemid: String;
    export let sales:any = undefined
    export let type = ""

    export let width = "w-36"

    export let interact = "false"

    export let moderation = false

    export let equipped = false

    export let action = () => {}

    export let moderate = () => {}

    let imageloading = true
    const onload = (node:HTMLImageElement, callback: VoidFunction) => {
  if(node.complete) {
    imageloading = false
  } else {
    node.addEventListener('load', callback)

    return {
      destroy() {
        node.removeEventListener('load', callback)
      },
    }
  }
}

    </script>

    <div class="card rounded-md card-glass-surface snap-center card-hover {width} relative hidden sm:block">
        <a class="unstyled hidden sm:block" href="/catalog/{itemid}/{itemname.replace(/[^a-zA-Z ]/g, "").replaceAll(' ', '-')}">
        {#if type != "Audio" && type != "Video"}
        {#if imageloading}
        <div class="w-36 h-36 rounded-none placeholder animate-pulse"></div>
        {/if}
        <img alt="" class="avatar-image bg-surface-400-500-token w-full h-full flex aspect-square object-cover {imageloading === true ? 'hidden' : ''} " use:onload={()=> imageloading=false} src="/api/thumbnailrender/asset/?id={itemid}{moderation === false ? "": "&nonapproved=true"}" />
        {/if}
    </a>

        {#if type === "Audio"}
        <audio class="block" controls>
        <source src="/asset?id={itemid}&nonapproved=true" type="audio/mp3">
        </audio>
        {/if}

        {#if type === "Video"}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video controls>
            <source src="/asset?id={itemid}&nonapproved=true" type="video/webm">
          </video>
        {/if}

        {#if interact === "true"}
        {#if equipped === true}
        <button on:click={() => {action('remove',parseFloat({itemid}.itemid))}} class="btn variant-filled-primary rounded-md btn-sm absolute right-0 top-0">Remove</button>
        {:else}
        <button on:click={() => {action('wear',parseFloat({itemid}.itemid))}} class="btn variant-filled-primary rounded-md btn-sm absolute right-0 top-0">Wear</button>
        {/if}
        {/if}
        <p class="truncate w-28">{itemname}</p>
        {#if sales}
        <div class="!text-xs">{sales??"0"} Sales</div>
        {/if}

        {#if moderation === true}
        <p class="!text-xs">{type}</p>
        <div class="flex flex-col gap-y-1">
        <div class="flex flex-row gap-x-2">
        <button on:click={() => {moderate('deny',parseFloat({itemid}.itemid))}} class="btn variant-filled-primary rounded-md btn-sm grow">Deny</button>
        <button on:click={() => {moderate('approve',parseFloat({itemid}.itemid))}} class="btn variant-filled-primary rounded-md btn-sm grow">Approve</button>
        </div>
        <!--<button on:click={() => {}} class="btn variant-filled-primary rounded-md btn-sm w-full">Download</button>-->
        </div>
        {/if}

        {#if price}
        
        <div class="flex flex-row ">
            <Rocks width="w-5"/>
            <div class="!text-sm">{price}</div>
        </div>
        {/if}
    </div>