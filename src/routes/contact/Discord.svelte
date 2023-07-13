<script>

</script>


<div on:click={() => window.open("https://discord.gg/3a9TryUejD")}>
    <img alt="Discord" src="discord.png">
    <a target="_blank" href="https://discord.gg/3a9TryUejD">Discord</a>
</div>


<style>
    @font-face {
        font-family: "Uni Sans";
        src: url("UniSansHeavyItalic.otf") format("opentype");
    }

    div {
        background-size: 1.5em;
        background: #7289da;
        border-radius: 30px;
        width: 7.5em;
        height: 2.4em;
        line-height: 2.3;
        display: flex;
    }

    div:hover {
        background-color: #333d62;
    }

    a {
        font-weight: bold;
        text-decoration: none;
        color: white;
        margin-left: auto;
        margin-right: 5%;
        font-family: "Uni Sans", "sans-serif";
        flex-shrink: 2;
    }

    img {
        margin: 7px auto 9px 7px;
    }

    @media (max-width: 500px) {
        div {
            width: 30vw;
        }

        img {
            /*margin-right: 1em;*/
        }

    }

</style>