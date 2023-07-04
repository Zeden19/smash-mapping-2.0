import {GOOGLE_MAPS_API_KEY} from "$env/static/private";
import {SMASH_GG_API_KEY} from "$env/static/private";
import {SUPABASE_KEY} from "$env/static/private";
import {createClient} from '@supabase/supabase-js'

export const supabase = createClient('https://mifvquxknwmbszdrqwio.supabase.co',
    SUPABASE_KEY)


export async function load({cookies}) {

    const {data} = await supabase.from("tournaments").select();

    // cookie stuff
    let geolocated = cookies.get('geolocated');
    const visited = cookies.get('visited');

    if (geolocated === undefined) {
        cookies.set('geolocated', 0, {path: '/'});
    }

    if (visited === undefined) {
        cookies.set('visited', 0, {path: '/'});
    }

    return {
        geolocated,
        visited,
        GOOGLE_MAPS_API_KEY,
        SMASH_GG_API_KEY,
        SUPABASE_KEY,
        tournaments: data,
    };
}