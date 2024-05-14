import {json} from "@sveltejs/kit";
import {SMASH_GG_API_KEY} from "$env/static/private";
import {GraphQLClient} from "graphql-request";

export async function POST({request}) {
    const {data} = await request.json();

    const apiVersion = 'alpha';
    const endpoint = 'https://api.start.gg/gql/' + apiVersion;
    const client = new GraphQLClient(endpoint, {
        headers: {
            Authorization: 'Bearer ' + SMASH_GG_API_KEY,
        },
    });

    console.log(data)

}