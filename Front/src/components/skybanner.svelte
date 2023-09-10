<script lang="ts">
import { url } from "$lib/url"




export let customclass: string
export let customMediaClass = "hidden lg:block"
let imageUrl = ""
let redirectUrl = "/games/0"
let loading = true

async function grabAd(){

  const res = await fetch(url+`/api/requestad`)
  const data = await res.json()
  imageUrl = data.imageUrl
  redirectUrl = data.redirectUrl

}
grabAd()
</script>

{#if loading}
<div class="hidden lg:block w-[160px] h-[600px] rounded-none placeholder animate-pulse {customclass}"></div>
{/if}

<a on:click={grabAd} href={redirectUrl}><img class="w-[160px] h-[600px] rounded-none  {customclass} {loading === true ? 'hidden' : customMediaClass}" on:load={() => {loading = false}} alt="Ad" src={imageUrl}/></a>