<script lang="ts">
    let message = {error: false, message: ""}
    let disabled = false
    let itemname: string
    let itemdesc: string
    let files: FileList;
    let price:string
    let creations: any[] = []

    $:if (!itemname || !price){
        disabled = true
        message.message = "Item name and price required."
        message.error = true
    }else if (!files){
        disabled = true
        message.message = "File required."
        message.error = true 
    }else{
        disabled = false
        message.message = ""
        message.error = false
    }

    export let type:string
    export let jwt: string

    async function upload(){
    const formData = new FormData();
	formData.append("itemfile", files[0])
    formData.append("itemname", itemname)
    formData.append("description", itemdesc??"No Description")
    formData.append("price", price)
    formData.append("Type", type)

    const req = await fetch("/admin/uploaditem", {
	    method: "post",
		body: formData,
        headers: {
                    'Authorization': jwt,
				},
	});

	const res = await req.json();

    if (!res.error){
        message.message = "Done!"
        message.error = false
        }else{
        message.message = res.error
        message.error = true
        }
        
        

    }

</script>
<div class="space-y-2 grow">
    <h3>{type}</h3>
    <label class="input-label">

    <span class="pt-3">Find your rbxm:</span>

    <input class="w-fit" accept=".rbxm" bind:files type="file" />

</label>
<label class="input-label gap-8">
    <span class="pt-3">{type} Name:</span>
<input bind:value={itemname} type="text" class="input input-bordered input-primary w-full max-w-md rounded-md" required>
</label>

<label class="input-label gap-8">
    <span class="pt-3">Description:</span>
<input bind:value={itemdesc} type="text" class="input input-bordered input-primary w-full max-w-md rounded-md" required>
</label>

<label class="input-label gap-8">
    <span class="pt-3">Price:</span>
<input bind:value={price} type="number" class="input input-bordered input-primary w-full max-w-md rounded-md" required>
</label>

<h5 class="!text-xs mt-6 {message.error === true ? 'text-error-600' : 'text-success-600'}">{message.message??""}</h5>

<button on:click={upload} type="submit" class="btn variant-filled-primary btn-sm text-base rounded-md" disabled={disabled}>Upload for 0 Rocks</button>

<div class="pt-8 space-y-4">


</div>

</div>