<script>

</script>


<div on:click={() => window.open("mailto:ashar562@uwo.ca")}>
    <img alt="outlook" src="outlook.png">
    <a target="_blank" href="mailto:ashar562@uwo.ca">Mail</a>
</div>


<style>
    div {
        background-size: 1.5em;
        background: #005ea2;
        border-radius: 30px;
        width: 7.5em;
        height: 2.4em;
        line-height: 2;
        display: flex;
    }

    div:hover {
        background-color: #002844FF;
    }

    a {
        font-weight: bold;
        text-decoration: none;
        color: white;
        margin-left: auto;
        margin-right: 0.95em;
    }

    img {
        margin-right: auto;
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