import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"
import { url } from "$lib/url"
	import { PUBLIC_ORIGIN } from "$env/static/public"

export const load = (async ({ fetch, params, parent }) => {
	let data = await parent()
	let alreadyFriends = false
	let otherUserWantsToBeFriends = false
	let wearingItems: Array<any> = []
	const res = await fetch(
		`http://${PUBLIC_ORIGIN}/api/userinfo/${params.slug}`,
	)
	const datauser = await res.json()

	const resvisits = await fetch(
		`http://${PUBLIC_ORIGIN}/api/userinfo/${params.slug}/visits`,
	)
	const datavisits = await resvisits.json()

	const result = await fetch(
		`http://${PUBLIC_ORIGIN}/api/friends/has-sent-request`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: data.jwt,
			},
			body: JSON.stringify({
				recipientUserId: datauser.userinfo.userid.toString(),
			}),
		},
	)
	const requestresult = await result.json()
	if (!requestresult.error) {
		if (requestresult?.message === true) {
			alreadyFriends = true
		}
		if (requestresult?.message === "Other user wants to be friends.") {
			otherUserWantsToBeFriends = true
		}
	}

	const wearingresponse = await fetch(
		url + `/api/userinfo/${params.slug}/inventory`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ onlywearing: true }),
		},
	)
	const wearingdata = await wearingresponse.json()
	wearingItems = wearingdata.inventory

	if (datauser.error === false) {
		return {
			profile: datauser.userinfo,
			alreadyFriends,
			otherUserWantsToBeFriends,
			visits: datavisits.visits,
			wearingItems,
		}
	}
	throw error(404, "Not found")
}) satisfies PageLoad
