import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
 
export const load = (async ({ locals }) => {
  if (!locals.user){
  throw redirect(303,'/home')
  }
  if (locals.user.moderationstatus && locals.user.moderationstatus?.status.toUpperCase() != "OK"){
		return
		}
    throw redirect(303,'/home')
}) satisfies PageServerLoad;