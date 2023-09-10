import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
 
export const load = (async ({ fetch, params }) => {
  const res = await fetch(`http://mete0r.xyz/api/catalog/iteminfo/${params.slug}`)
  const data = await res.json()
  if (data.error === false){
    throw redirect(301,'/catalog/'+params.slug+'/'+data.iteminfo.Name.replace(/[^a-zA-Z ]/g, "").replaceAll(' ', '-'))
  }
  throw error(404, 'Not found');
}) satisfies PageLoad;