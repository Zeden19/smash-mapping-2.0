<script>
    import Map from "./map/Map.svelte";
    import Search from "./map/Search.svelte";
    import Help from "./map/Help.svelte"
    import TournamentsCard from "./map/TournamentsCard.svelte";
    import {createClient} from '@supabase/supabase-js'
    import {onMount, onDestroy} from "svelte";
    import Account from "./map/Account.svelte";
    import {loading, mapResult} from "./stores.js"

    export let data;
    export let supabase = createClient('https://mifvquxknwmbszdrqwio.supabase.co', data.SUPABASE_KEY)

    let sidebarClosed = false;
    let showFilters = true;
    let showTournaments = false;
    let showHelp = false;
    let showAccount = false;

    let sidebarTitle = "Filters:";
    let map;

    // database stuff
    let showBookmarksDialog;

    function showSidebar(title) {
        sidebarClosed = false;
        showFilters = title === "Filters:";
        showTournaments = title === "Tournaments:";
        showHelp = title === "Help:";
        showAccount = title === "Account:";
        sidebarTitle = title;
    }

    onMount(() => {
        if (document.cookie === '') {
            document.cookie = "visited=false;";
        }
        if (document.cookie === 'visited=false') {
            showBookmarksDialog.showModal();
            document.cookie = "visited=true; path=/";
        }
    })

    onDestroy(() => {
        $loading = false;
    })
</script>
<svelte:head>
    <title>Smash Mapping: Map</title>
    <meta charset='utf-8'>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta property="og:locale" content="en_US">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@ZedenZeder">

    <meta property="og:site_name" content="Smash Mapping - Finding Tournaments Near You">
    <meta property="og:title" content="Smash Mapping - Finding Tournaments Near You">
    <meta name="twitter:title" content="Smash Mapping - Finding Tournaments Near You">

    <meta name="description"
          content="Finding in-person tournaments for Smash Bros., Street Fighter, Guilty Gear and more.">
    <meta property="og:description" content="Finding in-person e-sports tournaments, faster and easier.">
    <meta name="twitter:description" content="Finding in-person e-sports tournaments, faster and easier.">

    <meta property="og:url" content="https://www.smash-mapping.com/">
    <meta property="og:image" content="https://i.ibb.co/d2LVJrr/example.png">
    <meta name="twitter:image" content="https://i.ibb.co/d2LVJrr/example.png">
</svelte:head>

