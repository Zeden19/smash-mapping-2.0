<script>
    import {fade} from "svelte/transition";
    import {enhance} from "$app/forms";
    export let form;
</script>

<div transition:fade={{duration: 200, delay: 200}}>
    <form use:enhance class="account-section" method="post">
        <img class="account-image" src="account.png" alt="Account Icon" width="100px" height="100px">


        {#if form?.error}
            <p class="error">{form.error}</p>
        {/if}
        <div class="dark-overlay"></div>
        <p class="coming-soon">Coming Soon</p>
        <label>Username: <input value={form?.username ?? ""} required name="username" type="text"></label>
        <label>Password: <input value={form?.password ?? ""}  required name="password" type="password"></label>

        <a href="/">Create Account</a>
        <button>Submit</button>
    </form>
</div>

<style>
    .account-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        height: 30%;
        margin-top: 10px;
        pointer-events: none;
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

    .dark-overlay {
        /* Styles for the dark overlay */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5); /* Semi-transparent black background */
    }

    .coming-soon {
        /* Styles for the "Coming Soon" text */
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-size: 1.9em;
        rotate: 5deg;
        font-weight: bold;
        text-align: center;
        opacity: 1;
    }

</style>