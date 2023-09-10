import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
 
export const load = (async ({ fetch, parent }) => {
    let data = await parent()

    const response = await fetch('http://mete0r.xyz/api/friends/friend-requests',{method: "POST",headers: {"content-type": "application/json",'Authorization': data.jwt,}});
    const friendata = await response.json()

    return {
        friendRequests: friendata.data
    }

}) satisfies PageLoad;