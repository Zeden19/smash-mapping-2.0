import {GOOGLE_MAPS_API_KEY} from "$env/static/private";
import {SMASH_GG_API_KEY} from "$env/static/private";
import {SUPABASE_KEY} from "$env/static/private";
import {createClient} from '@supabase/supabase-js'
import {fail} from "@sveltejs/kit";

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
    default: async ({request}) => {
        const data = await request.formData();

        // check for valid username

        //check for valid password

        try {
            console.log(data.get('username'), data.get('password'))
        } catch (error) {
            return fail(422, {
                username: data.get('username'),
                password: data.get('password'),
                error: error.message
            });
        }
    }
}