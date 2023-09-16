<script>
    import {page} from '$app/stores';
    import Discord from "./contact/Discord.svelte";
</script>

<body>
<h1>Congrats! You found a secret feature!</h1>
<h2>Just kidding! Something REALLY went wrong in my website. Sorry!</h2>
<h3>{$page.status} {$page.error.message}</h3>
<br>
<p>If you can, please join my Discord server using the link below and report this bug</p>
<a target="_blank" href="https://discord.gg/3a9TryUejD">Discord</a>

<br>
<img src="sadReimu.png" alt="Sad Reimu from Osana Reimu">
</body>


<style>
    * {
        background: #26282B;
    }

    body {
        text-align: center;
    }

    h1, h2, h3 {
        letter-spacing: 1px;
        font-family: "Bebas Neue", serif;
        color: white;
    }

    p {
        color: white;
        margin-block-end: 0;
        margin-block-start: 0;
    }
</style>