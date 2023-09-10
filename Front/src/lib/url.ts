import { browser } from "$app/environment"

export const url = !browser ? "http://mete0r.xyz" : "" // if no browser return "http://mete0r.xyz" otherwise nothing
