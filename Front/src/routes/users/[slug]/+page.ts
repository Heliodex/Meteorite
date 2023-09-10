import { error } from "@sveltejs/kit"
import type { PageLoad } from "./$types"

export const load = (async ({ fetch, params, parent }) => {
	let data = await parent()
	let alreadyFriends = false
	let otherUserWantsToBeFriends = false
	const res = await fetch(`http://mete0r.xyz/api/userinfo/${params.slug}`)
	const datauser = await res.json()

	const resvisits = await fetch(
		`http://mete0r.xyz/api/userinfo/${params.slug}/visits`,
	)
	const datavisits = await resvisits.json()

	const result = await fetch(
		"http://mete0r.xyz/api/friends/has-sent-request",
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

	if (datauser.error === false) {
		return {
			profile: datauser.userinfo,
			alreadyFriends,
			otherUserWantsToBeFriends,
			visits: datavisits.visits,
		}
	}
	throw error(404, "Not found")
}) satisfies PageLoad
