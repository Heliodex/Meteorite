<script lang="ts">
    import { Avatar } from "@skeletonlabs/skeleton";
    import RelativeTime from '@yaireo/relative-time'
    import { url } from "$lib/url"
    const relativeTime = new RelativeTime()

    export let width: String;
    export let PostText = "Post Comment"
    export let PlaceholderText = "Write a comment!"
    export let disabled = true
    export let AssociatedAssetType: String
    export let AssociatedAssetId: String
    export let jwt: string
    let comment: String
    let currentPage = 1;
    let maxiumumPage = 1;
    //export let type:string

    let loading = true
    let comments: any
    $:if (!comment){
        disabled = true
    }else{
        disabled = false
    }

    async function postComment(){
        const response = await fetch("/api/comments/post", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
                    'Authorization': jwt,
				},
				body: JSON.stringify({
					comment,
                    AssociatedAssetType,
                    AssociatedAssetId
				})
			})
        const responsedata = await response.json()
        if (!responsedata.error){
            loadComments()
        }else{

        }
    }

    async function loadComments(){
        const res = await fetch(url+"/api/comments/get", {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
                    'Authorization': jwt,
				},
				body: JSON.stringify({
                    AssociatedAssetType,
                    AssociatedAssetId,
                    page: currentPage
				})
			})
      comments = await res.json()
      if (comments.error){
        comments = []
      }
      maxiumumPage = comments.pages
      loading = false
    }
    loadComments()

    function setPage(value: number){
        if (currentPage-value >= 1 && currentPage-value <= maxiumumPage){
            currentPage -= value
            loadComments()
        }
    }
</script>
<div class="bg-surface-700 p-4 space-x-4 space-y-4 flex flex-row flex-wrap max-w-[{width}px] m-0 m-auto">
    <div class="flex flex-row w-full space-x-4">
        <textarea class="rounded-md grow input input-bordered input-primary" maxlength={200} bind:value={comment} placeholder={PlaceholderText} />
        <button on:click={postComment} class="btn mt-6 variant-filled-primary rounded-md "disabled={disabled}>{PostText}</button>
    </div>

        <div class="w-full">
            {#if loading === true}
            <p>Loading...</p>
            {:else if loading === false && comments.data.length === 0}
            <p>No comments found.</p>
            {:else if loading === false}

            {#each comments.data as {content, posterid, date, poster}}
            <div class="flex flex-row gap-x-6">
            <a class="unstyled" href="/users/{posterid}"><Avatar src={"/api/thumbnailrender/?id="+posterid+"&type=headshot"} width="w-14" /></a>
            <div>
            <a class='truncate !text-base' href="/users/{posterid}">{poster.username}</a>
            <h5 class="!text-base whitespace-pre-line overflow-hidden">"{content}"</h5>
            <h5 class="!text-xs">Posted {relativeTime.from(new Date(date))}</h5>
            </div>
            </div>

            {/each}
            <div class="flex flex-row gap-x-2 justify-center">
                <button on:click={() => {setPage(1)}} class="btn btn-sm bg-surface-600 rounded-md">&lt;</button>
                <h5 class="">{currentPage} / {maxiumumPage}</h5>
                <button on:click={() => {setPage(-1)}} class="btn btn-sm bg-surface-600 rounded-md">&gt;</button>
            </div>
            
            {/if}
        </div>

    </div>