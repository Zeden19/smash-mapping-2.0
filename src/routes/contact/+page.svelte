<script xmlns="http://www.w3.org/1999/html">
    import TwitterFollow from "./TwitterFollow.svelte";
    import MailTo from "./MailTo.svelte";
    import Discord from "./Discord.svelte";
</script>
<svelte:head>
    <title>Smash Mapping: Contact</title>
</svelte:head>

<body>
<h2 class="border-gradient border">Contact</h2>


<div class="content border border-gradient">
    <p>Below you'll find links to contact me, please contact if you have bug reports, suggestions, or any other
        inquiries.</p>
    <br>

    <p>Twitter and Discord are my best forms of contact. If you're interested in Smash Mappings development and
        would like to help out, i'd highly recommend you join my Discord Server (link below).</p>
    <br>


    <div class="share-buttons">
        <TwitterFollow/>
        <Discord/>
        <MailTo/>
    </div>

    <div class="reimu-div">
        <img alt="reimu-gif" class="reimu" src="reimu.gif">
        <img style="height: 200px; width: 200px" alt="reimu-standing-gif" class="reimu" src="reimu-standing.gif">
    </div>
</div>

</body>

<style>
    body {
        background-color: #26282B;
        height: 100vh;
    }

    * {
        margin: 0;
        padding: 0;
    }

    .content {
        background-color: #2c343c;
        padding: 10px;
        margin: 10px 10%;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    h2 {
        letter-spacing: 1px;
        text-align: center;
        font-family: 'Impact', sans-serif;
        font-size: 50px;
        color: white;
        font-style: italic;
        background-color: #2c343c;
        margin: 5px 15% 0;
        padding: 10px;


    }

    .border {
        border: 10px solid;
        border-image-slice: 1;
    }

    .border-gradient {
        border-image-source: radial-gradient(circle, #2c343c 0, #3c4450 50%, #26282B 100%);
    }

    p {
        text-align: center;
        color: white;
        font-size: 1.2em;
    }

    img {
        float: right;
        border: black solid 3px;
        margin-right: 5px;
        margin-left: 10px;
    }

    .share-buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        gap: 10px;
        width: 60%;
    }

    .reimu-div {
        display: flex;
        justify-content: center;
        align-items: center;
        border: none;
        margin-right: 1.7em;
        margin-left: 0;
    }

    .reimu {
        border: none;
    }
</style>
