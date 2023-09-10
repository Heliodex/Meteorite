<script lang="ts">
let currentp:string;
let newp:string;
let confp:string;
let disabled = false
let message = {error: false, message: ""}
export let jwt: string;

$:if (newp != confp || !newp && !confp){
    disabled = true
    message.message = "New password and Confirm Password are not the same."
    message.error = true
}else{
    disabled = false
    message.message = ""
    message.error = false
}

async function changepassword(){
    const changepasswordresp = await fetch('/api/changepassword', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
                        'Authorization': jwt,
					},
					body: JSON.stringify({
                        oldpassword:currentp,
                        newpassword:confp
					})
				})
    const changepassword = await changepasswordresp.json()
    if (!changepassword.error){
        message.message = changepassword.message
        message.error = false
    }else{
        message.message = changepassword.error
        message.error = true
    }
}

</script>

<div class="space-y-2 flex flex-row flex-wrap justify-center">

    <h5 class="m-auto text-center">Change Password</h5>

    <div class="space-y-4">
        <input type="password" bind:value={currentp} placeholder="Current Password" class="input input-bordered input-primary w-full rounded-md" required>
        <input type="password" bind:value={newp} placeholder="New Password" class="input input-bordered input-primary w-full rounded-md" required>
        <input type="password" bind:value={confp} placeholder="Confirm Password" class="input input-bordered input-primary w-full rounded-md" required>
        <h5 class="!text-xs mt-6 {message.error === true ? 'text-error-600' : 'text-success-600'}">{message.message??""}</h5>
    </div>

    

    <button on:click={changepassword} class="btn variant-filled-primary btn-base" disabled={disabled}>
        Update
    </button>

</div>
