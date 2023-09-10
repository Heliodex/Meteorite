<script lang="ts">
    let title:string;
    let description:string
    let files: FileList;
     
    let disabled = false
    let disabledupload = false
    let message = {error: false, message: ""}
    let messageupload = {error: false, message: ""}
    let allowmeshes = false
    import { RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
    export let jwt: string;
    export let gameid:string
    export let avatartype = "PC"
    export let gearallowed = false
    
    $:if (!title && !description){
        disabled = true
        message.message = "Enter new title or new description."
        message.error = true
    }else{
        disabled = false
        message.message = ""
        message.error = false
    }

    $:if (!files){
        disabledupload = true
        messageupload.message = "Choose a file."
        messageupload.error = true
    }else{
        disabledupload = false
        messageupload.message = ""
        messageupload.error = false
    }


    
    async function updategame(){
        const updategameresp = await fetch("/develop/editgame", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
                    'Authorization': jwt,
				},
				body: JSON.stringify({
					nameofgame: title,
                    description: description,
                    gameid: gameid.toString()
				})
			})
        const updategamejson = await updategameresp.json()
        console.log(updategamejson)
        if (!updategamejson.error){
        message.message = updategamejson.message
        message.error = false
        }else{
            message.message = updategamejson.error
            message.error = true
        }

    }

    async function uploadnew(){
    const formData = new FormData();
    formData.append("gameid", gameid.toString())
	formData.append("gamefile", files[0])


    const req = await fetch("/develop/editgameupload", {
	    method: "post",
		body: formData,
        headers: {
                    'Authorization': jwt,
				},
	});

	const res = await req.json();
    console.log(res)
        if (!res.error){
            messageupload.message = res.message
            messageupload.error = false
        }else{
            messageupload.message = res.error
            messageupload.error = true
        }
    }

    async function updateAvatarType(newavatartype: string){
        if (avatartype != newavatartype){
        avatartype = newavatartype
        const updateAvatarType = await fetch("/develop/editavatartype", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
                    'Authorization': jwt,
				},
				body: JSON.stringify({
                    avatartype,
                    gameid: gameid.toString()
				})
			})
        const updateAvatarTypejson = await updateAvatarType.json()
        console.log(updateAvatarTypejson)
        }
    }

    async function updateGearStatus(newgearstatus: boolean){
        if (allowmeshes != newgearstatus){
        allowmeshes = newgearstatus
        const updateGearStatus = await fetch("/develop/editgearstatus", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
                    'Authorization': jwt,
				},
				body: JSON.stringify({
                    newgearstatus,
                    gameid: gameid.toString()
				})
			})
        const updateGearStatusjson = await updateGearStatus.json()
        console.log(updateGearStatusjson)
        }
    }
    
    </script>
    
    <div class="space-y-2 flex flex-row flex-wrap justify-center">
    


        <div class="w-full flex flex-row  gap-4">
    
        <div class="space-y-4 w-full">
            <h5 class="m-auto tex   t-center w-full">Edit Game</h5>
            <label class="label">
                <span>Title</span>
            <input type="text" bind:value={title} class="input input-bordered input-primary w-full rounded-md" required>
        </label>
        <label class="label">
            <span>Description</span>
        <textarea bind:value={description} class="input input-bordered input-primary w-full rounded-md" required></textarea>
    </label>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="label">
        <span>Avatar Type</span>
        <RadioGroup rounded="rounded-md" display="flex flex-row flex-wrap">
            <RadioItem bind:group={avatartype} on:click={() => {updateAvatarType("R15")}} value="R15">R15</RadioItem>
            <RadioItem bind:group={avatartype} on:click={() => {updateAvatarType("R6")}} value="R6">R6</RadioItem>
            <RadioItem bind:group={avatartype} on:click={() => {updateAvatarType("PC")}} value="PC">Player Choice</RadioItem>
        </RadioGroup>
        </label>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
                <span>Allow Gear</span>
                <RadioGroup rounded="rounded-md" display="flex flex-row flex-wrap">
                    <RadioItem bind:group={gearallowed} on:click={() => {updateGearStatus(true)}} value={true}>Yes</RadioItem>
                    <RadioItem bind:group={gearallowed} on:click={() => {updateGearStatus(false)}} value={false}>No</RadioItem>
                </RadioGroup>
            </label>
            <h5 class="!text-xs mt-6 {message.error === true ? 'text-error-600' : 'text-success-600'}">{message.message??""}</h5>
        </div>

        <div class="space-y-4 w-full h-full">
            <h5 class="m-auto tex   t-center w-full">Edit File</h5>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
            <span>RBXL File</span>
            <input class="w-full" accept=".rbxl" bind:files type="file" />
        </label>
        <h5 class="!text-xs {messageupload.error === true ? 'text-error-600' : 'text-success-600'}">{messageupload.message??""}</h5>
        </div>

    </div>

    <div class="flex flex-row w-full gap-4">
    <button on:click={updategame} class="btn variant-filled-primary btn-base w-full" disabled={disabled}>
        Update
    </button>

    <button on:click={uploadnew} class="btn variant-filled-primary btn-base w-full" disabled={disabledupload}>
        Upload
    </button>
</div>
    
        
    

    
    </div>
    