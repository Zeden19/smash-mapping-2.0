<script>
    import {fade} from "svelte/transition";
    import {enhance} from "$app/forms";
    import {auth, user} from "$lib/firebase.js";
    import {GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";
    import Username from "./Username.svelte";


    export let form;

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        const user = await signInWithPopup(auth, provider);
    }
</script>

<div transition:fade={{duration: 200, delay: 200}}>

    {#if $user}
        <Username/>
    {:else}
        <form use:enhance class="account-section" method="post">
            <img class="account-image" src="account.png" alt="Account Icon" width="100px" height="100px">

            {#if form?.error}
                <p class="error">{form.error}</p>
            {/if}

<!--            <label>Username: <input value={form?.username ?? ""} required name="username" type="text"></label>-->
<!--            <label>Password: <input value={form?.password ?? ""} required name="password" type="password"></label>-->

<!--            <a>Create Account</a>-->
<!--            <button>Submit</button>-->
        </form>

        <button on:click={() => signInWithGoogle()}>Sign in with Google</button>
    {/if}

</div>


<style>
    .account-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 30%;
        margin-top: 10px;
    }

    .account-image {
        margin-bottom: 10px;
    }

    label {
        display: flex;
        font-family: "Bebas Neue", serif;
        font-size: 1.4em;
        margin-bottom: 5px;
        justify-content: space-around;
        width: 100%;
    }

    a {
        font-family: "Bebas Neue", serif;
        font-size: 1.4em;
        color: white;
        text-decoration: underline;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    a:hover {
        color: #ff0000;
        cursor: pointer;
    }

    button {
        align-self: flex-start;
    }

</style>