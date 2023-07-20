import {GOOGLE_MAPS_API_KEY} from "$env/static/private";
import {SMASH_GG_API_KEY} from "$env/static/private";
import {SUPABASE_KEY} from "$env/static/private";
import {createClient} from '@supabase/supabase-js'

const supabase = createClient('https://mifvquxknwmbszdrqwio.supabase.co',
    SUPABASE_KEY)

export async function load({cookies}) {
    const {data} = await supabase.from("tournaments").select();

    return {
        GOOGLE_MAPS_API_KEY,
        SMASH_GG_API_KEY,
        SUPABASE_KEY,
        tournaments: data,
    };
}

export const actions = {
    setCookie: ({cookies}) => {
        cookies.set('visited', true, {path: '/'});
    }
}