import type { PageLoad } from './$types';
import { url } from "$lib/url"
 
export const load = (async ({ fetch, parent }) => {
    let data = await parent()

    const response = await fetch(url+'/api/auth/recentgames',{method: "POST",headers: {"content-type": "application/json",'Authorization': data.jwt,}});
    const gamedata = await response.json()

    const responsefriends = await fetch(url+'/api/auth/requestfriends',{method: "POST",headers: {"content-type": "application/json",'Authorization': data.jwt,}});
    const friendsdata = await responsefriends.json()

    const feedreponse = await fetch(url+'/api/feed/fetch',{method: "POST",headers: {"content-type": "application/json",'Authorization': data.jwt,}});
    const feed = await feedreponse.json()

    return {
      recentlyplayed: gamedata,
      friendsdata,
      feed: feed.data
  }

}) satisfies PageLoad;