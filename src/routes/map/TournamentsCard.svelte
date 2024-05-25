<script>
    import {mapResult} from "../stores.js";

    console.log($mapResult);

    export let map;
    export let sidebarTitleHeight;
    console.log(sidebarTitleHeight)
    let search = "";

    function setMapCentre(lat, lng) {
        map.panTo({lat: lat, lng: lng});
        map.setZoom(10);
    }
</script>

<div>
    <div class="search" style="--sidebarTitleHeight: {sidebarTitleHeight}px">
        <input bind:value={search} type="text" placeholder="Search tournament"/>
    </div>

    {#each $mapResult.filter(tournament =>
        tournament.name.toLowerCase().includes(search.trimStart().toLowerCase())
        || tournament.venueAddress.toLowerCase().includes(search.trimStart().toLowerCase()))
            as tournament}
        <!--Tournament card-->
        <div on:click={() => setMapCentre(tournament.lat, tournament.lng)} class="tournament">

            <a href={tournament.url} target="_blank">{tournament.name}</a>

            <p class="address">
                <img width="30px" height="30px" src="tournament-card-icons/map-marker.png" alt="map-marker">
                {tournament.venueAddress}
            </p>


            <div class="attendees-clock">
                <p class="attendees">
                    <img width="30px" height="30px" src="tournament-card-icons/people.png" alt="people">
                    {tournament.numAttendees}
                </p>

                <p class="clock">
                    <img width="30px" height="30px" src="tournament-card-icons/clock.png" alt="clock">
                    {tournament.startAt}
                </p>
            </div>

        </div>
    {/each}

</div>


<style>
    a {
        background: none;
        color: white;
        text-align: left;
        background: black;
        padding: 4px;
        text-decoration: underline;
        word-wrap: break-word;
    }

    a:hover {
        color: #ff0000;
    }

    p {
        margin-block-start: 0.5em;
        margin-block-end: 0.3em;
    }

    .search {
        margin: 2px 5px 5px 2px;
        padding: 0 5px 5px 5px;
        display: grid;
        position: sticky;
        top: var(--sidebarTitleHeight);
        width: 95%;
    }

    .search input {
        font-size: 16px;
        height: 100%;
        border: 1px solid black;
        border-radius: 5px;

    }

    .tournament {
        cursor: pointer;
        background: #1c1c1c;
        border: #2c343c solid 2px;
        margin: 5px;
        padding: 5px;
        display: grid;
    }

    .address, .attendees, .clock {
        display: flex;
        align-items: center;
        text-align: left;
        font-size: 1em;
        word-break: break-word;
    }

    .attendees {
        white-space: nowrap;
    }

    .attendees-clock {
        display: flex;
    }

    .clock {
        margin-left: 3vw;
    }

    img {
        margin-right: 4px;
    }
</style>