<body>
<div class="map">
    <dialog bind:this={showBookmarksDialog}>
        <h3>Make sure to bookmark this page and use Smash Mapping whenever you want to find tournaments!</h3>

        <button on:click={() => showBookmarksDialog.close()}>Close</button>
    </dialog>

    <div class="sidebar-buttons">
        <button class:sidebarSelected="{showFilters}" on:click={() => showSidebar("Filters:")}>
            <img src="sidebar-icons/filter.png" style="width: 40px; height: 45px" alt="filter"></button>

        <button class:sidebarSelected="{showTournaments}" on:click={() =>  showSidebar("Tournaments:")}>
            <img src="sidebar-icons/tournaments.png" style="width: 40px; height: 45px" alt="tournaments"></button>

        <button class:sidebarSelected="{showAccount}" on:click={() =>  showSidebar("Account:")}>
            <img src="sidebar-icons/account.png" style="width: 40px; height: 40px" alt="accounts">
        </button>

        <button class:sidebarSelected="{showHelp}" on:click={() =>  showSidebar("Help:")}>
            <img src="sidebar-icons/questionmark.png" style="width: 40px; height: 40px" alt="question mark">
        </button>
    </div>

    <div class="sidebar" class:sidebarClosed id="tournaments-sidebar">

        <div class="tournaments-title">
            <p style="margin-left: auto">{sidebarTitle}</p>

            <button class:sidebarClosed class="tournaments-sidebar-close-button"
                    on:click={() => sidebarClosed = !sidebarClosed }
                    style="cursor: pointer">>
            </button>
        </div>

        {#if showTournaments && $mapResult !== undefined}
            <TournamentsCard map={map}/>
        {/if}

        {#if showFilters}
            <Search bind:supabase bind:data bind:map/>
        {/if}

        {#if showAccount}
            <Account/>
        {/if}

        {#if showHelp}
            <Help/>
        {/if}
    </div>

    <Map bind:map bind:data/>
</div>

<footer style="height: 30px; display:block;">
    <p style="text-align: center; color: white">Created by: <a
            href="https://twitter.com/ZedenZeder">Sleepy</a></p>
</footer>
</body>

<style>
    * {
        margin: 0;
        padding: 0;
        background-color: #26282B;
    }

    dialog {
        background: white;
        font-family: "Kanit", serif;
        width: 30%;
        border: black 5px solid;
        border-radius: 10px;
        margin: 10px 10px 0 auto;
        padding: 5px;
    }

    dialog > * {
        background: white;
    }

    dialog > button {
        background: #26282B;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 5px;
        margin: 5px;
        cursor: pointer;
    }

    dialog > button:hover {
        background: #3a4142;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
    }

    footer {
        background: #1c1c1c;
        height: 5vh;
    }

    body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        height: 95vh;
        overflow-y: auto;
    }

    a {
        color: white;
        background: none;
    }

    a:hover {
        color: red;
    }

    .map {
        display: flex;
        flex-flow: row nowrap;
        text-align: center;
        height: 90vh;
        position: relative;
        z-index: 0;
    }

    .sidebar {
        color: white;
        height: 100%;
        overflow-y: auto;
        background-color: #2c343c;
        margin: 0 0 3px;
        transition: margin-left 0.5s ease-in-out;
        z-index: 1;
        border-bottom: #222223 solid 3px;
        border-top: #222223 solid 3px;
        position: relative;
        scrollbar-width: none;
    }

    .sidebar-buttons {
        z-index: 2;
        background: #181818;
        width: 3em;
        height: 100%;
        border: #222223 solid 3px;
        border-left: none;
    }

    .sidebar-buttons > button {
        display: block;
        margin: 5px;
        background: #181818;
        border-bottom: #2b2b31 solid 2px;
        border-top: #2b2b31 solid 2px;
        cursor: pointer;
    }

    .sidebar-buttons button > img {
        display: block;
        background: #181818;
        margin: 4px 0 4px 0;
    }

    .sidebar-buttons img:hover,
    .sidebar-buttons button:hover {
        background: #444446;
    }

    .sidebar-buttons .sidebarSelected img,
    .sidebar-buttons .sidebarSelected {
        background: #c91616;
    }

    .sidebar-buttons .sidebarSelected img:hover,
    .sidebar-buttons .sidebarSelected:hover {
        background: #c91616;
    }

    .tournaments-sidebar-close-button {
        background: none;
        border: none;
        color: white;
        font-size: 1.5em;
        transition: transform 0.5s ease-in-out;
        z-index: 1;
        margin: 2px 2px 2px auto;
        background: #2a2d42;
        border-radius: 80%;
        padding: 0 4px 0 4px;
    }

    .tournaments-sidebar-close-button:hover {
        background: #444446;
    }

    .sidebar.sidebarClosed {
        transition: margin 0.5s ease-in-out;
    }

    .tournaments-title {
        font-size: 1.4em;
        background-color: #130c0c;
        display: flex;
        justify-content: center;
        position: sticky;
        top: 0;
        z-index: 9;
    }

    .tournaments-title > p {
        background-color: #130c0c;
        margin-top: 3px;
    }


    /* small screens */
    @media (max-width: 500px) {
        .sidebar {
            width: 240%;
        }

        .sidebar.sidebarClosed {
            margin-left: -185%;
        }

        dialog {
            width: 60%;
        }
    }

    /* large screens */
    @media (min-width: 500px) {
        .sidebar {
            width: 30%;
        }

        .sidebar.sidebarClosed {
            margin-left: -26.5%;
        }
    }

    /*tablet support*/
    @media (min-width: 500px) and (max-width: 1000px) {
        .sidebar {
            width: 70%;
        }

        .sidebar.sidebarClosed {
            margin-left: -60%;
        }
    }
</style>
