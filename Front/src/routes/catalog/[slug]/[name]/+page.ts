import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';
 
export const load = (async ({ fetch, params }) => {
  const res = await fetch(`http://mete0r.xyz/api/catalog/iteminfo/${params.slug}`)
  const data = await res.json()
  
  if (params.name != data.iteminfo.Name.replace(/[^a-zA-Z ]/g, "").replaceAll(' ', '-')){
    throw redirect(301,'/catalog/'+params.slug+'/'+data.iteminfo.Name.replace(/[^a-zA-Z ]/g, "").replaceAll(' ', '-'))
  }

  if (data.error === false){
    const creatorusernameresp = await fetch(`http://mete0r.xyz/api/userinfo/${data.iteminfo.Creator??"0"}`)
    const creatorusername = await creatorusernameresp.json()
    return {
      item: data.iteminfo,
      creatorusername: creatorusername.userinfo.username
    }
  }
  throw error(404, 'Not found');
}) satisfies PageLoad;