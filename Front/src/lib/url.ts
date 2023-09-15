import { browser } from "$app/environment"
import { PUBLIC_ORIGIN } from "$env/static/public"

export const url = !browser ? `http://${PUBLIC_ORIGIN}` : "" // if no browser return "http://mete0r.xyz" otherwise nothing
