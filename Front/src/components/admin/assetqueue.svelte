<script lang="ts">
    import Itemcard from "../itemcard.svelte";


    let currentPage = 1;
    let maxiumumPage = 1;
    let currentCategory = "All"
    let queuecount = 0

    export let jwt:string

    let items: [];
    async function updateItems(){

        const response = await fetch('admin/queue',{method: "POST", body: JSON.stringify({sort: currentCategory,page: currentPage}),headers: {"content-type": "application/json",'Authorization': jwt,}});
        const data = await response.json()
        if (!data.error){
            if (items){
            items.length = 0
            items = items
            }
            items = data.data
            items = items
            maxiumumPage = data.pages
            queuecount = data.count
        }


    }
    function setPage(value: number){
        if (currentPage-value >= 1 && currentPage-value <= maxiumumPage){
            currentPage -= value
            updateItems()
        }
    }
    function setCategory(event: any){
        currentCategory = event.target.innerText
        currentPage = 1
        updateItems()
    }
    async function moderateaction(action: any,itemid: Number){
        console.log(action)
        console.log(itemid)
        const itemactionresult = await fetch('/api/moderate/queue', {
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

    }
    updateItems()
</script>

<div class="grow">
    <h2 class="">Queue Count: {queuecount} </h2>
    <div class="flex flex-col flex-wrap md:grid sm:grid-cols-6 sm:grid-rows-5 gap-2">
        {#if items}
        {#each items as {Name, ItemId, Creator, Type}}
        <Itemcard itemname={Name} itemid={ItemId} moderation={true} type={Type} moderate={moderateaction}/>
        {/each}
        {/if}
</div>
<div class="flex flex-row space-x-2 justify-center">
    <button on:click={() => {setPage(1)}} class="btn btn-sm bg-surface-600 rounded-md">&lt;</button>
    <h5 class="">{currentPage} / {maxiumumPage}</h5>
    <button on:click={() => {setPage(-1)}} class="btn btn-sm bg-surface-600 rounded-md">&gt;</button>
</div>


</div>